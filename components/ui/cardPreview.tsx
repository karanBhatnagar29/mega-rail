"use client";

import { format } from "date-fns";
import Image from "next/image";
import QRCode from "react-qr-code";

export default function EmployeeCard({ cardData }: { cardData: any }) {
  return (
    <div className="mt-12 flex flex-col gap-6 items-center">
      {/* FRONT SIDE */}
      <div className="w-[420px] bg-white border-2 border-gray-400 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-white text-center px-3 py-2 border-b relative flex items-center justify-between">
          <Image
            src="/mega_rail.png"
            alt="Logo Left"
            width={35}
            height={35}
            className="absolute left-2 top-1"
          />
          <div className="flex-1">
            <h3 className="text-xs font-bold uppercase text-blue-800">
              NORTH WESTERN RAILWAY JODHPUR DIVISION
            </h3>
            <p className="text-[10px] text-gray-600">
              LOA NO. 02 of 2023-24/010010070079589
            </p>
            <p className="font-semibold text-sm">
              M/s. Megarail Power Projects LLP
            </p>
            <div className="bg-red-600 text-white text-xs font-bold py-1 rounded-md mt-1 inline-block px-3">
              IDENTITY CARD
            </div>
          </div>
          <Image
            src="/mega_rail.png"
            alt="Logo Right"
            width={35}
            height={35}
            className="absolute right-2 top-1"
          />
        </div>

        {/* Content */}
        <div className="flex gap-4 p-4 relative">
          {/* Photo with Seal */}
          <div className="flex-shrink-0 relative">
            {cardData.photo ? (
              <img
                src={cardData.photo}
                alt="Employee"
                className="w-24 h-28 object-cover border-2 border-gray-400 rounded-md"
              />
            ) : (
              <div className="w-24 h-28 flex items-center justify-center border-2 border-gray-300 rounded-md text-gray-400 text-xs">
                No Photo
              </div>
            )}
            <Image
              src="/SEAL Mega Rail.png"
              alt="Seal"
              width={70}
              height={70}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-80"
            />
          </div>

          {/* Details */}
          <div className="text-[12px] space-y-1">
            <p>
              <span className="font-semibold">Card No:</span> {cardData.cardNo}
            </p>
            <p>
              <span className="font-semibold">Date Issue:</span>{" "}
              {format(new Date(cardData.dateOfIssue), "dd/MM/yyyy")}
            </p>
            <p>
              <span className="font-semibold">Employee:</span>{" "}
              {cardData.employeeName}
            </p>
            <p>
              <span className="font-semibold">Father:</span>{" "}
              {cardData.fatherName}
            </p>
            <p>
              <span className="font-semibold">Designation:</span>{" "}
              {cardData.designation}
            </p>
            <p>
              <span className="font-semibold">Contractor:</span>{" "}
              {cardData.contractor}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between border-t text-[10px] text-gray-600 px-3 py-1">
          <p>Signature of Contractor with Stamp</p>
          <p>Signature of Employee</p>
        </div>
      </div>

      {/* BACK SIDE */}
      <div className="w-[420px] bg-white border-2 border-gray-400 rounded-xl shadow-lg overflow-hidden p-4 text-[12px]">
        <p>
          <span className="font-semibold">Aadhaar:</span>{" "}
          {cardData.adharCardNumber}
        </p>
        <p>
          <span className="font-semibold">Valid Till:</span>{" "}
          {format(new Date(cardData.validTill), "dd/MM/yyyy")}
        </p>
        <p>
          <span className="font-semibold">Mobile:</span> {cardData.mobileNumber}
        </p>
        <p>
          <span className="font-semibold">Address:</span> {cardData.address}
        </p>

        {/* QR + Instructions */}
        <div className="flex justify-between items-start mt-4">
          <p className="text-[11px] text-gray-700 max-w-[70%]">
            Valid for Railway Station, Yard and Coaching Depot of JU, BME BGKT
            with tools and equipments.
          </p>
          <QRCode value={cardData.adharCardNumber} size={64} />
        </div>

        {/* Signature */}
        <div className="mt-4 text-right text-[10px] text-gray-600">
          <p>Railway Official Sign</p>
          <p>Name : ____________</p>
          <p>Designation : ____________</p>
        </div>
      </div>
    </div>
  );
}
