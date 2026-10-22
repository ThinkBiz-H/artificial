import { apiClient } from "./client";
import type { ApiEnvelope } from "@/types";

export interface ContactInquiryPayload {
  inquiryType: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export const contactApi = {
  submit: (payload: ContactInquiryPayload) =>
    apiClient.post<ApiEnvelope<{ inquiry: unknown }>>("/contact", payload).then((r) => r.data),
};
