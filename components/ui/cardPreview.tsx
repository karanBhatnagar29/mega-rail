"use client";

import { useState } from "react";
import { format } from "date-fns";
import QRCode from "react-qr-code";
import { CardType } from "./cardList";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";
import { FileDown, FileImage, FileText } from "lucide-react";

export default function EmployeeCard({ cardData }: { cardData: CardType }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cardUrl = `http://13.202.200.98:3001/card/view/${cardData._id}`;
  // split description at the word 'depot' (case-insensitive)
  const fullDesc =
    cardData.description ||
    "Valid for Railway Station, Yard and Coaching Depot of JU, BME BGKT with tools and equipments.";
  const lowerDesc = fullDesc.toLowerCase();
  const depotIdx = lowerDesc.indexOf("depot");
  const firstDescLine =
    depotIdx !== -1 ? fullDesc.slice(0, depotIdx + "depot".length) : fullDesc;
  const secondDescLine =
    depotIdx !== -1 ? fullDesc.slice(depotIdx + "depot".length).trim() : "";

  // 🔹 Download as PDF
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
        pixelRatio: 2,
      });

      const img = new window.Image();
      img.src = dataUrl;
      await new Promise((resolve) => (img.onload = resolve));

      const pageWidth = pdf.internal.pageSize.getWidth();
      const cardWidth = pageWidth * 0.7;
      const cardHeight = (img.height * cardWidth) / img.width;

      const x = (pageWidth - cardWidth) / 2;
      const y = (pdf.internal.pageSize.getHeight() - cardHeight) / 2;

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
      setMenuOpen(false);
    }
  };

  // 🔹 Download as PNG (both sides centered)
  const handleDownloadPNG = async () => {
    const buttons = document.querySelectorAll(".print-hide");
    buttons.forEach((b) => b.classList.add("hide-in-export"));

    const front = document.getElementById(`card-front-${cardData._id}`);
    const back = document.getElementById(`card-back-${cardData._id}`);
    if (!front || !back) return;

    try {
      const [frontDataUrl, backDataUrl] = await Promise.all([
        htmlToImage.toPng(front, {
          cacheBust: true,
          backgroundColor: "#ffffff",
          pixelRatio: 2,
        }),
        htmlToImage.toPng(back, {
          cacheBust: true,
          backgroundColor: "#ffffff",
          pixelRatio: 2,
        }),
      ]);

      const frontImg = new Image();
      const backImg = new Image();
      frontImg.src = frontDataUrl;
      backImg.src = backDataUrl;

      await Promise.all([
        new Promise((res) => (frontImg.onload = res)),
        new Promise((res) => (backImg.onload = res)),
      ]);

      const pageWidth = 1240;
      const pageHeight = 1754;

      const canvas = document.createElement("canvas");
      canvas.width = pageWidth;
      canvas.height = pageHeight;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, pageWidth, pageHeight);

      const targetWidth = pageWidth * 0.7;
      const frontHeight = (frontImg.height * targetWidth) / frontImg.width;
      const backHeight = (backImg.height * targetWidth) / backImg.width;

      const frontX = (pageWidth - targetWidth) / 2;
      const frontY = pageHeight / 2 - frontHeight - 20;

      const backX = (pageWidth - targetWidth) / 2;
      const backY = pageHeight / 2 + 20;

      ctx.drawImage(frontImg, frontX, frontY, targetWidth, frontHeight);
      ctx.drawImage(backImg, backX, backY, targetWidth, backHeight);

      const mergedDataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = mergedDataUrl;
      link.download = `${cardData.employeeName}_Card.png`;
      link.click();
    } catch (err) {
      console.error("PNG generation failed:", err);
    } finally {
      buttons.forEach((b) => b.classList.remove("hide-in-export"));
      setMenuOpen(false);
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
              <p className="text-[10px] font-bold">{cardData.loaNumber}</p>
              <p className="font-bold text-sm">{cardData.profileName}</p>
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

              {cardData.seal && (
                <img
                  src={cardData.seal}
                  alt="Official Seal"
                  width={64}
                  height={64}
                  className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-16 h-16 object-contain z-10 opacity-80"
                  crossOrigin="anonymous"
                />
              )}
            </div>

            {/* Details */}
            <div className="text-[12px] grid grid-cols-[auto_1fr] gap-x-1 gap-y-1 flex-1">
              <div className="font-bold">Card No:</div>
              <div className="font-bold">{cardData.cardNo}</div>

              <div className="font-bold">Date Issue:</div>
              <div className="font-bold">
                {format(new Date(cardData.dateOfIssue), "dd/MM/yyyy")}
              </div>

              <div className="font-bold">Employee:</div>
              <div className="font-bold">{cardData.employeeName}</div>

              <div className="font-bold">Father:</div>
              <div className="font-bold">{cardData.fatherName}</div>

              <div className="font-bold">Designation:</div>
              <div className="font-bold">{cardData.designation}</div>

              <div className="font-bold">Contractor:</div>
              <div className="font-bold"> {cardData.contractor}</div>
            </div>
          </div>

          {/* 🔹 Signature Section at Bottom */}
          <div className="flex justify-between px-4 pb-2 mt-1 text-[10px]">
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
          id={`card-back-${cardData._id}`}
          className="relative w-[420px] bg-white border-2 border-gray-400 rounded-xl shadow-lg overflow-hidden text-[12px]"
        >
          {/* Blue Strip */}
          <div className="bg-[#2FA4DA] h-10 w-full flex items-center justify-center">
            <p className="text-white text-sm font-semibold">Employee Details</p>
          </div>

          {/* Download button with click menu */}
          <div className="absolute top-2 right-2 print-hide">
            <div className="relative">
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="p-2 bg-blue-600 rounded-full shadow hover:bg-blue-700 text-white"
              >
                <FileDown size={16} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg z-50">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-sm"
                  >
                    <FileText size={14} /> PDF
                  </button>
                  <button
                    onClick={handleDownloadPNG}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-sm"
                  >
                    <FileImage size={14} /> PNG
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-4">
            {/* Top section: Details + QR */}
            <div className="flex justify-between items-start">
              <div className=" text-[12px] grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-center">
                <div className="font-bold">Aadhaar:</div>
                <div className="font-bold">{cardData.adharCardNumber}</div>

                <div className="font-bold">Valid Till:</div>
                <div className="font-bold">
                  {format(new Date(cardData.validTill), "dd/MM/yyyy")}
                </div>

                <div className="font-bold">Mobile:</div>
                <div className="font-bold">{cardData.mobileNumber}</div>

                <div className="font-bold">Address:</div>
                <div className="font-bold">{cardData.address}</div>
              </div>

              <QRCode value={cardUrl} size={72} />
            </div>

            {/* Middle section: split description into two lines */}
            <div className="mt-2 text-[11px] text-gray-700 leading-tight">
              <p className="">{firstDescLine}</p>
              {secondDescLine && <p className="mt-1">{secondDescLine}</p>}
            </div>

            {/* Bottom section: sign higher, name/designation below the sign (right side) */}
            <div className="mt-3 flex justify-between items-start">
              {/* Left column (keeps space and balance; you can put other info here if needed) */}
              <div className="w-1/2"></div>

              {/* Right column: Sign up, Name & Designation below */}
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
                  <div className="h-[40px] w-[80px] mb-2 mx-auto border-b border-gray-300"></div>
                )}

                {/* Name & Designation come below the seal */}
                <p className="font-bold text-left">Sign: _________</p>
                <p className="font-bold text-left">Designation: {cardData.hirer}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
