import { api } from "encore.dev/api";
import { historyDB } from "./history";

export interface FeedbackRequest {
  recommendationId: number;
  userId: string;
  helpful: boolean;
  notes?: string;
}

export interface FeedbackResponse {
  success: boolean;
}

// Saves user feedback on a recommendation
export const submitFeedback = api<FeedbackRequest, FeedbackResponse>(
  { expose: true, method: "POST", path: "/api/feedback" },
  async (req) => {
    await historyDB.exec`
      INSERT INTO feedbacks (recommendation_id, user_id, helpful, notes, created_at)
      VALUES (${req.recommendationId}, ${req.userId}, ${req.helpful}, ${req.notes || null}, NOW())
    `;
    
    return { success: true };
  }
);
