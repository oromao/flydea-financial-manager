import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY || "dummy_key_for_build";

if (!process.env.RESEND_API_KEY) {
  if (process.env.NODE_ENV === "production") {
    console.warn("RESEND_API_KEY not set in production!");
  }
}

export const resend = new Resend(apiKey);
