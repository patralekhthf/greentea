import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY environment variable");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = "orders@yourdomain.com"; // Update with your verified Resend domain
export const ADMIN_EMAIL = "admin@yourdomain.com";  // Update with your admin email
