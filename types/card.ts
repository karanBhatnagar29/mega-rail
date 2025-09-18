// types/card.ts
export interface CardType {
  _id?: string; // MongoDB ID
  cardNo: string;
  dateOfIssue: string; // ISO date string
  employeeName: string;
  fatherName: string;
  designation: string;
  contractor: string;
  adharCardNumber: string;
  validTill: string; // ISO date string
  mobileNumber: string;
  address: string;
  photo?: string; // image URL
  divisionName: string;
  loaNumber: string;
  profileName: string;
  description?: string;
}
