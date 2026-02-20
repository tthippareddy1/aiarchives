'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ConversationRecord } from '@/lib/db/types';

interface SearchResultsProps {
  results: ConversationRecord[];
  query: string;
}

export function SearchResults({ results, query }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <p className="text-gray-500 text-lg">
           {'No conversations found for "' + query + '"'}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Try different keywords or add more conversations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
	{'Found ' + results.length + ' conversation' + (results.length !== 1 ? 's' : '') + ' matching "' + query + '"'}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.map((conv) => {
          const avatar = conv.model.charAt(0).toUpperCase();
          const daysDiff = Math.floor(
            (new Date().getTime() - new Date(conv.createdAt).getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <Link key={conv.id} href={`/conversation/${conv.id}`}>
              <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 cursor-pointer hover:border-blue-300">
                <CardContent className="pt-6 px-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10 bg-blue-600">
                      <AvatarFallback className="text-white text-sm">
                        {avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 pt-1">
                      <p className="text-sm font-medium text-gray-800">
                        Anonymous
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        AI Conversation
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                  <div>
                    <Badge className="bg-blue-800 hover:bg-blue-700">
                      {conv.model}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <span>{conv.views} Views</span>
                    <span>|</span>
                    <span>{daysDiff} Days ago</span>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
