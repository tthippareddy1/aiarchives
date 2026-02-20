import { dbClient } from './client';
import { ConversationRecord } from './types';

/**
 * Store embedding for a conversation
 */
export async function storeEmbedding(
  conversationId: string,
  embedding: number[]
): Promise<void> {
  const pool = dbClient.getPool();
  
  const query = `
    UPDATE conversations
    SET content_embedding = $1::vector,
        embedding_generated = TRUE
    WHERE id = $2
  `;
  
  await pool.query(query, [JSON.stringify(embedding), conversationId]);
}

/**
 * Search conversations by semantic similarity
 */
export async function searchBySimilarity(
  queryEmbedding: number[],
  limit: number = 10
): Promise<ConversationRecord[]> {
  const pool = dbClient.getPool();
  
  const query = `
    SELECT 
      id,
      model,
      scraped_at,
      content_key,
      source_html_bytes,
      views,
      created_at,
      updated_at,
      1 - (content_embedding <=> $1::vector) as similarity
    FROM conversations
    WHERE embedding_generated = TRUE
    ORDER BY content_embedding <=> $1::vector
    LIMIT $2
  `;
  
  const result = await pool.query(query, [JSON.stringify(queryEmbedding), limit]);
  
  return result.rows.map(row => ({
    id: row.id,
    model: row.model,
    scrapedAt: row.scraped_at,
    contentKey: row.content_key,
    sourceHtmlBytes: row.source_html_bytes,
    views: row.views,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Get conversations without embeddings
 */
export async function getConversationsWithoutEmbeddings(
  limit: number = 50
): Promise<ConversationRecord[]> {
  const pool = dbClient.getPool();
  
  const query = `
    SELECT 
      id,
      model,
      scraped_at,
      content_key,
      source_html_bytes,
      views,
      created_at,
      updated_at
    FROM conversations
    WHERE embedding_generated = FALSE OR content_embedding IS NULL
    LIMIT $1
  `;
  
  const result = await pool.query(query, [limit]);
  
  return result.rows.map(row => ({
    id: row.id,
    model: row.model,
    scrapedAt: row.scraped_at,
    contentKey: row.content_key,
    sourceHtmlBytes: row.source_html_bytes,
    views: row.views,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
