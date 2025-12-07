"use client";

import { notFound } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";

async function getCard(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/card/view/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;
  return res.json();
}

export default async function CardDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = await getCard(id);

  if (!card) return notFound();

  return (
    <div className="max-w-lg mx-auto mt-12 px-4 pb-10">
      {/* HEADER */}
      <h2 className="flex items-center justify-center gap-3 text-xl font-bold uppercase tracking-wide text-gray-900 mb-6">
        <Image
          src="/mega_rail.png"
          alt="Mega Rail Logo"
          width={45}
          height={45}
          className="rounded-md shadow-sm"
        />
        <span className="">{card.profileName}</span>
      </h2>

      {/* CARD */}
      <div
        className="
          bg-white 
          border border-gray-200 
          rounded-2xl 
          shadow-lg 
          p-7 
          space-y-6
        "
      >
        {/* TOP TITLE WITH LOGO */}
        <div className="flex items-center justify-center gap-3">
          {/* <Image
            src="/mega_rail.png"
            alt="Logo"
            width={48}
            height={48}
            className="rounded-lg shadow-sm"
          /> */}
          <h1 className="text-2xl font-bold text-gray-900">
            Employee Card Details
          </h1>
        </div>

        {/* HORIZONTAL LINE */}
        <div className="w-full h-[1px] bg-gray-200"></div>

        {/* INFO GRID */}
        <div className="text-[15px] grid grid-cols-[150px_1fr] gap-y-4 mt-2">
          <span className="font-semibold text-gray-700">Employee Name:</span>
          <span className="text-gray-900 font-medium tracking-wide">
            {card.employeeName}
          </span>

          <span className="font-semibold text-gray-700">Aadhaar:</span>
          <span className="text-gray-900">{card.adharCardNumber}</span>

          <span className="font-semibold text-gray-700">Address:</span>
          <span className="text-gray-900 leading-snug">{card.address}</span>

          <span className="font-semibold text-gray-700">Date of Issue:</span>
          <span className="text-gray-900">
            {format(new Date(card.dateOfIssue), "dd/MM/yyyy")}
          </span>

          <span className="font-semibold text-gray-700">Valid Till:</span>
          <span className="text-gray-900">
            {format(new Date(card.validTill), "dd/MM/yyyy")}
          </span>

          <span className="font-semibold text-gray-700">
            Police Verification:
          </span>
          <span className="text-gray-900">
            {card.policeVerification || "N/A"}
          </span>
          <span className="font-semibold text-gray-700">Agency Name:</span>
          <span className="text-gray-900">{card.profileName || "N/A"}</span>
          <span className="font-semibold text-gray-700">
            Issuing Authority:
          </span>
          <span className="text-gray-900 flex flex-col leading-tight">
            <span className="font-semibold">{card.divisionName || "N/A"}</span>
            <span className="text-sm text-gray-700">{card.hirer || "N/A"}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
