CREATE TABLE recommendations (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  input_data JSONB NOT NULL,
  ml_response JSONB NOT NULL,
  market_snapshot JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced BOOLEAN DEFAULT TRUE
);

CREATE TABLE feedbacks (
  id BIGSERIAL PRIMARY KEY,
  recommendation_id BIGINT REFERENCES recommendations(id),
  user_id TEXT NOT NULL,
  helpful BOOLEAN NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_created_at ON recommendations(created_at);
CREATE INDEX idx_feedbacks_recommendation_id ON feedbacks(recommendation_id);
