import { api } from "encore.dev/api";
import { getHistory } from "./history";

export interface HistoryRequest {
  userId: string;
}

export interface HistoryResponse {
  recommendations: any[];
}

// Gets recommendation history for a user
export const getRecommendationHistory = api<HistoryRequest, HistoryResponse>(
  { expose: true, method: "GET", path: "/api/history/:userId" },
  async (req) => {
    const recommendations = await getHistory(req.userId);
    return { recommendations };
  }
);
