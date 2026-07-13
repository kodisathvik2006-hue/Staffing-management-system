import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const selfEntitySchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  registeredAddress: z.string().min(5, "Registered address is required"),
  communicationAddress: z.string().optional(),
  phoneNumbers: z.array(z.string()).min(1, "At least one phone number"),
  einNumber: z.string().min(9, "Valid EIN is required"),
  bankName: z.string().min(2, "Bank name is required"),
  bankAccountNumber: z.string().min(4, "Bank account number is required"),
  routingNumber: z.string().min(9, "Valid routing number is required"),
  bankAddress: z.string().optional(),
  swiftCode: z.string().optional(),
  iban: z.string().optional(),
});

export const vendorSchema = z.object({
  legalName: z.string().min(2),
  shortName: z.string().optional(),
  registeredAddress: z.string().optional(),
  communicationAddress: z.string().optional(),
  contactNames: z.array(z.string()).default([]),
  emailAddresses: z.array(z.string().email()).default([]),
  phoneNumbers: z.array(z.string()).default([]),
});

export const consultantSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  visaStatus: z.string().optional(),
  address: z.string().optional(),
  personalEmail: z.string().email().optional().or(z.literal("")),
  mobileNumber: z.string().optional(),
});

export const salespersonSchema = consultantSchema;

export const clientSchema = z.object({
  legalName: z.string().min(2),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  registeredAddress: z.string().optional(),
  communicationAddress: z.string().optional(),
  contactNames: z.array(z.string()).default([]),
  emailAddresses: z.array(z.string().email()).default([]),
  phoneNumbers: z.array(z.string()).default([]),
});

export const commissionRuleSchema = z.object({
  salespersonId: z.string().cuid(),
  type: z.enum(["FLAT_ONE_TIME", "MONTHLY", "HOURLY", "PERCENT_MARKUP"]),
  currency: z.enum(["USD", "INR"]).default("USD"),
  amount: z.number().positive().optional(),
  percent: z.number().min(0).max(100).optional(),
});

export const projectSchema = z.object({
  name: z.string().min(2),
  clientId: z.string().cuid(),
  consultantId: z.string().cuid(),
  upstreamVendorId: z.string().cuid().optional(),
  downstreamVendorId: z.string().cuid().optional(),
  salespersonId: z.string().cuid().optional(),
  templateId: z.string().cuid().optional(),
  startDate: z.string().datetime().optional(),
  invoiceSchedule: z
    .enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "CUSTOM"])
    .default("MONTHLY"),
  paymentTerms: z.string().optional(),
  paymentMode: z.enum(["ACH", "WIRE", "CHECK", "ZELLE", "OTHER"]).default("ACH"),
  clientRatePerHour: z.number().positive(),
  payRatePerHour: z.number().positive(),
  payTarget: z.enum(["CONSULTANT", "DOWNSTREAM_VENDOR"]).default("CONSULTANT"),
  invoiceEmail: z.string().email().optional().or(z.literal("")),
  currency: z.enum(["USD", "INR"]).default("USD"),
  commissionRules: z.array(commissionRuleSchema).default([]),
});

export const projectStatusSchema = z.object({
  status: z.enum([
    "DRAFT",
    "ACTIVE",
    "PAUSED",
    "TERMINATED",
    "COMPLETED",
    "ARCHIVED",
  ]),
  reason: z.string().optional(),
});

export const projectUpdateSchema = projectSchema
  .partial()
  .omit({ commissionRules: true });

export const templateSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  invoiceSchedule: z
    .enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "CUSTOM"])
    .default("MONTHLY"),
  paymentTerms: z.string().optional(),
  paymentMode: z.enum(["ACH", "WIRE", "CHECK", "ZELLE", "OTHER"]).default("ACH"),
  defaultClientRate: z.number().positive().optional(),
  defaultPayRate: z.number().positive().optional(),
  currency: z.enum(["USD", "INR"]).default("USD"),
  markupTarget: z.number().min(0).max(100).optional(),
  commissionDefaults: z
    .array(
      z.object({
        type: z.enum([
          "FLAT_ONE_TIME",
          "MONTHLY",
          "HOURLY",
          "PERCENT_MARKUP",
        ]),
        currency: z.enum(["USD", "INR"]).default("USD"),
        amount: z.number().positive().optional(),
        percent: z.number().min(0).max(100).optional(),
      })
    )
    .default([]),
  requiredDocuments: z
    .array(
      z.enum([
        "CLIENT_MSA",
        "CLIENT_SOW",
        "CONSULTANT_NDA",
        "CONSULTANT_OFFER_LETTER",
        "VENDOR_CONTRACT",
        "COMMISSION_AGREEMENT",
        "MISCELLANEOUS",
      ])
    )
    .default([]),
});

export const documentUploadSchema = z.object({
  documentType: z.enum([
    "CLIENT_MSA",
    "CLIENT_SOW",
    "CONSULTANT_NDA",
    "CONSULTANT_OFFER_LETTER",
    "VENDOR_CONTRACT",
    "COMMISSION_AGREEMENT",
    "MISCELLANEOUS",
  ]),
  title: z.string().min(2),
  isRequired: z.boolean().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SelfEntityInput = z.infer<typeof selfEntitySchema>;
export type VendorInput = z.infer<typeof vendorSchema>;
export type ConsultantInput = z.infer<typeof consultantSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type TemplateInput = z.infer<typeof templateSchema>;

export const vendorRegistrationSchema = z.object({
  companyName: z.string().min(2, "Company Name is required"),
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.string().email("Valid business email is required"),
  phone: z.string().min(1, "Phone number is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  companyAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  website: z.string().optional(),
  taxId: z.string().optional(),
  logoUrl: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, "You must accept the Terms & Conditions"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type VendorRegistrationInput = z.infer<typeof vendorRegistrationSchema>;
