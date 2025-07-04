import { getPosts } from '@/lib/api';
import { PostList } from '@/components/post-list';

export default async function Home() {
  const posts = await getPosts();

  return (
    <div>
      <h1 className="text-4xl font-headline font-bold mb-8">Latest Posts</h1>
      <PostList initialPosts={posts} />
    </div>
  );
}
