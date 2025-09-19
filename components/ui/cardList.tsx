"use client";

import Image from "next/image";
import { useState } from "react";
import QRCode from "react-qr-code";
import { format } from "date-fns";

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
  photo?: string;
  divisionName?: string;
  loaNumber?: string;
  profileName?: string;
  description?: string;
}

const Card = ({ card }: { card: CardType }) => {
  const [flipped, setFlipped] = useState(false);
  const cardUrl = `http://13.202.200.98:3001/card/view/${card._id}`;

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
        <div className="absolute w-full h-full bg-white border-2 border-gray-400 rounded-xl shadow-lg overflow-hidden [backface-visibility:hidden]">
          {/* Header */}
          <div className="bg-white px-3 py-2 border-b flex items-center">
            {/* Left Logo */}
            <div className="w-16 h-16 flex items-center justify-center shrink-0">
              <Image
                src="/mega_rail.png"
                alt="Logo Left"
                width={64}
                height={64}
                className="object-contain"
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
              <Image
                src="/railway_logo.png"
                alt="Logo Right"
                width={50}
                height={64}
                className="object-contain"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex gap-4 p-4 relative">
            {/* Photo with Seal */}
            <div className="flex-shrink-0 relative">
              {card.photo ? (
                <Image
                  src={card.photo}
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
            <p>Signature of Contractor with Stamp</p>
            <p>Signature of Employee</p>
          </div>
        </div>

        {/* BACK SIDE */}
        <div className="absolute w-full h-full bg-white border-2 border-gray-400 rounded-xl shadow-lg overflow-hidden p-4 text-[12px] [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <div className="font-semibold">Aadhaar:</div>
            <div>{card.adharCardNumber}</div>

            <div className="font-semibold">Valid Till:</div>
            <div>{format(new Date(card.validTill), "dd/MM/yyyy")}</div>

            <div className="font-semibold">Mobile:</div>
            <div>{card.mobileNumber}</div>

            <div className="font-semibold">Address:</div>
            <div className="col-span-1">{card.address}</div>
          </div>

          {/* QR + Instructions */}
          <div className="flex justify-between items-start mt-4">
            <p className="text-[11px] text-gray-700 max-w-[70%]">
              Valid for Railway Station, Yard and Coaching Depot of JU, BME BGKT
              with tools and equipments.
            </p>
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
    </div>
  );
};

export default Card;
