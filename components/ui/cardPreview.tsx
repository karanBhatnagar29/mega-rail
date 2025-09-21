"use client";

import { format } from "date-fns";
import Image from "next/image";
import QRCode from "react-qr-code";
import { CardType } from "./cardList";
import jsPDF from "jspdf";
import { Download } from "lucide-react";
import * as htmlToImage from "html-to-image";

export default function EmployeeCard({ cardData }: { cardData: CardType }) {
  const cardUrl = `http://13.202.200.98:3001/card/view/${cardData._id}`;

  const handleDownloadPDF = async () => {
    const buttons = document.querySelectorAll(".print-hide");
    buttons.forEach((b) => b.classList.add("hide-in-export"));

    const pdf = new jsPDF("p", "mm", "a4");

    const addCardToPdf = async (elementId: string, page: number) => {
      const element = document.getElementById(elementId);
      if (!element) return;

      const dataUrl = await htmlToImage.toPng(element, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2, // sharper export
      });

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
      await addCardToPdf(`card-front-${cardData._id}`, 0);
      await addCardToPdf(`card-back-${cardData._id}`, 1);
      pdf.save(`${cardData.employeeName}_Card.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      buttons.forEach((b) => b.classList.remove("hide-in-export"));
    }
  };

  return (
    <div className="mt-12 flex flex-col gap-6 items-center">
      <div className="flex flex-col gap-6 items-center relative">
        {/* FRONT SIDE */}
        <div
          id={`card-front-${cardData._id}`}
          className="w-[420px] bg-white border-2 border-gray-400 rounded-xl shadow-lg overflow-hidden"
        >
          {/* 🔹 Blue Header */}
          <div className="bg-[#2FA4DA] px-3 py-2 border-b flex items-center text-white">
            <div className="w-16 h-16 flex items-center justify-center shrink-0">
              <img
                src="/mega_rail.png"
                alt="Logo Left"
                width={64}
                height={64}
                className="object-contain max-w-full max-h-full bg-white rounded-full p-1"
              />
            </div>
            <div className="flex-1 text-center px-2 overflow-hidden">
              <h3 className="text-[10.5px] font-bold uppercase whitespace-nowrap text-ellipsis">
                {cardData.divisionName}
              </h3>
              <p className="text-[10px]">{cardData.loaNumber}</p>
              <p className="font-semibold text-sm">{cardData.profileName}</p>
              <div className="bg-red-600 text-white text-xs font-bold py-1 rounded-md mt-1 inline-block px-3">
                IDENTITY CARD
              </div>
            </div>
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
            {/* Profile Photo + Seal */}
            <div className="flex-shrink-0 relative w-24 h-28">
              {cardData.photo ? (
                <img
                  src={cardData.photo}
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

              {cardData.seal ? (
                <img
                  src={cardData.seal}
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
              <div>{cardData.cardNo}</div>

              <div className="font-semibold">Date Issue:</div>
              <div>{format(new Date(cardData.dateOfIssue), "dd/MM/yyyy")}</div>

              <div className="font-semibold">Employee:</div>
              <div>{cardData.employeeName}</div>

              <div className="font-semibold">Father:</div>
              <div>{cardData.fatherName}</div>

              <div className="font-semibold">Designation:</div>
              <div>{cardData.designation}</div>

              <div className="font-semibold">Contractor:</div>
              <div>{cardData.contractor}</div>
            </div>
          </div>
        </div>
        {/* BACK SIDE */}
        <div
          id={`card-back-${cardData._id}`}
          className="relative w-[420px] bg-white border-2 border-gray-400 rounded-xl shadow-lg overflow-hidden text-[12px]"
        >
          {/* Blue Strip */}
          <div className="bg-[#2FA4DA] h-12 w-full flex items-center justify-center">
            <p className="text-white text-sm font-semibold">Employee Details</p>
          </div>

          {/* Download button */}
          <button
            onClick={handleDownloadPDF}
            className="absolute top-2 right-2 p-2 bg-blue-600 rounded-full shadow hover:bg-blue-700 text-white print-hide"
            title="Download PDF"
          >
            <Download size={16} />
          </button>

          <div className="p-4">
            {/* Top section: Details + QR */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div>
                  <span className="font-semibold">Aadhaar:</span>{" "}
                  {cardData.adharCardNumber}
                </div>
                <div>
                  <span className="font-semibold">Valid Till:</span>{" "}
                  {format(new Date(cardData.validTill), "dd/MM/yyyy")}
                </div>
                <div>
                  <span className="font-semibold">Mobile:</span>{" "}
                  {cardData.mobileNumber}
                </div>
                <div>
                  <span className="font-semibold">Address:</span>{" "}
                  {cardData.address}
                </div>
              </div>
              <QRCode value={cardUrl} size={72} />
            </div>

            {/* Middle section: Description */}
            <p className="mt-3 text-[11px] text-gray-700 leading-tight">
              {cardData.description ||
                "Valid for Railway Station, Yard and Coaching Depot of JU, BME BGKT with tools and equipments."}
            </p>

            {/* Bottom section: Railway Official Sign */}
            <div className="mt-1 flex justify-end">
              <div className="text-center text-[10px] text-gray-600">
                <p className="mb-1">Railway Official Sign</p>
                {cardData.sign ? (
                  <img
                    src={cardData.sign}
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
    </div>
  );
}
