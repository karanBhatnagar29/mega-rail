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
      format: [420, 270],
    });

    pdf.addImage(imgData, "PNG", 0, 0, 420, 270);
    pdf.save(`${card.employeeName}_${side}.pdf`);
  };

  return (
    <div
      className="w-[420px] h-[270px] cursor-pointer [perspective:1000px]"
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
          {/* Header */}
          <div className="bg-white px-3 py-2 border-b flex items-center">
            {/* Left Logo */}
            <div className="w-16 h-16 flex items-center justify-center shrink-0">
              <img
                src="/mega_rail.png"
                alt="Logo Left"
                width={64}
                height={64}
                className="object-contain max-w-full max-h-full bg-white rounded-full p-1"
              />
            </div>

            {/* Title & Info */}
            <div className="flex-1 text-center px-2 overflow-hidden">
              <h3 className="text-[10.5px] font-bold uppercase text-blue-800 whitespace-nowrap">
                {card.divisionName}
              </h3>
              <p className="text-[10px] text-gray-600">{card.loaNumber}</p>
              <p className="font-semibold text-sm">{card.profileName}</p>
              <div className="bg-red-600 text-white text-xs font-bold py-1 rounded-md mt-1 inline-block px-3">
                IDENTITY CARD
              </div>
            </div>

            {/* Right Logo */}
            <div className="w-16 h-16 flex items-center justify-center shrink-0">
              <img
                src="/railway_logo.png"
                alt="Logo Right"
                width={64}
                height={64}
                className="object-contain max-w-full max-h-full bg-white rounded-full p-1"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex gap-4 p-4 relative">
            {/* Photo with Seal */}
            <div className="flex-shrink-0 relative w-24 h-28">
              {card.photo ? (
                <img
                  src={card.photo}
                  alt="Employee"
                  width={96}
                  height={112}
                  className="w-24 h-28 object-cover border-2 border-gray-400 rounded-md"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-24 h-28 flex items-center justify-center border-2 border-gray-300 rounded-md text-gray-400 text-xs">
                  No Photo
                </div>
              )}
              {/* Seal */}

              {card.seal ? (
                <img
                  src={card.seal}
                  alt="Official Seal"
                  width={64}
                  height={64}
                  className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-16 h-16 object-contain z-10 opacity-80"
                  crossOrigin="anonymous"
                />
              ) : (
                <img
                  src="/SEAL Mega Rail.png"
                  alt="Default Seal"
                  width={64}
                  height={64}
                  className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-16 h-16 object-contain z-10 opacity-60"
                />
              )}
            </div>

            {/* Details */}
            <div className="text-[12px] grid grid-cols-[auto_1fr] gap-x-1 gap-y-1 flex-1">
              <div className="font-semibold">Card No:</div>
              <div>{card.cardNo}</div>

              <div className="font-semibold">Date Issue:</div>
              <div>{format(new Date(card.dateOfIssue), "dd/MM/yyyy")}</div>

              <div className="font-semibold">Employee:</div>
              <div>{card.employeeName}</div>

              <div className="font-semibold">Father:</div>
              <div>{card.fatherName}</div>

              <div className="font-semibold">Designation:</div>
              <div>{card.designation}</div>

              <div className="font-semibold">Contractor:</div>
              <div>{card.contractor}</div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between border-t text-[10px] text-gray-600 px-3 py-1">
            <p>Contractor Stamp</p>
            <p>Employee Signature</p>
          </div>
        </div>

        {/* BACK SIDE (updated to match EmployeeCard layout) */}
        <div
          id={`card-back-${card._id}`}
          className="absolute w-full h-full bg-white border-2 border-gray-400 rounded-xl shadow-lg overflow-hidden p-4 text-[12px] [transform:rotateY(180deg)] [backface-visibility:hidden]"
        >
          {/* Top section: Details + QR (aligned top-left / top-right) */}
          <div className="flex justify-between items-start">
            <div className="space-y-1 text-[11px] text-gray-700">
              <div>
                <span className="font-semibold">Aadhaar:</span>{" "}
                {card.adharCardNumber}
              </div>
              <div>
                <span className="font-semibold">Valid Till:</span>{" "}
                {format(new Date(card.validTill), "dd/MM/yyyy")}
              </div>
              <div>
                <span className="font-semibold">Mobile:</span>{" "}
                {card.mobileNumber}
              </div>
              <div>
                <span className="font-semibold">Address:</span> {card.address}
              </div>
            </div>

            <div className="flex-shrink-0">
              <QRCode value={cardUrl} size={72} />
            </div>
          </div>

          {/* Middle section: Description */}
          <p className="mt-3 text-[11px] text-gray-700 leading-tight">
            {card.description ||
              "Valid for Railway Station, Yard and Coaching Depot of JU, BME BGKT with tools and equipments."}
          </p>

          {/* Bottom section: Railway Official Sign (aligned bottom-right) */}
          <div className="mt-1 flex justify-end">
            <div className="text-center text-[10px] text-gray-600">
              <p className="mb-1">Railway Official Sign</p>
              {card.sign ? (
                <img
                  src={card.sign}
                  alt="Official Signature"
                  width={80}
                  height={40}
                  className="object-contain max-w-[80px] max-h-[40px] mb-2 mx-auto"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="h-[40px] border-b border-gray-300 w-[80px] mb-2 mx-auto"></div>
              )}
              <p>Name : ____________</p>
              <p>Designation : ____________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
