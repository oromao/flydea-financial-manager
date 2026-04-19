import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.warn(
    "RESEND_API_KEY not set. Email notifications will not work. Set RESEND_API_KEY in your .env.local"
  );
}

export const resend = new Resend(apiKey);
