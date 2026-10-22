import { apiClient } from "./client";
import type { ApiEnvelope } from "@/types";

export interface Unit {
  _id: string;
  name: string;
  symbol: string;
  allowDecimal: boolean;
}

export const unitsApi = {
  list: () =>
    apiClient.get<ApiEnvelope<{ units: Unit[] }>>("/units").then((r) => r.data),
};
