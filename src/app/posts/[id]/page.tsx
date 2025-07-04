
import { getPost, getPosts } from '@/lib/api';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { CommentSection } from '@/components/comment-section';
import Image from 'next/image';
import type { Post } from '@/lib/types';
import { ReportPostButton } from '@/components/report-post-button';
import { Flag } from 'lucide-react';
import { PostActions } from '@/components/post-actions';
import { RecommendedPostList } from '@/components/recommended-post-list';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';

interface PostPageProps {
  params: {
    id: string;
  };
}

const MediaElement = ({ post }: { post: Post }) => {
    if (!post.mediaUrl) {
      return null;
    }

    if (post.mediaType === 'image') {
        return (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden my-0">
                <Image
                    src={post.mediaUrl}
                    alt={post.title}
                    fill
                    className="object-cover bg-muted"
                    data-ai-hint={post.mediaHint}
                    priority
                />
            </div>
        );
    }
    
    if (post.mediaType === 'video') {
        return (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black my-0">
                <video
                    src={post.mediaUrl}
                    controls
                    className="w-full h-full object-contain"
                />
            </div>
        );
    }

    return null;
};


export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.id);
  const allPosts = await getPosts();

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-6">
      <article className="lg:col-span-2 xl:col-span-3 space-y-6">
        <MediaElement post={post} />

        <div className="flex items-center gap-3">
          <h1 className="font-headline text-3xl md:text-4xl font-bold">{post.title}</h1>
          {post.reports && post.reports.length > 0 && post.status !== 'warned' && (
              <Flag className="h-6 w-6 text-destructive flex-shrink-0" />
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center text-muted-foreground">
            <Avatar className="h-10 w-10 mr-4">
              <AvatarImage src={post.author.avatarUrl} alt={post.author.username} />
              <AvatarFallback>{post.author.username.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground text-base">{post.author.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
              <PostActions postId={post.id} initialLikes={post.likes} />
              <ReportPostButton postId={post.id} postAuthorId={post.author.id} initialReports={post.reports} variant="icon" />
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full bg-muted/50 rounded-lg" defaultValue="item-1">
            <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="p-4 hover:no-underline">
                   <time dateTime={post.createdAt} className="text-sm font-semibold">{format(new Date(post.createdAt), 'MMMM d, yyyy')}</time>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                    <div className="prose dark:prose-invert max-w-none text-sm"
                    style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                        {post.content}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        <Separator />

        <CommentSection 
            postId={post.id} 
            initialComments={post.comments} 
        />
      </article>

      <aside className="lg:col-span-1 xl:col-span-1 space-y-4">
          <RecommendedPostList posts={allPosts} currentPostId={post.id} />
      </aside>
    </div>
  );
}
