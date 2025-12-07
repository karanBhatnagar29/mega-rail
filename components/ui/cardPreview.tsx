"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { CardType } from "./cardList";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";

export default function EmployeeCard({ cardData }: { cardData: CardType }) {
  const [exporting, setExporting] = useState(false);
  const cardUrl = `http://13.202.200.98:3001/card/view/${cardData._id}`;

  const ORANGE_COLOR = "#ff6a00";
  const fallbackImage = "/mnt/data/dcc878a1-b711-4227-a41e-c9020e9bdae9.png";

  const formatAadhaar = (a?: string | number) => {
    if (!a) return "";
    const digits =
      typeof a === "number" ? String(a) : String(a).replace(/\D/g, "");
    return digits.replace(/(\d{4})(?=\d)/g, "$1-").slice(0, 14);
  };

  // ----------------------------
  // Helpers: wrapper IDs (we capture wrappers)
  // ----------------------------
  const wrapperFrontId = `wrapper-front-${cardData._id}`;
  const wrapperBackId = `wrapper-back-${cardData._id}`;

  // ----------------------------
  // Export: combined PNG (front + back stacked)
  // ----------------------------
  const handleDownloadBothPNG = async () => {
    setExporting(true);
    try {
      const frontEl = document.getElementById(wrapperFrontId);
      const backEl = document.getElementById(wrapperBackId);

      if (!frontEl || !backEl) {
        console.error("wrapper elements not found");
        setExporting(false);
        return;
      }

      const pixelRatio = Math.max(2, Math.floor(window.devicePixelRatio || 2));
      const frontPng = await htmlToImage.toPng(frontEl, {
        pixelRatio,
        cacheBust: true,
      });
      const backPng = await htmlToImage.toPng(backEl, {
        pixelRatio,
        cacheBust: true,
      });

      const img1 = new Image();
      const img2 = new Image();

      await new Promise<void>((resolve, reject) => {
        let loaded = 0;
        img1.onload = () => {
          if (++loaded === 2) resolve();
        };
        img1.onerror = reject;
        img2.onload = () => {
          if (++loaded === 2) resolve();
        };
        img2.onerror = reject;
        img1.src = frontPng;
        img2.src = backPng;
      });

      // create canvas tall enough to stack both images with 10px gap
      const gap = Math.round(8 * pixelRatio); // small visual gap
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(img1.width, img2.width);
      canvas.height = img1.height + gap + img2.height;

      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img1, Math.floor((canvas.width - img1.width) / 2), 0);
      ctx.drawImage(
        img2,
        Math.floor((canvas.width - img2.width) / 2),
        img1.height + gap
      );

      const finalPng = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${(cardData.employeeName || "employee").replace(
        /\s+/g,
        "_"
      )}_CARD.png`;
      link.href = finalPng;
      link.click();
    } catch (err) {
      console.error("PNG export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  // ----------------------------
  // Export: separate front/back PNG
  // ----------------------------
  const handleDownloadPNG = async () => {
    setExporting(true);
    try {
      const frontEl = document.getElementById(wrapperFrontId);
      const backEl = document.getElementById(wrapperBackId);
      if (!frontEl || !backEl) {
        console.error("wrapper elements not found");
        setExporting(false);
        return;
      }

      const pixelRatio = Math.max(2, Math.floor(window.devicePixelRatio || 2));
      const frontPng = await htmlToImage.toPng(frontEl, {
        pixelRatio,
        cacheBust: true,
      });
      const backPng = await htmlToImage.toPng(backEl, {
        pixelRatio,
        cacheBust: true,
      });

      const link1 = document.createElement("a");
      link1.download = `${(cardData.employeeName || "employee").replace(
        /\s+/g,
        "_"
      )}_front.png`;
      link1.href = frontPng;
      link1.click();

      const link2 = document.createElement("a");
      link2.download = `${(cardData.employeeName || "employee").replace(
        /\s+/g,
        "_"
      )}_back.png`;
      link2.href = backPng;
      link2.click();
    } catch (err) {
      console.error("PNG export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  // ----------------------------
  // Export: PDF (two pages). We capture wrappers so guides are included.
  // ----------------------------
  const handleDownloadPDF = async () => {
    setExporting(true);
    try {
      const cardWidthMM = 54 * 3;
      const cardHeightMM = 87.5 * 3;
      const marginMM = 5;
      const pageWidthMM = cardWidthMM + marginMM * 2;
      const pageHeightMM = cardHeightMM + marginMM * 2;
      const pixelRatio = Math.max(2, Math.floor(window.devicePixelRatio || 2));

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pageWidthMM, pageHeightMM],
      });

      const capture = async (el: HTMLElement | null) => {
        if (!el) return null;
        return await htmlToImage.toPng(el, { pixelRatio, cacheBust: true });
      };

      const frontEl = document.getElementById(wrapperFrontId);
      const backEl = document.getElementById(wrapperBackId);

      const frontPng = await capture(frontEl);
      const backPng = await capture(backEl);

      if (frontPng) {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidthMM, pageHeightMM, "F");
        pdf.addImage(
          frontPng,
          "PNG",
          marginMM,
          marginMM,
          cardWidthMM,
          cardHeightMM
        );
      }

      if (backPng) {
        pdf.addPage([pageWidthMM, pageHeightMM], "portrait");
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidthMM, pageHeightMM, "F");
        pdf.addImage(
          backPng,
          "PNG",
          marginMM,
          marginMM,
          cardWidthMM,
          cardHeightMM
        );
      }

      pdf.save(
        `${(cardData.employeeName || "employee").replace(/\s+/g, "_")}_Card.pdf`
      );
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  // ----------------------------
  // Styles for inner card
  // ----------------------------
  const cardBase: React.CSSProperties = {
    width: "5.4cm",
    height: "8.75cm",
    borderRadius: 10,
    overflow: "hidden",
    background: "#ffffff",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
    color: "#000",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  };

  const topStripStyle: React.CSSProperties = {
    width: "100%",
    height: "2.5cm",
    background: ORANGE_COLOR,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  };

  const bottomStripStyle: React.CSSProperties = {
    width: "100%",
    height: "0.6cm",
    background: ORANGE_COLOR,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  };

  // ----------------------------
  // Cut guides wrapper style (outer guides)
  // ----------------------------
  const wrapperStyle: React.CSSProperties = {
    position: "relative",
    display: "inline-block",
    padding: "10px", // space between card and the dashed cut-box
    background: "transparent",
  };

  const outerDashedStyle: React.CSSProperties = {
    position: "absolute",
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    border: "1px dashed rgba(0,0,0,0.2)",
    borderRadius: 8,
    pointerEvents: "none",
    boxSizing: "border-box",
  };

  const cornerMark = (pos: "tl" | "tr" | "bl" | "br") => {
    const base: React.CSSProperties = {
      width: 16,
      height: 16,
      position: "absolute",
      pointerEvents: "none",
    };
    if (pos === "tl")
      return {
        ...base,
        top: 0,
        left: 0,
        borderTop: "2px solid rgba(0,0,0,0.35)",
        borderLeft: "2px solid rgba(0,0,0,0.35)",
      };
    if (pos === "tr")
      return {
        ...base,
        top: 0,
        right: 0,
        borderTop: "2px solid rgba(0,0,0,0.35)",
        borderRight: "2px solid rgba(0,0,0,0.35)",
      };
    if (pos === "bl")
      return {
        ...base,
        bottom: 0,
        left: 0,
        borderBottom: "2px solid rgba(0,0,0,0.35)",
        borderLeft: "2px solid rgba(0,0,0,0.35)",
      };
    return {
      ...base,
      bottom: 0,
      right: 0,
      borderBottom: "2px solid rgba(0,0,0,0.35)",
      borderRight: "2px solid rgba(0,0,0,0.35)",
    };
  };

  return (
    <div
      style={{ fontFamily: "Times New Roman, serif" }}
      className="flex flex-col items-center gap-6 mt-6"
    >
      <div className="flex gap-12 items-start">
        {/* FRONT wrapper containing guides + card */}
        <div id={wrapperFrontId} style={wrapperStyle} aria-hidden={false}>
          {/* outer dashed cut border (outside the card content) */}
          <div style={outerDashedStyle} />

          {/* corner marks */}
          <div style={cornerMark("tl")} />
          <div style={cornerMark("tr")} />
          <div style={cornerMark("bl")} />
          <div style={cornerMark("br")} />

          {/* actual card content (kept identical to your design) */}
          <div id={`card-front-inner-${cardData._id}`} style={cardBase}>
            <div style={topStripStyle}>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "#000" }}>
                INDIAN RAILWAY
              </div>
              <div
                style={{
                  fontSize: "8px",
                  opacity: 0.9,
                  color: "#fff",
                  marginTop: 4,
                }}
              >
                ID CARD No. {cardData.cardNo || ""}
              </div>
            </div>

            <div
              style={{
                padding: "6% 8% 0 8%",
                height: "60%",
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div
                  style={{
                    width: "4.2cm",
                    height: "4.4cm",
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "#fff",
                    border: "1px solid #e6e6e6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={cardData.photo || fallbackImage}
                    alt="Employee"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top center",
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "0 10%",
                height: "48%",
                position: "relative",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  width: "4.2cm",
                  height: "0.7cm",
                  border: "0.3px solid rgba(0,0,0,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "3px auto 0px auto",
                  background: "#fff",
                }}
              >
                <div style={{ fontSize: "2.8px", opacity: 0.9 }}>
                  Employee Signature
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: 0 }}>
                <div style={{ fontSize: "16px", fontWeight: 700 }}>
                  {cardData.employeeName || ""}
                </div>
              </div>

              <div
                style={{
                  position: "absolute",
                  right: "0.2cm",
                  bottom: "0.6cm",
                  textAlign: "right",
                  fontSize: "7px",
                  color: "#111827",
                  lineHeight: 1,
                }}
              >
                {" "}
                <div style={{ fontSize: "6px", fontWeight: 500, marginTop: 2 }}>
                  {cardData.hirer || "—"}
                </div>
                <div
                  style={{
                    fontSize: "6px",
                    fontWeight: 700,
                    textAlign: "start",
                  }}
                >
                  Issuing Authority
                </div>
              </div>

              <div
                style={{
                  ...bottomStripStyle,
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                }}
              />
            </div>
          </div>
        </div>

        {/* BACK wrapper containing guides + card */}
        <div id={wrapperBackId} style={wrapperStyle}>
          <div style={outerDashedStyle} />
          <div style={cornerMark("tl")} />
          <div style={cornerMark("tr")} />
          <div style={cornerMark("bl")} />
          <div style={cornerMark("br")} />

          <div id={`card-back-inner-${cardData._id}`} style={cardBase}>
            <div
              style={{
                padding: "6% 8% 0 8%",
                height: "62%",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    width: "3cm",
                    height: "2.35cm",
                    borderRadius: 6,
                    border: "1px solid #e6e6e6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#fff",
                  }}
                >
                  <QRCode value={cardUrl} size={58} />
                </div>

                <div style={{ flex: 1 }} />

                <div
                  style={{
                    width: "3cm",
                    height: "2.35cm",
                    borderRadius: 6,
                    border: "1px solid #e6e6e6",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "36px",
                    fontWeight: 800,
                  }}
                >
                  {cardData.bloodGroup || "-"}
                </div>
              </div>

              <div style={{ marginTop: 8, textAlign: "center" }}>
                <div
                  style={{
                    width: "4.95cm",
                    margin: "0 auto",
                    padding: "6px 4px",
                    fontSize: 12,
                    fontWeight: 900,
                    border: "1px solid #e6e6e6",
                    borderRadius: 6,
                    background: "#fff",
                  }}
                >
                  {cardData.designation || "DEPARTMENT"}
                </div>
              </div>

              <div
                style={{
                  marginTop: 10,
                  textAlign: "center",
                  fontSize: 24,
                  fontWeight: 900,
                }}
              >
                {cardData.mobileNumber || ""}
              </div>

              <div
                style={{
                  marginTop: 6,
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {formatAadhaar(cardData.adharCardNumber) || ""}
              </div>

              <div
                style={{
                  width: "60%",
                  height: "0.5px",
                  background: "#000",
                  opacity: 0.12,
                  margin: "10px auto",
                }}
              />
            </div>

            <div
              style={{
                height: "38%",
                padding: "6px 10% 8px 10%",
                boxSizing: "border-box",
                textAlign: "center",
                fontSize: 7,
              }}
            >
              <div style={{ fontSize: 7, fontWeight: 700, marginTop: 6 }}>
                Instruction:
              </div>
              <div style={{ fontSize: 7, marginTop: 4, lineHeight: 1.2 }}>
                Please surrender this identity card to issuing authority on
                completion/termination of contractual services.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <button
          onClick={handleDownloadBothPNG}
          disabled={exporting}
          style={{
            padding: "10px 20px",
            background: "#ff6a00",
            color: "white",
            borderRadius: 6,
            border: "none",
            fontWeight: 700,
          }}
        >
          {exporting ? "Exporting…" : "Download BOTH (PNG)"}
        </button>

        {/* <button
          onClick={handleDownloadPNG}
          disabled={exporting}
          style={{
            padding: "10px 20px",
            background: "#ff8800",
            color: "white",
            borderRadius: 6,
            border: "none",
            fontWeight: 700,
          }}
        >
          {exporting ? "Exporting…" : "Download Separate PNGs"}
        </button> */}

        <button
          onClick={handleDownloadPDF}
          disabled={exporting}
          style={{
            padding: "10px 20px",
            background: "#e65a00",
            color: "white",
            borderRadius: 6,
            border: "none",
            fontWeight: 700,
          }}
        >
          {exporting ? "Preparing PDF…" : "Download PDF"}
        </button>
      </div>
    </div>
  );
}
