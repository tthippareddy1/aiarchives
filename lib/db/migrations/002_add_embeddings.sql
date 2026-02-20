-- Add vector column for embeddings (1536 dimensions for OpenAI text-embedding-3-small)
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS content_embedding vector(1536);

-- Create index for fast similarity search
CREATE INDEX IF NOT EXISTS idx_conversations_embedding 
ON conversations 
USING ivfflat (content_embedding vector_cosine_ops)
WITH (lists = 100);

-- Add column to track if embedding is generated
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS embedding_generated BOOLEAN DEFAULT FALSE;
