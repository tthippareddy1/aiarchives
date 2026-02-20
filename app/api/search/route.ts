import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/services/embeddings';
import { searchBySimilarity } from '@/lib/db/embeddings';
import { dbClient } from '@/lib/db/client';
import { s3Client } from '@/lib/storage/s3';
import { loadConfig } from '@/lib/config';

let isInitialized = false;

async function ensureInitialized() {
  if (!isInitialized) {
    try {
      const config = loadConfig();
      await dbClient.initialize(config.database);
      s3Client.initialize(config.s3);
      isInitialized = true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('already initialized')) {
        isInitialized = true;
      } else {
        throw error;
      }
    }
  }
}

/**
 * GET /api/search?q=query&limit=10
 * 
 * Semantic search for conversations
 */
export async function GET(req: NextRequest) {
  try {
    await ensureInitialized();
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const limitParam = searchParams.get('limit');
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }
    
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    
    // Generate embedding for search query
    console.log(`Searching for: "${query}"`);
    const queryEmbedding = await generateEmbedding(query);
    
    // Search for similar conversations
    const results = await searchBySimilarity(queryEmbedding, limit);
    
    console.log(`Found ${results.length} results`);
    
    return NextResponse.json({
      query,
      results,
      count: results.length,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
    
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
