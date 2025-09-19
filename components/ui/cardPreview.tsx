"use client";

import { format } from "date-fns";
import Image from "next/image";
import QRCode from "react-qr-code";
import { CardType } from "./cardList";

export default function EmployeeCard({ cardData }: { cardData: CardType }) {
  // ✅ Generate link for card details page
  const cardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/card/view/${cardData._id}`;

  return (
    <div className="mt-12 flex flex-col gap-6 items-center">
      {/* FRONT SIDE */}
      <div className="w-[420px] bg-white border-2 border-gray-400 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-white px-3 py-2 border-b flex items-center">
          {/* Left Logo */}
          <div className="w-16 h-16 flex items-center justify-center shrink-0">
            <Image
              src="/mega_rail.png"
              alt="Logo Left"
              width={64}
              height={64}
              className="object-contain max-w-full max-h-full"
            />
          </div>

          {/* Title & Info */}
          <div className="flex-1 text-center px-2 overflow-hidden">
            <h3 className="text-[10.5px] font-bold uppercase text-blue-800 whitespace-nowrap text-ellipsis">
              {cardData.divisionName}
            </h3>
            <p className="text-[10px] text-gray-600">{cardData.loaNumber}</p>
            <p className="font-semibold text-sm">{cardData.profileName}</p>
            <div className="bg-red-600 text-white text-xs font-bold py-1 rounded-md mt-1 inline-block px-3">
              IDENTITY CARD
            </div>
          </div>

          {/* Right Logo */}
          <div className="w-16 h-16 flex items-center justify-center shrink-0">
            <Image
              src="/railway_logo.png"
              alt="Logo Right"
              width={50}
              height={64}
              className="object-contain max-w-full max-h-full"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex gap-4 p-4 relative">
          {/* Photo with Seal */}
          <div className="flex-shrink-0 relative">
            {cardData.photo ? (
              <Image
                src={cardData.photo}
                alt="Employee"
                width={96}
                height={112}
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
          <div className="text-[12px] grid grid-cols-2 gap-x-2 gap-y-1 flex-1">
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

        {/* Footer */}
        <div className="flex justify-between border-t text-[10px] text-gray-600 px-3 py-1">
          <p>Signature of Contractor with Stamp</p>
          <p>Signature of Employee</p>
        </div>
      </div>

      {/* BACK SIDE */}
      <div className="w-[420px] bg-white border-2 border-gray-400 rounded-xl shadow-lg overflow-hidden p-4 text-[12px]">
        {/* Back Details aligned */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          <div className="font-semibold">Aadhaar:</div>
          <div>{cardData.adharCardNumber}</div>

          <div className="font-semibold">Valid Till:</div>
          <div>{format(new Date(cardData.validTill), "dd/MM/yyyy")}</div>

          <div className="font-semibold">Mobile:</div>
          <div>{cardData.mobileNumber}</div>

          <div className="font-semibold">Address:</div>
          <div className="col-span-1">{cardData.address}</div>
        </div>

        {/* QR + Instructions */}
        <div className="flex justify-between items-start mt-4">
          <p className="text-[11px] text-gray-700 max-w-[70%]">
            Valid for Railway Station, Yard and Coaching Depot of JU, BME BGKT
            with tools and equipments.
          </p>
          {/* ✅ QR now links to details page */}
          <QRCode value={cardUrl} size={64} />
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
