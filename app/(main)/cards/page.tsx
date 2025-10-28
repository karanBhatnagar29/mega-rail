"use client";

import { useEffect, useState } from "react";
import Card, { CardType } from "../../../components/ui/cardList";
import Image from "next/image";
import api from "@/lib/axios";
import { X } from "lucide-react";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";
import Cookies from "js-cookie";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const CardPage = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  // For editing
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [formData, setFormData] = useState<Partial<CardType>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // File states
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [signFile, setSignFile] = useState<File | null>(null);
  const [sealFile, setSealFile] = useState<File | null>(null);

  // Fetch all cards
  useEffect(() => {
    api
      .get("/card")
      .then((res) => {
        setCards(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching cards:", err);
        setLoading(false);
      });
  }, []);

  const handleSearch = async (query: string) => {
    try {
      if (!query) {
        // If empty, fetch all cards
        const res = await api.get("/card");
        setCards(res.data);
        return;
      }

      const res = await api.get(`/card/search?q=${encodeURIComponent(query)}`);
      setCards(res.data);
      setNoResults(res.data.length === 0);
    } catch (err) {
      console.error("Search failed:", err);
      toast.error("❌ Search failed");
    }
  };

  const handleEditClick = async (card: CardType) => {
    try {
      const res = await api.get(`/card/${card._id}`);
      setEditingCard(res.data);
      setFormData(res.data); // preload all fields
      setPhotoFile(null);
      setSignFile(null);
      setSealFile(null);
    } catch (err) {
      console.error("Error fetching card details:", err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "photo" | "sign" | "seal"
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (type === "photo") setPhotoFile(file);
      if (type === "sign") setSignFile(file);
      if (type === "seal") setSealFile(file);
    }
  };

  const handleUpdate = async () => {
    if (!editingCard) return;

    try {
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (["photo", "sign", "seal"].includes(key)) return;
        if (value !== undefined && value !== null) {
          data.append(key, value as string);
        }
      });

      if (photoFile) data.append("photo", photoFile);
      if (signFile) data.append("sign", signFile);
      if (sealFile) data.append("seal", sealFile);

      const res = await api.put(`/card/${editingCard._id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCards((prev) =>
        prev.map((c) => (c._id === editingCard._id ? res.data : c))
      );

      setEditingCard(null);
      setPhotoFile(null);
      setSignFile(null);
      setSealFile(null);
    } catch (err) {
      console.error("Error updating card:", err);
    }
  };

  // 🔹 PDF Download
  // 🔹 PDF Download (real physical size)
  const handleDownloadPDF = async (card: CardType) => {
    // Convert cm → mm (since jsPDF works in mm)
    const pdfWidth = 9.398 * 10; // 93.98 mm
    const pdfHeight = 5.842 * 10; // 58.42 mm
    const cardWidth = 8.5725 * 10; // 85.725 mm
    const cardHeight = 5.3975 * 10; // 53.975 mm

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [pdfWidth, pdfHeight],
    });

    const addCardToPdf = async (elementId: string, page: number) => {
      const element = document.getElementById(elementId);
      if (!element) return;

      // temporarily reset transform to avoid mirrored back
      const originalTransform = element.style.transform;
      element.style.transform = "rotateY(0deg)";

      const dataUrl = await htmlToImage.toPng(element, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });

      element.style.transform = originalTransform;

      const x = (pdfWidth - cardWidth) / 2;
      const y = (pdfHeight - cardHeight) / 2;

      if (page > 0) pdf.addPage([pdfWidth, pdfHeight], "landscape");
      pdf.addImage(dataUrl, "PNG", x, y, cardWidth, cardHeight);
    };

    try {
      await addCardToPdf(`card-front-${card._id}`, 0);
      await addCardToPdf(`card-back-${card._id}`, 1);
      pdf.save(`${card.employeeName}_Card.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id); // open the confirm box
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/card/${deleteId}`, {
        headers: { Authorization: `Bearer ${Cookies.get("auth_token")}` },
      });

      setCards((prev) => prev.filter((c) => c._id !== deleteId));
      setDeleteId(null);

      toast.success("✅ Card deleted successfully!", {
        description: "The card has been permanently removed.",
      });
    } catch (err) {
      console.error("Error deleting card:", err);
      toast.error("❌ Failed to delete card", {
        description: "Something went wrong while deleting the card.",
      });
    }
  };

  // 🔹 PNG Download
  const handleDownloadPNG = async (card: CardType) => {
    const captureElement = async (id: string): Promise<HTMLImageElement> => {
      const element = document.getElementById(id);
      if (!element) throw new Error(`Element ${id} not found`);

      const originalTransform = element.style.transform;
      element.style.transform = "rotateY(0deg)";

      const dataUrl = await htmlToImage.toPng(element, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });

      element.style.transform = originalTransform;

      return new Promise((resolve) => {
        const img = document.createElement("img");
        img.src = dataUrl;
        img.onload = () => resolve(img);
      });
    };

    try {
      const frontImg = await captureElement(`card-front-${card._id}`);
      const backImg = await captureElement(`card-back-${card._id}`);

      const padding = 20;
      const width = Math.max(frontImg.width, backImg.width) + padding * 2;
      const height = frontImg.height + backImg.height + padding * 3;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);

      ctx.drawImage(frontImg, (width - frontImg.width) / 2, padding);
      ctx.drawImage(
        backImg,
        (width - backImg.width) / 2,
        frontImg.height + padding * 2
      );

      const finalPng = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = finalPng;
      link.download = `${card.employeeName}_Card.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("PNG generation failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold text-center py-6">Employee ID Cards</h1>
      <div className="flex justify-center p-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          placeholder="Search by Name or Mobile Number"
          className="w-full max-w-md border p-2 rounded"
        />
      </div>
      {noResults ? (
        <div className="flex flex-col items-center justify-center mt-20">
          <img
            src="/no-result.webp" // optional illustration
            alt="No Results"
            className="w-48 h-48 mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-700">
            No search results found
          </h2>
          <p className="text-gray-500 mt-2">
            Try searching with a different name or number
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6 justify-center p-6">
          {cards.map((card) => (
            <div key={card._id} className="relative flex flex-col items-center">
              {/* Each card UI */}
              <Card card={card} />

              {/* Action Buttons */}
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-blue-500 text-white text-sm px-3 py-1 rounded cursor-pointer"
                  onClick={() => handleEditClick(card)}
                >
                  ✏️
                </button>

                <button
                  className="bg-red-600 text-white text-sm px-3 py-1 rounded cursor-pointer"
                  onClick={() => handleDownloadPDF(card)}
                >
                  📄 PDF
                </button>

                <button
                  className="bg-green-600 text-white text-sm px-3 py-1 rounded cursor-pointer"
                  onClick={() => handleDownloadPNG(card)}
                >
                  🖼 PNG
                </button>

                <button
                  className="bg-gray-700 text-white text-sm px-3 py-1 rounded cursor-pointer"
                  onClick={() => handleDeleteClick(card._id)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The card will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Modal */}
      {editingCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center overflow-y-auto z-50">
          <div className="bg-white p-6 rounded shadow-md w-[500px] max-h-[90vh] overflow-y-auto relative">
            {/* Cross Button */}
            <button
              onClick={() => setEditingCard(null)}
              className="absolute top-3 right-3 text-gray-500 cursor-pointer hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold mb-4">
              Edit {editingCard.employeeName}
            </h2>

            {/* Inputs */}
            {[
              "cardNo",
              "employeeName",
              "fatherName",
              "designation",
              "contractor",
              "adharCardNumber",
              "divisionName",
              "loaNumber",
              "profileName",
            ].map((field) => (
              <input
                key={field}
                name={field}
                value={formData[field as keyof CardType] || ""}
                onChange={handleInputChange}
                placeholder={field}
                className="w-full border p-2 mb-2 rounded"
              />
            ))}

            {/* Date Fields */}
            <label className="block text-sm text-gray-600">Date of Issue</label>
            <input
              type="date"
              name="dateOfIssue"
              value={
                formData.dateOfIssue ? formData.dateOfIssue.split("T")[0] : ""
              }
              onChange={handleInputChange}
              className="w-full border p-2 mb-2 rounded"
            />
            <label className="block text-sm text-gray-600">Valid Till</label>
            <input
              type="date"
              name="validTill"
              value={formData.validTill ? formData.validTill.split("T")[0] : ""}
              onChange={handleInputChange}
              className="w-full border p-2 mb-2 rounded"
            />

            <input
              name="mobileNumber"
              value={formData.mobileNumber || ""}
              onChange={handleInputChange}
              placeholder="Mobile Number"
              className="w-full border p-2 mb-2 rounded"
            />
            <textarea
              name="description"
              value={String(formData.description ?? "")}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Description"
              className="w-full border p-2 mb-2 rounded h-24 resize-none"
            />

            {/* PHOTO */}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "photo")}
                className="w-full cursor-pointer"
              />
              {editingCard.photo && !photoFile && (
                <Image
                  src={editingCard.photo}
                  alt="Current"
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded mt-2 object-cover"
                />
              )}
              {photoFile && (
                <Image
                  src={URL.createObjectURL(photoFile)}
                  alt="Preview"
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded mt-2 object-cover"
                />
              )}
            </div>

            {/* SIGN */}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">
                Signature
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "sign")}
                className="w-full cursor-pointer"
              />
              {editingCard.sign && !signFile && (
                <Image
                  src={editingCard.sign}
                  alt="Current Signature"
                  width={96}
                  height={48}
                  className="mt-2 object-contain border"
                />
              )}
              {signFile && (
                <Image
                  src={URL.createObjectURL(signFile)}
                  alt="Preview Signature"
                  width={96}
                  height={48}
                  className="mt-2 object-contain border"
                />
              )}
            </div>

            {/* SEAL */}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Seal</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "seal")}
                className="w-full cursor-pointer"
              />
              {editingCard.seal && !sealFile && (
                <Image
                  src={editingCard.seal}
                  alt="Current Seal"
                  width={96}
                  height={96}
                  className="mt-2 object-contain border"
                />
              )}
              {sealFile && (
                <Image
                  src={URL.createObjectURL(sealFile)}
                  alt="Preview Seal"
                  width={96}
                  height={96}
                  className="mt-2 object-contain border"
                />
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded cursor-pointer"
                onClick={() => setEditingCard(null)}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
                onClick={handleUpdate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardPage;
