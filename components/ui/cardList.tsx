"use client";

import Image from "next/image";
import { useState } from "react";
import QRCode from "react-qr-code";
import { format } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface CardType {
  _id: string;
  employeeName: string;
  fatherName: string;
  designation: string;
  contractor: string;
  adharCardNumber: string;
  dateOfIssue: string;
  validTill: string;
  mobileNumber: string;
  hirer: string;
  address: string;
  cardNo: string;
  photo?: string | undefined;
  seal?: string | undefined;
  sign?: string | undefined;
  divisionName?: string;
  loaNumber?: string;
  profileName?: string;
  description?: string;
}

const Card = ({ card }: { card: CardType }) => {
  const [flipped, setFlipped] = useState(false);
  const cardUrl = `http://13.202.200.98:3001/card/view/${card._id}`;

  const handleDownloadPDF = async (side: "front" | "back") => {
    const element = document.getElementById(
      side === "front" ? `card-front-${card._id}` : `card-back-${card._id}`
    );
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 3 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [420, 260], // ✅ match card size
    });

    pdf.addImage(imgData, "PNG", 0, 0, 420, 260);
    pdf.save(`${card.employeeName}_${side}.pdf`);
  };

  return (
    <div
      className="w-[420px] h-[260px] cursor-pointer [perspective:1000px]"
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* FRONT SIDE */}
        <div
          id={`card-front-${card._id}`}
          className="absolute w-full h-full bg-white border-2 border-gray-400 rounded-xl shadow-lg overflow-hidden [backface-visibility:hidden]"
        >
          {/* 🔹 Blue Header */}
          <div className="bg-[#2FA4DA] px-2 py-1 border-b flex items-center text-white">
            {/* Left Logo */}
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              <img
                src="/mega_rail.png"
                alt="Logo Left"
                width={48}
                height={48}
                className="object-contain max-w-full max-h-full bg-white rounded-full p-1"
              />
            </div>

            {/* Title & Info */}
            <div className="flex-1 text-center px-1 overflow-hidden">
              <h3 className="text-[10px] font-bold uppercase truncate">
                {card.divisionName}
              </h3>
              <p className="text-[9px] font-bold truncate">{card.loaNumber}</p>
              <p className="font-semibold text-xs truncate">
                {card.profileName}
              </p>
              <div className="bg-red-600 text-white text-[9px] font-bold py-0.5 rounded-md mt-1 inline-block px-2">
                IDENTITY CARD
              </div>
            </div>

            {/* Right Logo */}
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              <img
                src="/railway_logo.png"
                alt="Logo Right"
                width={48}
                height={48}
                className="object-contain max-w-full max-h-full bg-white rounded-full p-1"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-3">
            <div className="flex gap-3 relative">
              {/* Photo with Seal */}
              <div className="flex-shrink-0 relative w-20 h-24">
                {card.photo ? (
                  <img
                    src={card.photo}
                    alt="Employee"
                    className="w-20 h-24 object-cover border-2 border-gray-400 rounded-md"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-20 h-24 flex items-center justify-center border-2 border-gray-300 rounded-md text-gray-400 text-[10px]">
                    No Photo
                  </div>
                )}

                {card.seal && (
                  <img
                    src={card.seal}
                    alt="Official Seal"
                    className="absolute bottom-[-18px] left-1/2 -translate-x-1/2 w-14 h-14 object-contain z-10 opacity-80"
                    crossOrigin="anonymous"
                  />
                )}
              </div>

              {/* Details */}
              <div className="text-[11px] grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 flex-1 leading-tight">
                <div className="font-bold">Card No:</div>
                <div className="truncate font-bold">{card.cardNo}</div>

                <div className="font-bold">Date Issue:</div>
                <div className="font-bold">
                  {format(new Date(card.dateOfIssue), "dd/MM/yyyy")}
                </div>

                <div className="font-bold">Employee:</div>
                <div className="truncate font-bold">{card.employeeName}</div>

                <div className="font-bold">Father:</div>
                <div className="truncate font-bold">{card.fatherName}</div>

                <div className="font-bold">Designation:</div>
                <div className="truncate font-bold">{card.designation}</div>

                <div className="font-bold">Contractor:</div>
                <div className="truncate font-bold">{card.contractor}</div>
              </div>
            </div>
          </div>
          <div className="flex justify-between px-4 pb-2 mt-8 text-[10px]">
            <div className="text-center w-1/2">
              <p className="font-bold leading-tight">
                Signature of Contractor with Stamp
              </p>
            </div>
            <div className="text-center w-1/2">
              <p className="font-bold leading-tight">Signature of Employee</p>
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div
          id={`card-back-${card._id}`}
          className="absolute w-full h-full bg-white border-2 border-gray-400 rounded-xl shadow-lg overflow-hidden text-[11px] [transform:rotateY(180deg)] [backface-visibility:hidden]"
        >
          {/* 🔹 Blue Strip */}
          <div className="bg-[#2FA4DA] h-7 w-full flex items-center justify-center">
            <p className="text-white text-xs font-semibold">Employee Details</p>
          </div>

          {/* Content */}
          <div className="p-3">
            {/* Top section: Details + QR */}
            <div className="flex justify-between items-start">
              <div className="space-y-0.5 text-[10px] text-gray-700">
                <div>
                  <span className="font-bold">Aadhaar:</span>{" "}
                  <span className="font-bold"> {card.adharCardNumber}</span>
                </div>
                <div>
                  <span className="font-bold">Valid Till:</span>{" "}
                  <span className="font-bold">
                    {format(new Date(card.validTill), "dd/MM/yyyy")}
                  </span>
                </div>
                <div>
                  <span className="font-bold">Mobile:</span>{" "}
                  <span className="font-bold"> {card.mobileNumber}</span>
                </div>
                <div>
                  <span className="font-bold">Address:</span>{" "}
                  <span className="font-bold">{card.address}</span>
                </div>
              </div>
              <QRCode value={cardUrl} size={70} />
            </div>

            {/* Middle section */}
            <p className="mt-2 text-[10px] font-bold leading-tight">
              {card.description ||
                "Valid for Railway Station, Yard and Coaching Depot of JU, BME BGKT with tools and equipments."}
            </p>

            {/* Bottom section */}
            <div className="mt-2 flex justify-end">
              <div className="text-center text-[9px] text-gray-600 w-[150px]">
                <p className="mb-1">Railway Official Sign</p>

                {/* Signature / Seal */}
                <div className="h-[36px] flex items-center justify-center mb-1">
                  {card.sign ? (
                    <img
                      src={card.sign}
                      alt="Official Signature"
                      className="object-contain max-h-[36px] max-w-[100px]"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="h-[30px] border-b border-gray-300 w-[100px]"></div>
                  )}
                </div>

                {/* Name + Designation */}
                <div className="space-y-1 text-[10px] text-gray-700">
                  <p className="font-bold text-left">Sign: _________</p>
                  <p className="font-bold text-left">
                    Designation: {card.hirer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
