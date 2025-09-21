"use client";

import { useEffect, useState } from "react";
import Card, { CardType } from "../../../components/ui/cardList";
import Image from "next/image";
import api from "@/lib/axios";
import { X } from "lucide-react";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";

const CardPage = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  // For editing
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [formData, setFormData] = useState<Partial<CardType>>({});

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
        if (["photo", "sign", "seal"].includes(key)) return; // skip here
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

  // 🔹 Download functionality
  const handleDownload = async (card: CardType) => {
    const pdf = new jsPDF("p", "mm", "a4");

    const addCardToPdf = async (elementId: string, page: number) => {
      const element = document.getElementById(elementId);
      if (!element) return;

      // 🔹 Temporarily remove flip transform for capture
      const originalTransform = element.style.transform;
      element.style.transform = "rotateY(0deg)";

      const dataUrl = await htmlToImage.toPng(element, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });

      // 🔹 Restore transform after capture
      element.style.transform = originalTransform;

      const img = new window.Image();
      img.src = dataUrl;
      await new Promise((resolve) => (img.onload = resolve));

      const cardWidth = 100;
      const cardHeight = (img.height * cardWidth) / img.width;

      const pageWidth = pdf.internal.pageSize.getWidth();
      const x = (pageWidth - cardWidth) / 2;
      const y = 20;

      if (page > 0) pdf.addPage();
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
      <div className="flex flex-wrap gap-6 justify-center p-6">
        {cards.map((card) => (
          <div key={card._id} className="relative flex flex-col">
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
                className="bg-gray-600 text-white text-sm px-3 py-1 rounded cursor-pointer flex items-center gap-1"
                onClick={() => handleDownload(card)}
              >
                ⬇️
              </button>
            </div>
          </div>
        ))}
      </div>

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
