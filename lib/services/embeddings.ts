import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ConversationMessage {
  role: string;
  content: string;
}

interface ConversationContent {
  messages?: ConversationMessage[];
}

/**
 * Generate embedding for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Prepare conversation text for embedding
 */
export function prepareTextForEmbedding(conversationContent: ConversationContent): string {
  // Extract messages from conversation
  const messages = conversationContent.messages || [];
  
  // Combine all messages into searchable text
  const text = messages
    .map((msg: ConversationMessage) => `${msg.role}: ${msg.content}`)
    .join('\n')
    .slice(0, 8000);
  
  return text;
}
