import 'dotenv/config';
import { dbClient } from '../lib/db/client';
import { s3Client } from '../lib/storage/s3';
import { loadConfig } from '../lib/config';
import { getConversationsWithoutEmbeddings, storeEmbedding } from '../lib/db/embeddings';
import { generateEmbedding, prepareTextForEmbedding } from '../lib/services/embeddings';

async function main() {
  console.log('Starting embedding generation...');
  
  const config = loadConfig();
  await dbClient.initialize(config.database);
  s3Client.initialize(config.s3);
  
  let processed = 0;
  let errors = 0;
  
  while (true) {
    const conversations = await getConversationsWithoutEmbeddings(10);
    
    if (conversations.length === 0) {
      console.log('All conversations processed!');
      break;
    }
    
    console.log(`Processing ${conversations.length} conversations...`);
    
    for (const conv of conversations) {
      try {
        const contentString = await s3Client.getConversationContent(conv.contentKey);
        const content = JSON.parse(contentString);
        
        const text = prepareTextForEmbedding(content);
        
        if (!text || text.trim().length === 0) {
          console.log(`⚠ Skipping ${conv.id} - no text content`);
          continue;
        }
        
        const embedding = await generateEmbedding(text);
        await storeEmbedding(conv.id, embedding);
        
        processed++;
        console.log(`✓ Processed conversation ${conv.id} (${processed} total)`);
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`✗ Error processing ${conv.id}:`, error);
        errors++;
      }
    }
  }
  
  console.log(`\nComplete! Processed: ${processed}, Errors: ${errors}`);
  await dbClient.close();
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
