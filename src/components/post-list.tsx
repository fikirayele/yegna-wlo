"use client"

import { useState, useMemo } from 'react';
import type { Post } from '@/lib/types';
import { PostCard } from './post-card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useDebounce } from '@/hooks/use-debounce';

interface PostListProps {
  initialPosts: Post[];
}

type FilterType = 'title' | 'content' | 'comments';

export function PostList({ initialPosts }: PostListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('title');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredPosts = useMemo(() => {
    if (!debouncedSearchTerm) {
      return initialPosts;
    }
    const lowercasedTerm = debouncedSearchTerm.toLowerCase();
    return initialPosts.filter(post => {
      if (filterType === 'title') {
        return post.title.toLowerCase().includes(lowercasedTerm);
      }
      if (filterType === 'content') {
        return post.content.toLowerCase().includes(lowercasedTerm);
      }
      if (filterType === 'comments') {
        return post.comments.some(comment =>
          comment.content.toLowerCase().includes(lowercasedTerm)
        );
      }
      return false;
    });
  }, [debouncedSearchTerm, initialPosts, filterType]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Input
          placeholder={`Search by ${filterType}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="content">Content</SelectItem>
            <SelectItem value="comments">Comments</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filteredPosts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-2">No Posts Found</h2>
          <p className="text-muted-foreground">Try adjusting your search or filter.</p>
        </div>
      )}
    </div>
  );
}
