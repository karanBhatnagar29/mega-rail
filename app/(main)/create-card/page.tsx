"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import axios from "axios";
import { Loader2 } from "lucide-react";
import Cookies from "js-cookie";

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
        } else if (value && key !== "photo") {
          formData.append(key, value as string);
        }
      });

      // append file
      if (values.photo instanceof File) {
        formData.append("file", values.photo);
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
      alert("✅ Card created successfully!");
    } catch (error) {
      console.error("Error creating card:", error);
      alert("❌ Failed to create card. Check console.");
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
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Photo</h3>
            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Photo</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          field.onChange(file);
                          const reader = new FileReader();
                          reader.onload = () =>
                            setSelectedPhoto(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedPhoto && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Preview:</p>
                <Image
                  src={selectedPhoto}
                  alt="Preview"
                  width={128}
                  height={128}
                  className="w-32 h-32 object-cover rounded-md border"
                />
              </div>
            )}
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
