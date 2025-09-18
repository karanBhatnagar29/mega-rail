import { useState } from "react";

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

  return (
    <div
      className="w-[350px] h-[220px] cursor-pointer [perspective:1000px]"
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Front Side */}
        <div className="absolute w-full h-full bg-white rounded-xl shadow-md border border-gray-300 flex [backface-visibility:hidden]">
          <div className="w-1/3 flex items-center justify-center p-2">
            {card.photo ? (
              <img
                src={card.photo}
                alt={card.employeeName}
                className="w-24 h-24 object-cover rounded-md border"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-300 rounded-md flex items-center justify-center text-gray-600">
                No Photo
              </div>
            )}
          </div>
          <div className="w-2/3 flex flex-col justify-center px-3 text-sm">
            <h2 className="text-lg font-bold">{card.employeeName}</h2>
            <p>Father: {card.fatherName}</p>
            <p>Designation: {card.designation}</p>
            <p>Card No: {card.cardNo}</p>
            <p>Valid Till: {card.validTill.split("T")[0]}</p>
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute w-full h-full bg-gray-50 rounded-xl shadow-md border border-gray-300 px-4 py-3 text-sm [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <h3 className="font-bold text-center mb-2">Employee Details</h3>
          <p>
            <strong>Contractor:</strong> {card.contractor}
          </p>
          <p>
            <strong>Adhar No:</strong> {card.adharCardNumber}
          </p>
          <p>
            <strong>Mobile:</strong> {card.mobileNumber}
          </p>
          <p>
            <strong>Division:</strong> {card.divisionName}
          </p>
          <p>
            <strong>LoA No:</strong> {card.loaNumber}
          </p>
          <p>
            <strong>Profile:</strong> {card.profileName}
          </p>
          <p>
            <strong>Address:</strong> {card.address}
          </p>
          {card.description && (
            <p className="mt-1 text-gray-600 italic">“{card.description}”</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
