// components/ui/cardList.tsx
"use client";

import React, { useState } from "react";
import QRCode from "react-qr-code";

export interface CardType {
  _id: string;
  employeeName: string;
  fatherName?: string;
  designation?: string;
  contractor?: string;
  adharCardNumber?: string | number;
  dateOfIssue?: string;
  validTill?: string;
  mobileNumber?: string;
  hirer?: string;
  address?: string;
  cardNo?: string;
  photo?: string | undefined;
  seal?: string | undefined;
  sign?: string | undefined;
  divisionName?: string;
  loaNumber?: string;
  profileName?: string;
  description?: string;
  bloodGroup?: string;
  policeVerification?: string | boolean | Date | null;
}

type Props = {
  card: CardType;
  onEdit?: (card: CardType) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
};

export default function Card({
  card,
  onEdit,
  onDelete,
  showActions = true,
}: Props) {
  const [flipped, setFlipped] = useState(false);

  const cardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/card/view/${card._id}`;

  const ORANGE_COLOR = "#ff6a00";
  const fallbackImage = "/mnt/data/dcc878a1-b711-4227-a41e-c9020e9bdae9.png";

  const CARD_WIDTH = "5.4cm";
  const CARD_HEIGHT = "8.75cm";
  const BUTTONS_WIDTH_PX = 56;

  // formats Aadhaar for display: "xxxx-xxxx-1234"
  const maskedAadhaar = (a?: string | number) => {
    if (!a) return "";
    const s = typeof a === "number" ? String(a) : String(a).replace(/\D/g, "");
    if (s.length < 4) return s;
    return `XXXX-XXXX-${s.slice(-4)}`;
  };

  // formats Aadhaar fully with hyphens for the back side: "1234-5678-9012"
  const formatAadhaar = (a?: string | number) => {
    if (!a) return "";
    const digits =
      typeof a === "number" ? String(a) : String(a).replace(/\D/g, "");
    // Insert hyphens every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, "$1-").slice(0, 14);
  };

  const cardBase: React.CSSProperties = {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 10,
    overflow: "hidden",
    background: "#ffffff",
    boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
    color: "#000",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  };

  const topStripStyle: React.CSSProperties = {
    width: "100%",
    height: "2.5cm",
    background: ORANGE_COLOR,
  };

  const bottomStripStyle: React.CSSProperties = {
    width: "100%",
    height: "0.6cm",
    background: ORANGE_COLOR,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: "auto",
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(card);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(card._id);
  };

  return (
    <div
      style={{
        fontFamily: "Times New Roman, serif",
        display: "flex",
        alignItems: "center",
        gap: 12,
        minWidth: `calc(${CARD_WIDTH} + ${BUTTONS_WIDTH_PX}px)`,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          perspective: 1000,
          flexShrink: 0,
        }}
      >
        <div
          onClick={() => setFlipped((s) => !s)}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
            transition: "transform 0.7s",
            cursor: "pointer",
            borderRadius: 12,
            transform: flipped ? "rotateY(180deg)" : "none",
            boxShadow: flipped ? "0 12px 30px rgba(0,0,0,0.18)" : undefined,
          }}
        >
          {/* FRONT */}
          <div
            id={`card-front-${card._id}`}
            style={{
              ...cardBase,
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              borderRadius: 10,
            }}
          >
            <div
              style={{
                ...topStripStyle,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: "4px",
                paddingBottom: "4px",
                boxSizing: "border-box",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 500, color: "#000" }}>
                INDIAN RAILWAY
              </div>

              <div
                style={{
                  fontSize: "8px",
                  opacity: 0.9,
                  marginTop: 1,
                  color: "#fff",
                }}
              >
                ID CARD No. {card.cardNo || ""}
              </div>
            </div>

            {/* Photo area */}
            <div
              style={{
                height: "60%",
                position: "relative",
                padding: "6% 8% 0 8%",
                boxSizing: "border-box",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "4.2cm",
                  height: "4.6cm",
                  borderRadius: 8,
                  overflow: "hidden",
                  background: "#fff",
                  padding: 2,
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #ddd",
                  marginBottom: 5,
                }}
              >
                <img
                  src={card.photo || fallbackImage}
                  alt="Employee"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "top center",
                    display: "block",
                  }}
                />
              </div>
            </div>

            {/* bottom area with signature box + name + hirer */}
            <div
              style={{
                height: "48%",
                padding: "0 10% 0 10%",
                boxSizing: "border-box",
                color: "#000",
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* signature box */}
              <div
                style={{
                  width: "4.2cm",
                  height: "0.70cm",
                  border: "0.25px solid grey",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "2px auto 2px",
                }}
              >
                <div
                  style={{
                    fontSize: "2.5px",
                    opacity: 0.9,
                    fontWeight: 400,
                    marginTop: 18,
                    textAlign: "center",
                  }}
                >
                  Employee signature
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: 2 }}>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#000",
                  }}
                >
                  {card.employeeName || ""}
                </div>
              </div>

              <div
                style={{
                  position: "absolute",
                  right: "0.2cm",
                  bottom: "0.3cm",
                  textAlign: "right",
                  fontSize: "9px",
                  color: "#1f2937",
                  maxWidth: "50%",
                  lineHeight: 1.05,
                }}
              >
                <div
                  style={{
                    marginTop: 2,
                    fontSize: "6px",
                    fontWeight: 500,
                    color: "#111827",
                    textAlign: "center",
                    marginBottom: 2,
                  }}
                >
                  {" "}
                  {card.hirer || "—"}
                </div>
                <div
                  style={{
                    fontSize: "5px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    marginBottom: 2,
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
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: "100%",
                  height: "15%",
                }}
              />
            </div>
          </div>

          {/* BACK */}
          <div
            id={`card-back-${card._id}`}
            style={{
              ...cardBase,
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              borderRadius: 10,
            }}
          >
            <div
              style={{
                height: "62%",
                padding: "6% 8% 0 8%",
                boxSizing: "border-box",
                color: "#000",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "3px",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: "3cm",
                    height: "2.35cm",
                    background: "#fff",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 4,
                    boxSizing: "border-box",
                    border: "1px solid #ddd",
                  }}
                >
                  <QRCode value={cardUrl} size={70} />
                </div>

                <div style={{ flex: 1 }} />

                <div
                  style={{
                    width: "3cm",
                    height: "2.35cm",
                    background: "#fff",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#000",
                    fontWeight: 800,
                    fontSize: "38px",
                    border: "1px solid #ddd",
                  }}
                >
                  {card.bloodGroup || "-"}
                </div>
              </div>

              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "4.95cm",
                    textAlign: "center",
                    background: "#fff",
                    color: "#222",
                    padding: "6px 4px",
                    fontWeight: 900,
                    fontSize: 18,
                    borderRadius: 6,
                    border: "1px solid #ddd",
                  }}
                >
                  {card.designation || "DEPARTMENT"}
                </div>
              </div>

              <div
                style={{
                  marginTop: 10,
                  textAlign: "center",
                  fontWeight: 900,
                  fontSize: 24,
                  color: "#000",
                }}
              >
                {card.mobileNumber || ""}
              </div>

              <div
                style={{
                  marginTop: 6,
                  marginBottom: "6px",
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#000",
                }}
              >
                {formatAadhaar(card.adharCardNumber) || ""}
              </div>

              <div
                style={{
                  width: "60%",
                  height: "0.5px",
                  background: "#000",
                  margin: "1.5px auto",
                  marginBottom: "10px",
                  opacity: 0.6,
                }}
              />
            </div>

            <div
              style={{
                height: "38%",
                padding: "4% 10% 0 10%",
                boxSizing: "border-box",
                color: "#000",
                textAlign: "center",
                lineHeight: "1.4",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
              }}
            >
              <div style={{ fontSize: 7.5, fontWeight: 700, marginTop: 40 }}>
                Instruction:
              </div>
              <div style={{ fontSize: 6.5, marginTop: "9px" }}>
                Please surrender this identity card to issuing authority on
                completion/termination of contractual services.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {showActions && (onEdit || onDelete) && (
        <div
          style={{
            width: BUTTONS_WIDTH_PX,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            alignItems: "center",
            justifyContent: "center",
            height: CARD_HEIGHT,
            boxSizing: "border-box",
            flexShrink: 0,
          }}
        >
          {onEdit && (
            <button
              onClick={handleEdit}
              title="Edit"
              style={{
                background: "#1e90ff",
                color: "#fff",
                borderRadius: 6,
                padding: "8px 10px",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              ✏️
            </button>
          )}

          {onDelete && (
            <button
              onClick={handleDelete}
              title="Delete"
              style={{
                background: "#6b7280",
                color: "#fff",
                borderRadius: 6,
                padding: "8px 10px",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              🗑
            </button>
          )}
        </div>
      )}
    </div>
  );
}
