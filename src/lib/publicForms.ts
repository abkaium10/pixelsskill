import { z } from "zod";
import { fileRef, MAX_FILES } from "./privateUploads";

/** Links to files hosted elsewhere (Drive, Dropbox, WeTransfer…) for images too large to upload. https only. */
const fileLink = z.string().trim().url("Enter a valid link").max(600).refine((v) => /^https:\/\//i.test(v), "Links must start with https://");
const FORMATS = ["JPG", "PNG", "TIFF", "PSD", "WEBP"] as const;
const base = {
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(200),
  company: z.string().trim().max(120).optional().default(""),
  phone: z.string().trim().max(40).regex(/^[0-9+()\-.\s]*$/, "Enter a valid phone number").optional().default(""),
  serviceSlug: z.string().trim().max(80).optional().default(""),
  instructions: z.string().trim().max(3000).optional().default(""),
  website: z.string().max(0).optional().default(""), // honeypot: must stay empty
};
export const quoteSchema = z.object({
  ...base,
  quantity: z.coerce.number().int().min(1, "Enter a quantity").max(1_000_000),
  complexity: z.enum(["SIMPLE", "MEDIUM", "COMPLEX", "VERY_COMPLEX"]),
  outputFormat: z.enum(FORMATS),
  deadline: z.string().optional().default("").refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Invalid date"),
  files: z.array(fileRef).max(MAX_FILES).default([]),
  fileLinks: z.array(fileLink).max(10).default([]),
});
export const trialSchema = z.object({
  ...base,
  imageCount: z.coerce.number().int().min(1, "Enter how many images").max(50, "Free trials are limited to 50 images"),
  outputFormat: z.enum(FORMATS),
  files: z.array(fileRef).max(MAX_FILES).default([]),
  fileLinks: z.array(fileLink).max(10).default([]),
}).refine((d) => d.files.length > 0 || d.fileLinks.length > 0, { path: ["files"], message: "Please upload at least one image, or add a download link" });
export const contactSchema = z.object({
  name: base.name, email: base.email, subject: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().min(10, "Please write a few more words").max(5000), website: base.website,
});
