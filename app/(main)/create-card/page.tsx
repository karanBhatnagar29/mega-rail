"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parse, isValid as isValidDate } from "date-fns";
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

// ------------------ Validation Schema ------------------
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const bloodGroupSchema = z.union(
  bloodGroups.map((bg) => z.literal(bg)) as [
    z.ZodLiteral<(typeof bloodGroups)[number]>,
    ...z.ZodLiteral<(typeof bloodGroups)[number]>[]
  ]
);

const formSchema = z.object({
  cardNo: z.string().min(1, "Card number is required"),
  dateOfIssue: z.date().optional(),
  employeeName: z.string().min(1, "Employee name is required"),
  fatherName: z.string().min(1, "Father name is required"),
  designation: z.string().min(1, "Designation is required"),
  adharCardNumber: z.string().length(12, "Aadhaar must be 12 digits"),
  validTill: z.date().min(1, "Valid till date is required"),
  mobileNumber: z.string().length(10, "Mobile must be 10 digits"),
  address: z.string().min(1, "Address is required"),
  photo: z.any().optional(),
  hirer: z.string().min(1, "Designation authority is required"),
  divisionName: z.string().min(1, "Issuing Authority name is required"),
  profileName: z.string().min(1, "Profile name is required"),
  bloodGroup: bloodGroupSchema,
  policeVerification: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// --------------- Smart Date Parser ---------------
function parseSmartDate(value: string): Date | undefined {
  const raw = value.trim();
  if (!raw) return undefined;

  const patterns = [
    "dd/MM/yyyy",
    "d/M/yyyy",
    "dd-MM-yyyy",
    "d-M-yyyy",
    "yyyy-MM-dd",
    "dd.MM.yyyy",
  ];

  for (const p of patterns) {
    const d = parse(raw, p, new Date());
    if (isValidDate(d)) return d;
  }

  // Fallback: Date.parse (handles "Jan 12, 2025" etc.)
  const ts = Date.parse(raw);
  if (!Number.isNaN(ts)) return new Date(ts);

  return undefined;
}

// --------------- Reusable Smart Date Field ---------------
type SmartDateFieldProps = {
  label: string;
  placeholder?: string;
  field: {
    value?: Date;
    onChange: (value?: Date) => void;
    onBlur?: () => void;
    name: string;
  };
};

function SmartDateField({ label, placeholder, field }: SmartDateFieldProps) {
  // Local text state (what user types)
  const [inputValue, setInputValue] = useState<string>(
    field.value ? format(field.value, "dd/MM/yyyy") : ""
  );

  // Jab form ya calendar se Date change ho, tab hi sync karo
  useEffect(() => {
    if (field.value instanceof Date) {
      setInputValue(format(field.value, "dd/MM/yyyy"));
    }
    // NOTE: else mein inputValue reset nahi kar rahe, taaki typing disturb na ho
  }, [field.value]);

  // Typing ke time sirf text change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Blur pe smart parse
  const handleBlur = () => {
    const val = inputValue.trim();

    if (!val) {
      // empty -> clear form value
      field.onChange(undefined);
    } else {
      const parsed = parseSmartDate(val);
      if (parsed) {
        field.onChange(parsed);
      }
      // agar parse nahi hua:
      // - user ka typed text rehne do (inputValue)
      // - form value change nahi karte (validation submit pe fail karegi)
    }

    field.onBlur && field.onBlur();
  };

  const handleDateSelect = (date: Date | undefined) => {
    field.onChange(date);
    if (date) {
      setInputValue(format(date, "dd/MM/yyyy"));
    } else {
      setInputValue("");
    }
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <div className="flex gap-2">
        <FormControl>
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            name={field.name}
            placeholder={placeholder ?? "DD/MM/YYYY or pick from calendar"}
          />
        </FormControl>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="whitespace-nowrap"
            >
              📅 Pick
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0">
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        You can type like: <b>12/01/2025</b>, <b>12-01-2025</b>,{" "}
        <b>2025-01-12</b>
      </p>
      <FormMessage />
    </FormItem>
  );
}

export default function CreateCardPage() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [cardData, setCardData] = useState<CardType | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardNo: "",
      dateOfIssue: undefined,
      employeeName: "",
      fatherName: "",
      designation: "",
      adharCardNumber: "",
      hirer: "",
      validTill: undefined,
      mobileNumber: "",
      address: "",
      divisionName: "",
      profileName: "M/s. Megarail Power Projects LLP",
      bloodGroup: "O+",
      policeVerification: undefined,
    },
  });

  const token = Cookies.get("auth_token");

  async function onSubmit(values: FormValues) {
    try {
      setLoading(true);

      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (key === "policeVerification" && value instanceof Date) {
          formData.append(key, format(value, "yyyy-MM-dd"));
          return;
        }

        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else if (value !== undefined && value !== null && key !== "photo") {
          const toAppend =
            typeof value === "boolean" ? String(value) : String(value);
          formData.append(key, toAppend);
        }
      });

      if (values.photo && (values.photo as File) instanceof File) {
        formData.append("photo", values.photo as File);
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

      const normalizedData = {
        ...response.data,
        policeVerification: response.data.policeVerification
          ? String(response.data.policeVerification)
          : "",
        dateOfIssue: response.data.dateOfIssue
          ? String(response.data.dateOfIssue)
          : "",
        validTill: response.data.validTill
          ? String(response.data.validTill)
          : "",
      };

      setCardData(normalizedData);

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

              {/* SMART date field for Date of Issue */}
              <FormField
                control={form.control}
                name="dateOfIssue"
                render={({ field }) => (
                  <SmartDateField
                    label="Date of Issue"
                    field={field}
                    placeholder="DD/MM/YYYY or pick from calendar"
                  />
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
                    <FormLabel>Designation of issuing authority</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Designation of issuing authority name"
                        value={field.value || ""}
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
                name="divisionName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issuing Authority Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter issuing Authority name"
                        {...field}
                      />
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

              {/* SMART date field for Valid Till */}
              <FormField
                control={form.control}
                name="validTill"
                render={({ field }) => (
                  <SmartDateField
                    label="Valid Till"
                    field={field}
                    placeholder="DD/MM/YYYY or pick from calendar"
                  />
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

          {/* --- Additional Information Section --- */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">
              Additional Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="bloodGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Group</FormLabel>
                    <FormControl>
                      <select
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        name={field.name}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="">Select blood group</option>
                        {bloodGroups.map((bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SMART date field for Police Verification */}
              <FormField
                control={form.control}
                name="policeVerification"
                render={({ field }) => (
                  <SmartDateField
                    label="Police Verification Date"
                    field={field}
                    placeholder="DD/MM/YYYY or pick from calendar"
                  />
                )}
              />
            </div>
          </div>

          {/* --- Upload Section --- */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">
              Uploads
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "photo",
                  label: "Upload Photo",
                  preview: selectedPhoto,
                  setPreview: setSelectedPhoto,
                },
              ].map((item) => (
                <FormField
                  key={item.name}
                  control={form.control}
                  name={item.name as "photo"}
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
