import { SQLDatabase } from "encore.dev/storage/sqldb";

export const historyDB = new SQLDatabase("history", {
  migrations: "./migrations",
});

export interface RecommendationRecord {
  userId: string;
  input: any;
  ml_response: any;
  market_snapshot: any;
}

export async function saveRecommendation(record: RecommendationRecord): Promise<void> {
  await historyDB.exec`
    INSERT INTO recommendations (user_id, input_data, ml_response, market_snapshot, created_at)
    VALUES (${record.userId}, ${JSON.stringify(record.input)}, ${JSON.stringify(record.ml_response)}, ${JSON.stringify(record.market_snapshot)}, NOW())
  `;
}

export async function getHistory(userId: string): Promise<any[]> {
  const rows = await historyDB.queryAll`
    SELECT * FROM recommendations 
    WHERE user_id = ${userId} 
    ORDER BY created_at DESC 
    LIMIT 20
  `;
  return rows;
}
