// app/card/view/[id]/page.tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from "date-fns";

async function getCard(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/card/view/${id}`,
    {
      cache: "no-store", // always fetch fresh data
    }
  );

  if (!res.ok) return null;
  return res.json();
}

export default async function CardDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Await params (Next.js 15 requirement)
  const { id } = await params;

  const card = await getCard(id);
  if (!card) return notFound();

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-10">
      {/* Title */}
      <h1 className="text-3xl font-bold text-center mb-6">
        Employee Card Details
      </h1>

      {/* ✅ Card Preview */}
      <div className="flex justify-center">
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
                className="object-contain max-w-full max-h-full"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex gap-4 p-4 relative">
            {/* Profile Photo + Seal */}
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

              {card.seal && (
                <img
                  src={card.seal}
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
              <div className="font-bold">{card.cardNo}</div>

              <div className="font-bold">Date Issue:</div>
              <div className="font-bold">
                {format(new Date(card.dateOfIssue), "dd/MM/yyyy")}
              </div>

              <div className="font-bold">Employee:</div>
              <div className="font-bold">{card.employeeName}</div>

              <div className="font-bold">Father:</div>
              <div className="font-bold">{card.fatherName}</div>

              <div className="font-bold">Designation:</div>
              <div className="font-bold">{card.designation}</div>

              <div className="font-bold">Contractor:</div>
              <div className="font-bold"> {card.contractor}</div>
              <div className="font-bold">Hirer:</div>
              <div className="font-bold">{card.hirer || "-"}</div>
            </div>
          </div>

          {/* <div className="flex flex-col items-center border-t text-[10px] text-gray-600 px-3 py-2">
            <p className="mb-1">Railway Official Sign</p>
            {card.sign ? (
              <Image
                src={card.sign}
                alt="Official Signature"
                width={80}
                height={40}
                className="object-contain max-w-[80px] max-h-[40px] mb-2"
              />
            ) : (
              <div className="h-[40px] border-b border-gray-300 w-[80px] mb-2"></div>
            )}
          </div> */}
        </div>
      </div>

      {/* ✅ Full details in text format */}
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h2 className="text-xl font-semibold mb-4">All Details</h2>
        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
          <p>
            <strong>Card No:</strong> {card.cardNo}
          </p>
          <p>
            <strong>Date Issue:</strong>{" "}
            {new Date(card.dateOfIssue).toLocaleDateString()}
          </p>

          <p>
            <strong>Employee:</strong> {card.employeeName}
          </p>
          <p>
            <strong>Father Name:</strong> {card.fatherName}
          </p>

          <p>
            <strong>Designation:</strong> {card.designation}
          </p>
          <p>
            <strong>Contractor:</strong> {card.contractor}
          </p>

          <p>
            <strong>Division:</strong> {card.divisionName}
          </p>
          <p>
            <strong>LOA Number:</strong> {card.loaNumber}
          </p>

          <p>
            <strong>Profile Name:</strong> {card.profileName}
          </p>
          <p>
            <strong>Aadhaar:</strong> {card.adharCardNumber}
          </p>

          <p>
            <strong>Valid Till:</strong>{" "}
            {new Date(card.validTill).toLocaleDateString()}
          </p>
          <p>
            <strong>Mobile:</strong> {card.mobileNumber}
          </p>

          <p className="col-span-2">
            <strong>Address:</strong> {card.address}
          </p>
          <p className="col-span-2">
            <strong>Description:</strong> {card.description}
          </p>
        </div>
      </div>
    </div>
  );
}
