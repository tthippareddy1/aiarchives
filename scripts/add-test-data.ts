import 'dotenv/config';
import { dbClient } from '../lib/db/client';
import { s3Client } from '../lib/storage/s3';
import { loadConfig } from '../lib/config';
import { createConversationRecord } from '../lib/db/conversations';
import { randomUUID } from 'crypto';

const testConversations = [
  {
    model: 'ChatGPT',
    content: {
      messages: [
        { role: 'user', content: 'How do I use React hooks like useState and useEffect?' },
        { role: 'assistant', content: 'React hooks are functions that let you use state and lifecycle features in functional components. useState manages state, useEffect handles side effects.' }
      ]
    }
  },
  {
    model: 'Claude',
    content: {
      messages: [
        { role: 'user', content: 'Explain async/await in JavaScript' },
        { role: 'assistant', content: 'Async/await is syntactic sugar for Promises in JavaScript. It makes asynchronous code look synchronous and easier to read.' }
      ]
    }
  },
  {
    model: 'ChatGPT',
    content: {
      messages: [
        { role: 'user', content: 'Best practices for API design in Node.js' },
        { role: 'assistant', content: 'Here are key API design principles: RESTful conventions, proper error handling, versioning, authentication.' }
      ]
    }
  }
];

async function main() {
  console.log('Adding test conversations...');
  
  const config = loadConfig();
  await dbClient.initialize(config.database);
  s3Client.initialize(config.s3);
  
  for (const conv of testConversations) {
    const conversationId = randomUUID();
    
    // Convert content to JSON string for S3
    const contentString = JSON.stringify(conv.content);
    
    const contentKey = await s3Client.storeConversation(conversationId, contentString);
    
    await createConversationRecord({
      model: conv.model,
      scrapedAt: new Date(),
      sourceHtmlBytes: contentString.length,
      views: 0,
      contentKey,
    });
    
    console.log(`✓ Added ${conv.model} conversation`);
  }
  
  console.log('\nTest data added ccessfully!');
  await dbClient.close();
  process.exit(0);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
