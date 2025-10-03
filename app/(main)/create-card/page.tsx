"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import EmployeeCard from "@/components/ui/cardPreview";
import Image from "next/image";
import { CardType } from "@/types/card";
import api from "@/lib/axios";
// ✅ Validation Schema
const formSchema = z.object({
  cardNo: z.string().min(1, "Card number is required"),
  dateOfIssue: z.date(),
  employeeName: z.string().min(1, "Employee name is required"),
  fatherName: z.string().min(1, "Father name is required"),
  designation: z.string().min(1, "Designation is required"),
  contractor: z.string().min(1, "Contractor is required"),
  adharCardNumber: z.string().length(12, "Aadhaar must be 12 digits"),
  validTill: z.date(),
  mobileNumber: z.string().length(10, "Mobile must be 10 digits"),
  address: z.string().min(1, "Address is required"),
  photo: z.any().optional(),
  hirer: z.string().min(1, "Hirer is required"),
  sign: z.any().optional(),
  seal: z.any().optional(),
  divisionName: z.string().min(1, "Division name is required"),
  loaNumber: z.string().min(1, "LOA number is required"),
  profileName: z.string().min(1, "Profile name is required"),

  // 🔹 New field
  description: z.string().optional(),
});

export default function CreateCardPage() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [cardData, setCardData] = useState<CardType | null>(null); // ✅ replaced any
  const [loading, setLoading] = useState(false);
  const [selectedSeal, setSelectedSeal] = useState<string | null>(null);
  const [selectedSign, setSelectedSign] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardNo: "",
      dateOfIssue: undefined,
      employeeName: "",
      fatherName: "",
      designation: "",
      contractor: "",
      adharCardNumber: "",
      hirer: "",
      validTill: undefined,
      mobileNumber: "",
      address: "",
      divisionName: "NORTH WESTERN RAILWAY JODHPUR DIVISION",
      loaNumber: "LOA NO. 02 of 2023-24/010010700779589",
      profileName: "M/s. Megarail Power Projects LLP",
      description:
        "Valid for Railway station, Yard and Coaching Depot of JU, BME BGKT with tools and equipments", // 🔹 default empty
    },
  });

  const token = Cookies.get("auth_token");

  // ✅ Submit Handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);

      const formData = new FormData();

      // append text fields
      Object.entries(values).forEach(([key, value]) => {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else if (
          value &&
          key !== "photo" &&
          key !== "seal" &&
          key !== "sign"
        ) {
          formData.append(
            key,
            value === undefined || value === null ? "" : (value as string)
          );
        }
      });

      // append file
      if (values.photo instanceof File) {
        formData.append("photo", values.photo);
      }
      if (values.sign instanceof File) {
        formData.append("sign", values.sign);
      }
      if (values.seal instanceof File) {
        formData.append("seal", values.seal);
      }

      const response = await api.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/card/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCardData(response.data);
      toast.success("✅ Card created successfully!", {
        description: "Your card has been generated and saved.",
      });
    } catch (error) {
      console.error("Error creating card:", error);
      toast.error("❌ Failed to create card", {
        description: "Check console for details and try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg border">
      <h2 className="text-2xl font-bold mb-8">Create Employee Card</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          {/* --- Personal Info Section --- */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="cardNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card No</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter card number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfIssue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Issue</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          {field.value
                            ? format(field.value, "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employeeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter employee name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fatherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Father Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter father name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* --- Work Info Section --- */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">
              Work Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter designation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hirer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hirer</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter hirer name"
                        value={field.value || ""} // force controlled
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contractor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contractor</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contractor name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="divisionName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Division Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter division name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="loaNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LOA Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter LOA number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="profileName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter profile name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adharCardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aadhaar Card Number</FormLabel>
                    <FormControl>
                      <Input placeholder="12-digit Aadhaar number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="validTill"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Till</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          {field.value
                            ? format(field.value, "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* --- Contact Info Section --- */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="10-digit mobile number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter address"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* --- Description Section --- */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">
              Additional Information
            </h3>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter description or notes"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* --- Upload Section --- */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">
              Uploads
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* File Upload Item */}
              {[
                {
                  name: "photo",
                  label: "Upload Photo",
                  preview: selectedPhoto,
                  setPreview: setSelectedPhoto,
                },
                {
                  name: "seal",
                  label: "Supervisor",
                  preview: selectedSeal,
                  setPreview: setSelectedSeal,
                },
                {
                  name: "sign",
                  label: "Railway Supervisor",
                  preview: selectedSign,
                  setPreview: setSelectedSign,
                },
              ].map((item) => (
                <FormField
                  key={item.name}
                  control={form.control}
                  name={item.name as "photo" | "seal" | "sign"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{item.label}</FormLabel>
                      <div className="relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 hover:border-blue-500 transition cursor-pointer bg-gray-50">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              field.onChange(file);
                              const reader = new FileReader();
                              reader.onload = () =>
                                item.setPreview(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        {item.preview ? (
                          <Image
                            src={item.preview}
                            alt={`${item.label} Preview`}
                            width={100}
                            height={100}
                            className="w-24 h-24 object-cover rounded-md border shadow"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-gray-400 text-sm">
                            <svg
                              className="w-10 h-10 mb-2"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 16v-1a4 4 0 014-4h1m6 0h1a4 4 0 014 4v1m-4 4h4m-10 0h-4m6 0V4m0 0l-2 2m2-2l2 2"
                              />
                            </svg>
                            <span>Click or drag to upload</span>
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" className="px-6" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Card"
              )}
            </Button>
          </div>
        </form>
      </Form>

      {cardData && cardData._id && (
        <EmployeeCard cardData={{ ...cardData, _id: cardData._id as string }} />
      )}
    </div>
  );
}
