"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { Button } from "@/components/ui/button";

const CardPage = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

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
  const [policeVerification, setPoliceVerification] = useState("");

  // ❗ Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cardsSyncTimer = useRef<number | null>(null);

  const bloodGroups = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
  ] as const;

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

      // include divisionName and fallback for issuingAuthorityName/hirer
      const initial = {
        ...res.data,
        issuingAuthorityName:
          res.data.issuingAuthorityName ?? res.data.hirer ?? "",
        divisionName: res.data.divisionName ?? "",
      } as Partial<CardType>;

      setFormData(initial);

      if (res.data.policeVerification) {
        const pv = String(res.data.policeVerification);
        setPoliceVerification(
          pv.includes("T") ? pv.split("T")[0] : pv.slice(0, 10)
        );
      } else {
        setPoliceVerification("");
      }

      setPhotoFile(null);
      setSignFile(null);
      setSealFile(null);
      setErrors({});
    } catch (err) {
      console.error("Error fetching card details:", err);
      toast.error("❌ Failed to load card details");
    }
  };

  useEffect(() => {
    return () => {
      if (cardsSyncTimer.current) {
        window.clearTimeout(cardsSyncTimer.current);
        cardsSyncTimer.current = null;
      }
    };
  }, []);

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const target = e.target as HTMLInputElement;
      const { name, value, type } = target;
      if (!name) return;

      // clear error for that field
      setErrors((prev) => {
        if (!prev[name]) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      });

      const nextValue = value ?? "";

      if (type === "date") {
        setFormData((prev) => ({ ...prev, [name]: nextValue }));
        if (name === "policeVerification") setPoliceVerification(nextValue);

        if (editingCard) {
          setEditingCard((prev) =>
            prev ? { ...prev, [name]: nextValue } : prev
          );
        }
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: nextValue }));

      if (editingCard) {
        setEditingCard((prev) =>
          prev ? { ...prev, [name]: nextValue } : prev
        );
      }

      const shouldSyncPreview =
        name === "issuingAuthorityName" ||
        name === "hirer" ||
        name === "employeeName" ||
        name === "designation" ||
        name === "divisionName";
      if (shouldSyncPreview && editingCard) {
        if (name === "issuingAuthorityName") {
          setFormData((prev) => ({ ...prev, hirer: nextValue }));
        }

        if (cardsSyncTimer.current) {
          window.clearTimeout(cardsSyncTimer.current);
        }
        cardsSyncTimer.current = window.setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c._id === editingCard._id
                ? {
                    ...c,
                    ...(name === "issuingAuthorityName"
                      ? { issuingAuthorityName: nextValue, hirer: nextValue }
                      : { [name]: nextValue }),
                  }
                : c
            )
          );
          cardsSyncTimer.current = null;
        }, 180);
      }
    },
    [editingCard]
  );

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

  // ✅ Frontend validation
  const validateForm = (): boolean => {
    if (!editingCard) return false;

    const newErrors: Record<string, string> = {};

    const requiredSimpleFields: (keyof CardType)[] = [
      "cardNo",
      "employeeName",
      "fatherName",
      "designation",
      "divisionName",
      "adharCardNumber",
      "hirer",
      "profileName",
      "mobileNumber",
    ];

    requiredSimpleFields.forEach((field) => {
      const value = (formData )[field] ?? (editingCard)?.[field];

      if (!value || String(value).trim() === "") {
        newErrors[field as string] = "Required";
      }
    });

    // Blood group required
    const bg =
      (formData.bloodGroup as string) ??
      (editingCard.bloodGroup as string) ??
      "";
    if (!bg) {
      newErrors["bloodGroup"] = "Required";
    }

    // Police verification required
    const pv =
      policeVerification ||
      (formData.policeVerification ) ||
      editingCard.policeVerification;
    if (!pv) {
      newErrors["policeVerification"] = "Required";
    }

    // Date of issue required
    const dateOfIssue = formData.dateOfIssue ?? editingCard.dateOfIssue;
    if (!dateOfIssue) {
      newErrors["dateOfIssue"] = "Required";
    }

    // Valid till required
    const validTill = formData.validTill ?? editingCard.validTill;
    if (!validTill) {
      newErrors["validTill"] = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!editingCard) return;

    // First validate
    const isValid = validateForm();
    if (!isValid) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const data = new FormData();

      const explicitKeys = new Set([
        "photo",
        "sign",
        "seal",
        "bloodGroup",
        "policeVerification",
      ]);

      Object.entries(formData).forEach(([key, value]) => {
        if (["photo", "sign", "seal"].includes(key)) return;
        if (explicitKeys.has(key)) return;
        if (value === undefined || value === null) return;

        if (["dateOfIssue", "validTill"].includes(key)) {
          const v = String(value);
          data.append(key, v.includes("T") ? v.split("T")[0] : v);
        } else {
          if (Array.isArray(value)) {
            data.append(key, String(value[0]));
          } else {
            data.append(key, String(value));
          }
        }
      });

      // ensure bloodGroup present (same as before)
      const bg =
        (formData && (formData.bloodGroup as string)) ??
        (editingCard && (editingCard.bloodGroup as string)) ??
        "";
      if (bg) {
        data.append(
          "bloodGroup",
          Array.isArray(bg) ? String(bg[0]) : String(bg)
        );
      } else {
        data.append("bloodGroup", "");
      }

      const pv = policeVerification
        ? policeVerification
        : formData.policeVerification
        ? String(formData.policeVerification).split("T")[0]
        : editingCard?.policeVerification
        ? String(editingCard.policeVerification).split("T")[0]
        : "";

      data.append(
        "policeVerification",
        Array.isArray(pv) ? String(pv[0]) : String(pv)
      );

      if (photoFile) data.append("photo", photoFile);
      if (signFile) data.append("sign", signFile);
      if (sealFile) data.append("seal", sealFile);

      // Now PUT including divisionName (formData already contains it if user edited)
      const res = await api.put(`/card/${editingCard._id}`, data, {
        headers: {
          Authorization: `Bearer ${Cookies.get("auth_token")}`,
        },
      });

      setCards((prev) =>
        prev.map((c) => (c._id === editingCard._id ? res.data : c))
      );

      setEditingCard(null);
      setPhotoFile(null);
      setSignFile(null);
      setSealFile(null);
      setPoliceVerification("");
      setErrors({});
      toast.success("✅ Card updated");
    } catch (err) {
      console.error("Error updating card:", err);
      toast.error("❌ Failed to update card");
    }
  };

  // Helper: wrapper fallback (wrapper-front/back preferred)
  const getFrontWrapper = (card: CardType) =>
    document.getElementById(`wrapper-front-${card._id}`) ||
    document.getElementById(`card-front-${card._id}`);

  const getBackWrapper = (card: CardType) =>
    document.getElementById(`wrapper-back-${card._id}`) ||
    document.getElementById(`card-back-${card._id}`);

  // ---------------------------
  // Minimal reliable capture helper (returns PNG dataUrl)
  // ---------------------------
  async function captureElementToPngDataUrl(
    el: HTMLElement | null,
    pixelRatio = 2
  ): Promise<string | null> {
    if (!el) return null;

    // SAFELY check for document.fonts without using `any`
    const fontsReady = (
      document as unknown as { fonts?: { ready?: Promise<void> } }
    ).fonts?.ready;
    if (fontsReady) {
      try {
        await fontsReady;
      } catch {}
    }

    try {
      const dataUrl = await htmlToImage.toPng(el, {
        pixelRatio,
        cacheBust: true,
        backgroundColor: "#ffffff",
      });
      return dataUrl;
    } catch (err) {
      console.error("captureElementToPngDataUrl error:", err);
      return null;
    }
  }

  // ---------------------------
  // Put front+back side-by-side into one PNG with a visible cut border (no crop marks)
  // ---------------------------
  // ---------------------------
  // Download front and back as two separate PNG files
  // ---------------------------
  // Helper utility to introduce a pause

  // ---------------------------
  // Download front and back as two separate PNG files (Fixed)
  // ---------------------------
  const handleDownloadPNG = async (card: CardType) => {
    setExporting(true);

    try {
      const frontEl = getFrontWrapper(card);

      const backEl = getBackWrapper(card);

      if (!frontEl && !backEl) {
        toast.error("Front/back elements not found");

        setExporting(false);

        return;
      }

      const pixelRatio = Math.max(2, Math.floor(window.devicePixelRatio || 2));

      const frontDataUrl = frontEl
        ? await captureElementToPngDataUrl(frontEl, pixelRatio)
        : null;

      const backDataUrl = backEl
        ? await captureElementToPngDataUrl(backEl, pixelRatio)
        : null;

      if (!frontDataUrl && !backDataUrl) {
        toast.error("Capture failed");

        setExporting(false);

        return;
      }

      const imgs: HTMLImageElement[] = [];

      if (frontDataUrl) {
        const i = new window.Image();

        i.src = frontDataUrl;

        imgs.push(i);
      }

      if (backDataUrl) {
        const i = new window.Image();

        i.src = backDataUrl;

        imgs.push(i);
      }

      await new Promise<void>((resolve, reject) => {
        let loaded = 0;

        imgs.forEach((im) => {
          im.onload = () => {
            if (++loaded === imgs.length) resolve();
          };

          im.onerror = reject;
        });
      });

      const gapPx = Math.round(12 * pixelRatio); // space between front/back

      const contentW =
        (imgs[0]?.width || 0) +
        (imgs[1]?.width || 0) +
        (imgs.length === 2 ? gapPx : 0);

      const contentH = Math.max(imgs[0]?.height || 0, imgs[1]?.height || 0);

      // Generous outer padding so cut border doesn't overlap card artwork

      const outerPad = Math.round(40 * pixelRatio);

      const canvasW = contentW + outerPad * 2;

      const canvasH = contentH + outerPad * 2;

      const canvas = document.createElement("canvas");

      canvas.width = canvasW;

      canvas.height = canvasH;

      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#ffffff";

      ctx.fillRect(0, 0, canvasW, canvasH);

      // start drawing at padded origin

      let x = outerPad;

      const yOrigin = outerPad;

      // draw front normally

      if (imgs[0]) {
        const y = Math.round(yOrigin + (contentH - imgs[0].height) / 2);

        ctx.drawImage(imgs[0], x, y);

        // soft shadow

        drawCropMarksOnCanvas(
          ctx,

          x,

          y,

          imgs[0].width,

          imgs[0].height,

          pixelRatio
        );

        x += imgs[0].width + gapPx;
      }

      // draw back — un-flip horizontally so mirrored capture becomes correct

      if (imgs[1]) {
        const y = Math.round(yOrigin + (contentH - imgs[1].height) / 2);

        ctx.save();

        ctx.translate(x + imgs[1].width, y);

        ctx.scale(-1, 1);

        ctx.drawImage(imgs[1], 0, 0, imgs[1].width, imgs[1].height);

        ctx.restore();

        drawCropMarksOnCanvas(
          ctx,

          x,

          y,

          imgs[1].width,

          imgs[1].height,

          pixelRatio
        );
      }

      const dataUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");

      link.href = dataUrl;

      link.download = `${(card.employeeName || "employee").replace(
        /\s+/g,

        "_"
      )}_front-back.png`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      toast.success("PNG exported (front+back)");
    } catch (err) {
      console.error(err);

      toast.error("❌ PNG export failed");
    } finally {
      setExporting(false);
    }
  };

  // Soft shadow helper

  function drawCropMarksOnCanvas(
    ctx: CanvasRenderingContext2D,

    x: number,

    y: number,

    w: number,

    h: number,

    pixelRatio = 2
  ) {
    const shadowBlur = Math.round(18 * pixelRatio);

    ctx.save();

    ctx.shadowColor = "rgba(0,0,0,0.22)";

    ctx.shadowBlur = shadowBlur;

    ctx.shadowOffsetX = 0;

    ctx.shadowOffsetY = 0;

    ctx.fillStyle = "rgba(255,255,255,0)";

    ctx.fillRect(x, y, w, h);

    ctx.restore();
  }

  function drawCropMarks(
    _pdf: jsPDF,

    _x: number,

    _y: number,

    _w: number,

    _h: number
  ) {
    return;
  }

  const handleDownloadPDF = async (card: CardType) => {
    setExporting(true);
    try {
      const frontEl = getFrontWrapper(card);
      const backEl = getBackWrapper(card);

      if (!frontEl && !backEl) {
        toast.error("Front/back elements not found");
        setExporting(false);
        return;
      }

      // HD ke liye higher pixelRatio
      const pixelRatioForPdf = 4;
      const frontDataUrl = frontEl
        ? await captureElementToPngDataUrl(frontEl, pixelRatioForPdf)
        : null;
      const backDataUrl = backEl
        ? await captureElementToPngDataUrl(backEl, pixelRatioForPdf)
        : null;

      if (!frontDataUrl && !backDataUrl) {
        toast.error("Capture failed");
        setExporting(false);
        return;
      }

      // A4 portrait
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfW = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfH = pdf.internal.pageSize.getHeight(); // 297mm

      // --- TRIPLE SIZE CARD ---
      const baseCardWmm = 54;
      const baseCardHmm = 87.5;
      const scaleFactor = 3; // 3x size
      const cardWmm = baseCardWmm * scaleFactor; // 162mm
      const cardHmm = baseCardHmm * scaleFactor; // 262.5mm

      // Safety: agar kabhi page se bahar chala jaye to thoda clamp
      const finalCardWmm = Math.min(cardWmm, pdfW - 10);
      const finalCardHmm = Math.min(cardHmm, pdfH - 10);

      // --- PAGE 1: FRONT ---
      if (frontDataUrl) {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdfW, pdfH, "F");

        const x = (pdfW - finalCardWmm) / 2;
        const y = (pdfH - finalCardHmm) / 2;

        pdf.addImage(
          frontDataUrl,
          "PNG",
          x,
          y,
          finalCardWmm,
          finalCardHmm,
          undefined,
          "FAST" // better quality
        );
      }

      // --- PAGE 2: BACK ---
      if (backDataUrl) {
        // back ke liye ek aur page
        pdf.addPage();
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdfW, pdfH, "F");

        // Mirror fix + HD flip
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const im = new window.Image();
          im.onload = () => resolve(im);
          im.onerror = reject;
          im.src = backDataUrl;
        });

        const cw = img.width;
        const ch = img.height;

        const off = document.createElement("canvas");
        off.width = cw;
        off.height = ch;

        const offCtx = off.getContext("2d")!;
        offCtx.fillStyle = "#ffffff";
        offCtx.fillRect(0, 0, cw, ch);

        offCtx.save();
        offCtx.translate(cw, 0);
        offCtx.scale(-1, 1); // horizontal flip
        offCtx.drawImage(img, 0, 0, cw, ch);
        offCtx.restore();

        const flippedDataUrl = off.toDataURL("image/png");

        const x = (pdfW - finalCardWmm) / 2;
        const y = (pdfH - finalCardHmm) / 2;

        pdf.addImage(
          flippedDataUrl,
          "PNG",
          x,
          y,
          finalCardWmm,
          finalCardHmm,
          undefined,
          "FAST"
        );
      }

      pdf.save(
        `${(card.employeeName || "employee").replace(
          /\s+/g,
          "_"
        )}_2-page_HD.pdf`
      );
      toast.success("PDF exported (3x size, HD, 2 pages)");
    } catch (err) {
      console.error("PDF export failed:", err);
      toast.error("❌ PDF export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  const CARD_WIDTH = "5.4cm";
  const BUTTONS_WIDTH_PX = 56;

  const requiredFieldKeys = [
    "cardNo",
    "employeeName",
    "fatherName",
    "designation",
    "divisionName",
    "adharCardNumber",
    "issuingAuthorityName",
    "profileName",
    "mobileNumber",
  ];

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
            src="/no-result.webp"
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
        <div className="flex flex-wrap gap-6 justify-center p-1">
          {cards.map((card) => (
            <div
              key={card._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                minWidth: `calc(${CARD_WIDTH} + ${BUTTONS_WIDTH_PX}px)`,
                boxSizing: "border-box",
              }}
            >
              <Card card={card} />

              <div
                style={{
                  width: BUTTONS_WIDTH_PX,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Button
                  onClick={() => handleEditClick(card)}
                  title="Edit"
                  className="bg-blue-500 text-white text-sm px-3 py-2 rounded cursor-pointer"
                  style={{
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                  }}
                >
                  Edit
                </Button>

                <Button
                  onClick={() => handleDownloadPNG(card)}
                  title="Download PNG (front+back)"
                  className="bg-red-600 text-white text-sm px-3 py-2 rounded cursor-pointer"
                  style={{
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                  }}
                  disabled={exporting}
                >
                  PNG
                </Button>

                <Button
                  onClick={() => handleDownloadPDF(card)}
                  title="Download PDF (A4 landscape)"
                  className="bg-green-600 text-white text-sm px-3 py-2 rounded cursor-pointer"
                  style={{
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  disabled={exporting}
                >
                  PDF
                </Button>

                <Button
                  onClick={() => handleDeleteClick(card._id)}
                  title="Delete"
                  className="bg-gray-700 text-white text-sm px-3 py-2 rounded cursor-pointer"
                  style={{
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                  }}
                >
                  Delete
                </Button>
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
            <button
              onClick={() => setEditingCard(null)}
              className="absolute top-3 right-3 text-gray-500 cursor-pointer hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold mb-4">
              Edit {editingCard.employeeName}
            </h2>

            {[
              { key: "cardNo", label: "Card Number" },
              { key: "employeeName", label: "Employee Name" },
              { key: "fatherName", label: "Father Name" },
              { key: "designation", label: "Designation" },
              { key: "divisionName", label: "Issuing Authority Name" },
              { key: "adharCardNumber", label: "Aadhar Card Number" },
              {
                key: "issuingAuthorityName",
                label: "Issuing Authority Designation",
              },
              { key: "profileName", label: "Profile Name" },
            ].map(({ key, label }) => (
              <div key={key} className="mb-3">
                <label className="block text-sm text-gray-700 mb-1">
                  {label}
                  {requiredFieldKeys.includes(key) && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  name={key}
                  value={String(formData[key as keyof CardType] ?? "")}
                  onChange={handleInputChange}
                  className={`w-full border p-2 rounded ${
                    errors[key] ? "border-red-500 bg-red-50" : ""
                  }`}
                />
                {errors[key] && (
                  <p className="text-xs text-red-500 mt-1">{errors[key]}</p>
                )}
              </div>
            ))}

            <div className="mb-3">
              <label className="block text-sm text-gray-700 mb-1">
                Police Verification <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="policeVerification"
                value={policeVerification}
                onChange={(e) => {
                  setPoliceVerification(e.target.value);
                  setFormData((prev) => ({
                    ...prev,
                    policeVerification: e.target.value,
                  }));
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next["policeVerification"];
                    return next;
                  });
                }}
                className={`w-full border p-2 rounded ${
                  errors["policeVerification"] ? "border-red-500 bg-red-50" : ""
                }`}
              />
              {errors["policeVerification"] && (
                <p className="text-xs text-red-500 mt-1">
                  {errors["policeVerification"]}
                </p>
              )}
            </div>

            <div className="mb-3">
              <label className="block text-sm text-gray-700 mb-1">
                Blood Group <span className="text-red-500">*</span>
              </label>

              <select
                name="bloodGroup"
                value={formData.bloodGroup ?? ""}
                onChange={(e) => {
                  handleInputChange(e);
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next["bloodGroup"];
                    return next;
                  });
                }}
                className={`w-full border p-2 rounded ${
                  errors["bloodGroup"] ? "border-red-500 bg-red-50" : ""
                }`}
              >
                <option value="">Select blood group</option>
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
              {errors["bloodGroup"] && (
                <p className="text-xs text-red-500 mt-1">
                  {errors["bloodGroup"]}
                </p>
              )}
            </div>

            <div className="mb-3">
              <label className="block text-sm text-gray-700 mb-1">
                Date of Issue <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dateOfIssue"
                value={
                  formData.dateOfIssue
                    ? String(formData.dateOfIssue).split("T")[0]
                    : ""
                }
                onChange={(e) => {
                  handleInputChange(e);
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next["dateOfIssue"];
                    return next;
                  });
                }}
                className={`w-full border p-2 rounded ${
                  errors["dateOfIssue"] ? "border-red-500 bg-red-50" : ""
                }`}
              />
              {errors["dateOfIssue"] && (
                <p className="text-xs text-red-500 mt-1">
                  {errors["dateOfIssue"]}
                </p>
              )}
            </div>

            <div className="mb-3">
              <label className="block text-sm text-gray-700 mb-1">
                Valid Till <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="validTill"
                value={
                  formData.validTill
                    ? String(formData.validTill).split("T")[0]
                    : ""
                }
                onChange={(e) => {
                  handleInputChange(e);
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next["validTill"];
                    return next;
                  });
                }}
                className={`w-full border p-2 rounded ${
                  errors["validTill"] ? "border-red-500 bg-red-50" : ""
                }`}
              />
              {errors["validTill"] && (
                <p className="text-xs text-red-500 mt-1">
                  {errors["validTill"]}
                </p>
              )}
            </div>

            <div className="mb-3">
              <label className="block text-sm text-gray-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                name="mobileNumber"
                value={formData.mobileNumber || ""}
                onChange={handleInputChange}
                className={`w-full border p-2 rounded ${
                  errors["mobileNumber"] ? "border-red-500 bg-red-50" : ""
                }`}
              />
              {errors["mobileNumber"] && (
                <p className="text-xs text-red-500 mt-1">
                  {errors["mobileNumber"]}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">Photo</label>
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

            <div className="flex justify-end gap-3 mt-5">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setEditingCard(null)}
              >
                Cancel
              </button>
              <Button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleUpdate}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardPage;
