"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Card, { CardType } from "../../components/ui/cardList";

const CardPage = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  // For editing
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [formData, setFormData] = useState<Partial<CardType>>({});
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    axios
      .get("http://localhost:3000/card")
      .then((res) => {
        setCards(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching cards:", err);
        setLoading(false);
      });
  }, []);

const handleEditClick = async (card: CardType) => {
  try {
    const res = await axios.get(`http://localhost:3000/card/${card._id}`);
    setEditingCard(res.data);
    setFormData(res.data); // preload all fields with server response
    setFile(null);
  } catch (err) {
    console.error("Error fetching card details:", err);
  }
};


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpdate = async () => {
    if (!editingCard) return;

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value as string);
        }
      });

      if (file) {
        data.append("file", file); // 👈 backend expects "file"
      }

      const res = await axios.put(
        `http://localhost:3000/card/${editingCard._id}`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // update locally
      setCards((prev) =>
        prev.map((c) => (c._id === editingCard._id ? res.data : c))
      );

      setEditingCard(null);
    } catch (err) {
      console.error("Error updating card:", err);
    }
  };

  if (loading) return <p className="text-center text-gray-600">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold text-center py-6">Employee ID Cards</h1>
      <div className="flex flex-wrap gap-6 justify-center p-6">
        {cards.map((card) => (
          <div key={card._id} className="relative">
            <Card card={card} />
            <button
              className="absolute top-2 right-2 bg-blue-500 text-white text-sm px-2 py-1 rounded"
              onClick={() => handleEditClick(card)}
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      {editingCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white p-6 rounded shadow-md w-[500px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">
              Edit {editingCard.employeeName}
            </h2>

            {/* Generate inputs for all fields */}
            <input
              name="cardNo"
              value={formData.cardNo || ""}
              onChange={handleInputChange}
              placeholder="Card No"
              className="w-full border p-2 mb-2 rounded"
            />
            <input
              name="employeeName"
              value={formData.employeeName || ""}
              onChange={handleInputChange}
              placeholder="Employee Name"
              className="w-full border p-2 mb-2 rounded"
            />
            <input
              name="fatherName"
              value={formData.fatherName || ""}
              onChange={handleInputChange}
              placeholder="Father Name"
              className="w-full border p-2 mb-2 rounded"
            />
            <input
              name="designation"
              value={formData.designation || ""}
              onChange={handleInputChange}
              placeholder="Designation"
              className="w-full border p-2 mb-2 rounded"
            />
            <input
              name="contractor"
              value={formData.contractor || ""}
              onChange={handleInputChange}
              placeholder="Contractor"
              className="w-full border p-2 mb-2 rounded"
            />
            <input
              name="adharCardNumber"
              value={formData.adharCardNumber || ""}
              onChange={handleInputChange}
              placeholder="Aadhar Number"
              className="w-full border p-2 mb-2 rounded"
            />

            {/* DATE FIELDS */}
            <label className="block text-sm text-gray-600">Date of Issue</label>
            <input
              type="date"
              name="dateOfIssue"
              value={
                formData.dateOfIssue
                  ? formData.dateOfIssue.split("T")[0] // format YYYY-MM-DD
                  : ""
              }
              onChange={handleInputChange}
              className="w-full border p-2 mb-2 rounded"
            />
            <label className="block text-sm text-gray-600">Valid Till</label>
            <input
              type="date"
              name="validTill"
              value={formData.validTill ? formData.validTill.split("T")[0] : ""}
              onChange={handleInputChange}
              className="w-full border p-2 mb-2 rounded"
            />

            <input
              name="mobileNumber"
              value={formData.mobileNumber || ""}
              onChange={handleInputChange}
              placeholder="Mobile Number"
              className="w-full border p-2 mb-2 rounded"
            />
            <input
              name="address"
              value={formData.address || ""}
              onChange={handleInputChange}
              placeholder="Address"
              className="w-full border p-2 mb-2 rounded"
            />
            <input
              name="divisionName"
              value={formData.divisionName || ""}
              onChange={handleInputChange}
              placeholder="Division Name"
              className="w-full border p-2 mb-2 rounded"
            />
            <input
              name="loaNumber"
              value={formData.loaNumber || ""}
              onChange={handleInputChange}
              placeholder="LoA Number"
              className="w-full border p-2 mb-2 rounded"
            />
            <input
              name="profileName"
              value={formData.profileName || ""}
              onChange={handleInputChange}
              placeholder="Profile Name"
              className="w-full border p-2 mb-2 rounded"
            />
            <input
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              placeholder="Description"
              className="w-full border p-2 mb-2 rounded"
            />

            {/* PHOTO */}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />
              {editingCard.photo && !file && (
                <img
                  src={editingCard.photo}
                  alt="Current"
                  className="w-24 h-24 rounded mt-2 object-cover"
                />
              )}
              {file && (
                <p className="text-sm text-gray-500 mt-1">
                  Selected: {file.name}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setEditingCard(null)}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleUpdate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardPage;
