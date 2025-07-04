
'use server';

import type { Post, Comment, User, UserRole, UserStatus, Report, PostStatus } from './types';

// --- Live API Integration ---
// The API base URL is configured in the .env file.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// DEVELOPER NOTE:
// The functions `getPosts` and `getPost` have been updated to fetch data from the live API.
// The remaining functions (e.g., createPost, updateUser, loginUser) still use the mock data below.
// To complete the integration, you will need to:
// 1. Update each function to make a `fetch` call to your backend endpoint.
// 2. Ensure the request method (POST, PUT, DELETE) and body match your API's requirements.
// 3. Handle authentication, likely by sending a JWT token in the 'Authorization' header.
// 4. Remove the mock data and logic once all functions are connected to the live API.


// --- Mock Data Store with HMR protection (Used as a fallback and for unconnected functions) ---
declare global {
  // eslint-disable-next-line no-var
  var __mockDb: {
    users: User[];
    posts: Post[];
    comments: Comment[];
  };
}

const initialUsers: User[] = [
  { id: '1', username: 'CreativeWriter', email: 'creative.writer@example.com', role: 'admin', status: 'active', avatarUrl: 'https://placehold.co/100x100.png', strikes: 0, createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', username: 'TechGuru', email: 'tech.guru@example.com', role: 'admin', status: 'active', avatarUrl: 'https://placehold.co/100x100.png', strikes: 0, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', username: 'FoodieFanatic', email: 'foodie.fanatic@example.com', role: 'admin', status: 'active', avatarUrl: 'https://placehold.co/100x100.png', strikes: 0, createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '4', username: 'wonde', email: 'gamer.geek@example.com', role: 'user', status: 'active', avatarUrl: 'https://placehold.co/100x100.png', strikes: 1, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '5', username: 'ArtisanAesthetics', email: 'artisan.aesthetics@example.com', role: 'user', status: 'active', avatarUrl: 'https://placehold.co/100x100.png', strikes: 0, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
];

const initialComments: Comment[] = [
  { id: 'c1', content: 'This is an insightful post, thanks for sharing!', author: initialUsers[1], createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'c2', content: 'I completely agree with your points.', author: initialUsers[2], createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
  { id: 'c3', content: 'Could you elaborate on the second point?', author: initialUsers[0], createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { id: 'c4', content: 'Fascinating read!', author: initialUsers[2], createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
];

const initialPosts: Post[] = [
  {
    id: '1',
    title: 'The Art of Modern Web Development',
    content: 'Web development has evolved significantly over the past decade. From static HTML pages to dynamic, interactive single-page applications (SPAs), the journey has been remarkable. Frameworks like React, Vue, and Svelte have revolutionized how we build for the web, enabling developers to create complex user interfaces with ease. This post delves into the core principles of modern web development, exploring component-based architecture, state management, and the importance of a good developer experience.',
    author: initialUsers[1],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    comments: [initialComments[0], initialComments[1]],
    likes: 125,
    mediaUrl: 'https://placehold.co/1200x600.png',
    mediaType: 'image',
    mediaHint: 'code laptop',
    reports: [
        ...Array.from({ length: 5 }, (_, i) => ({ reporterId: String((i % 5) + 1), reason: 'Spam or Scams', createdAt: new Date().toISOString() })),
        { reporterId: '3', reason: 'Illegal Activities', createdAt: new Date().toISOString() }
    ],
    status: 'published',
  },
  {
    id: '2',
    title: 'A Culinary Journey Through Italy',
    content: 'Italy, a country renowned for its rich history, art, and, of course, its food. This post takes you on a virtual culinary tour, from the creamy risottos of the north to the sun-ripened tomatoes and fresh seafood of the south. We will explore regional specialties, uncover the secrets behind a perfect pasta dish, and learn about the cultural significance of food in Italian life. Prepare your taste buds for an unforgettable adventure!',
    author: initialUsers[2],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    comments: [initialComments[3]],
    likes: 240,
    mediaUrl: 'https://placehold.co/1200x600.png',
    mediaType: 'image',
    mediaHint: 'italian food',
    reports: [],
    status: 'published',
  },
  {
    id: '3',
    title: 'The Future of Artificial Intelligence',
    content: 'Artificial Intelligence (AI) is no longer a concept confined to science fiction. It is here, and it is transforming industries from healthcare to finance. This article explores the latest advancements in AI, including machine learning, natural language processing, and computer vision. We will also discuss the ethical considerations and societal impact of AI, as we stand on the brink of a new technological revolution. What does the future hold? Let\'s find out together.',
    author: initialUsers[1],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    comments: [initialComments[2]],
    likes: 310,
    mediaUrl: 'https://placehold.co/1200x600.png',
    mediaType: 'image',
    mediaHint: 'ai robot',
    reports: [],
    status: 'published',
  },
  {
    id: '4',
    title: 'Unlocking Creativity: A Guide for Writers',
    content: 'Every writer faces the dreaded blank page. This guide offers practical tips and exercises to help you overcome writer\'s block and unlock your creative potential. From freewriting and brainstorming techniques to building a consistent writing habit, we cover everything you need to get your ideas flowing. Whether you are a seasoned author or just starting, this post will inspire you to tell your story.',
    author: initialUsers[0],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    comments: [],
    likes: 88,
    mediaUrl: 'https://placehold.co/1200x600.png',
    mediaType: 'image',
    mediaHint: 'writing book',
    reports: [
        ...Array.from({ length: 15 }, (_, i) => ({ reporterId: String((i % 5) + 1), reason: 'Hate Speech', createdAt: new Date().toISOString() })),
        ...Array.from({ length: 8 }, (_, i) => ({ reporterId: String((i % 5) + 1), reason: 'Harassment or Bullying', createdAt: new Date().toISOString() })),
        ...Array.from({ length: 3 }, (_, i) => ({ reporterId: String((i % 5) + 1), reason: 'Spam or Scams', createdAt: new Date().toISOString() })),
    ],
    status: 'warned',
    warningMessage: 'This post has been flagged by the community for violating guidelines. Further reports may result in its removal.',
  },
];

function getMockDb() {
  if (process.env.NODE_ENV === 'production') {
    return { users: initialUsers, posts: initialPosts, comments: initialComments };
  }

  if (!global.__mockDb) {
    global.__mockDb = {
      users: initialUsers,
      posts: initialPosts,
      comments: initialComments,
    };
  }
  return global.__mockDb;
}

const db = getMockDb();

// Simulate API latency for mock functions
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const MOCK_PASS = 'password123';
const STRIKE_LIMIT = 2; // User is blocked when strikes >= this value

// --- API Functions ---

export const getPosts = async (): Promise<Post[]> => {
  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const data: Post[] = await response.json();
      return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.warn("Failed to fetch posts from live API, falling back to mock data.", error);
      // Fallback logic is now inside the catch block
      return [...db.posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }
  
  // This part only runs if API_BASE_URL is not set
  console.log("Using mock data for getPosts() because API_BASE_URL is not set.");
  return [...db.posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getPost = async (id: string): Promise<Post | undefined> => {
    if (API_BASE_URL) {
        try {
            const response = await fetch(`${API_BASE_URL}/posts/${id}`);
            if (!response.ok) {
              throw new Error(`API request failed with status ${response.status}`);
            }
            const data: Post = await response.json();
            return data;
        } catch (error) {
            console.warn(`Failed to fetch post ${id} from live API, falling back to mock data.`, error);
            // Fallback logic is now inside the catch block
            return db.posts.find(p => p.id === id);
        }
    }

    // This part only runs if API_BASE_URL is not set
    console.log(`Using mock data for getPost(${id}) because API_BASE_URL is not set.`);
    return db.posts.find(p => p.id === id);
};


// --- Functions below still use MOCK DATA and need to be connected to the backend ---

export const loginUser = async (username: string, password: string): Promise<User | null> => {
  // TODO: Replace with a POST request to your backend's /login endpoint.
  console.warn("loginUser is using mock data.");
  await delay(500);
  if (password !== MOCK_PASS) {
    return null;
  }
  const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (user?.status === 'blocked') {
    throw new Error('This account has been blocked due to community guideline violations.');
  }

  return user || null;
}

export const registerUser = async (username: string, password: string): Promise<User> => {
  // TODO: Replace with a POST request to your backend's /register endpoint.
  console.warn("registerUser is using mock data.");
  await delay(500);
  if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('Username already exists.');
  }
  const newUser: User = {
    id: String(db.users.length + 1),
    username,
    email: `${username.toLowerCase().replace(/\s/g, '.')}@example.com`,
    role: 'user',
    status: 'active',
    avatarUrl: 'https://placehold.co/100x100.png',
    strikes: 0,
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  return newUser;
};

export const createPost = async (
    title: string, 
    content: string, 
    author: User, 
    mediaUrl?: string, 
    mediaType?: 'image' | 'video'
): Promise<Post> => {
  // TODO: Replace with a POST request to your backend's /posts endpoint.
  console.warn("createPost is using mock data.");
  await delay(600);
  const newPost: Post = {
    id: `post-${Date.now()}-${db.posts.length}`,
    title,
    content,
    author,
    createdAt: new Date().toISOString(),
    comments: [],
    likes: 0,
    mediaUrl: mediaUrl || undefined,
    mediaType: mediaType || undefined,
    mediaHint: title.split(' ').slice(0, 2).join(' ').toLowerCase(),
    reports: [],
    status: 'published',
  };
  db.posts.unshift(newPost);
  return newPost;
}

export const updatePost = async (
  postId: string,
  updates: { 
    title: string; 
    content: string; 
    mediaUrl?: string | null,
    mediaType?: 'image' | 'video' | null,
  }
): Promise<Post | null> => {
  // TODO: Replace with a PUT request to your backend's /posts/:id endpoint.
  console.warn(`updatePost(${postId}) is using mock data.`);
  await delay(600);
  const postIndex = db.posts.findIndex(p => p.id === postId);
  if (postIndex > -1) {
    const originalPost = db.posts[postIndex];
    const updatedPost: Post = {
      ...originalPost,
      title: updates.title,
      content: updates.content,
      mediaUrl: updates.mediaUrl === null ? undefined : updates.mediaUrl ?? originalPost.mediaUrl,
      mediaType: updates.mediaType === null ? undefined : updates.mediaType ?? originalPost.mediaType,
    };
    
    if (updates.mediaUrl === null) {
      delete updatedPost.mediaUrl;
      delete updatedPost.mediaType;
    }

    db.posts[postIndex] = updatedPost;
    return updatedPost;
  }
  return null;
}

export const createComment = async (postId: string, content: string, author: User): Promise<Comment> => {
  // TODO: Replace with a POST request to your backend's /posts/:id/comments endpoint.
  console.warn(`createComment(${postId}) is using mock data.`);
  await delay(400);
  const post = db.posts.find(p => p.id === postId);
  if (!post) {
    throw new Error('Post not found');
  }
  const newComment: Comment = {
    id: `comment-${Date.now()}`,
    content,
    author,
    createdAt: new Date().toISOString(),
  };
  post.comments.unshift(newComment);
  return newComment;
}

export const getUsers = async (): Promise<User[]> => {
    // TODO: Replace with a GET request to your backend's /users endpoint.
    console.warn("getUsers is using mock data.");
    await delay(100);
    return [...db.users];
}

export const getPostsByAuthor = async (authorId: string): Promise<Post[]> => {
    // TODO: Replace with a GET request to your backend's /users/:id/posts endpoint.
    console.warn(`getPostsByAuthor(${authorId}) is using mock data.`);
    await delay(400);
    const authorPosts = db.posts.filter(p => p.author.id === authorId);
    return [...authorPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const deletePost = async (postId: string): Promise<{ success: boolean }> => {
    // TODO: Replace with a DELETE request to your backend's /posts/:id endpoint.
    console.warn(`deletePost(${postId}) is using mock data.`);
    await delay(500);
    const postIndex = db.posts.findIndex(p => p.id === postId);
    if (postIndex > -1) {
        db.posts.splice(postIndex, 1);
        return { success: true };
    }
    return { success: false };
}

export const deleteUser = async (userId: string): Promise<{ success: boolean }> => {
    // TODO: Replace with a DELETE request to your backend's /users/:id endpoint.
    console.warn(`deleteUser(${userId}) is using mock data.`);
    await delay(500);
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        // Not a real DB, so we need to manually cascade deletes
        db.posts = db.posts.filter(p => p.author.id !== userId);
        db.posts.forEach(post => {
            post.comments = post.comments.filter(c => c.author.id !== userId);
        });
        db.users.splice(userIndex, 1);
        return { success: true };
    }
    return { success: false };
};

export const updateUser = async (userId: string, updates: Partial<Pick<User, 'role' | 'status'>>): Promise<User | null> => {
    // TODO: Replace with a PUT request to your backend's /users/:id endpoint.
    console.warn(`updateUser(${userId}) is using mock data.`);
    await delay(300);
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        db.users[userIndex] = { ...db.users[userIndex], ...updates };
        const updatedUser = db.users[userIndex];
        
        db.posts.forEach(p => {
            if (p.author.id === userId) p.author = updatedUser;
            p.comments.forEach(c => {
                if (c.author.id === userId) c.author = updatedUser;
            });
        });

        return { ...updatedUser };
    }
    return null;
}

export const updateUserProfile = async (userId: string, updates: Partial<Pick<User, 'username' | 'avatarUrl'>>): Promise<User | null> => {
    // TODO: Replace with a PUT request to your backend's /profile or /users/:id endpoint.
    console.warn(`updateUserProfile(${userId}) is using mock data.`);
    await delay(300);
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        if (updates.username && db.users.some(u => u.username.toLowerCase() === updates.username!.toLowerCase() && u.id !== userId)) {
            throw new Error('Username already exists.');
        }

        db.users[userIndex] = { ...db.users[userIndex], ...updates };
        const updatedUser = db.users[userIndex];
        
        db.posts.forEach(p => {
            if (p.author.id === userId) p.author = updatedUser;
            p.comments.forEach(c => {
                if (c.author.id === userId) c.author = updatedUser;
            });
        });

        return { ...updatedUser };
    }
    return null;
}

export const reportPost = async (postId: string, reporterId: string, reason: string): Promise<{ success: boolean; message: string }> => {
  // TODO: Replace with a POST request to your backend's /posts/:id/report endpoint.
  console.warn(`reportPost(${postId}) is using mock data.`);
  await delay(400);
  const postIndex = db.posts.findIndex(p => p.id === postId);
  if (postIndex === -1) return { success: false, message: 'Post not found.' };
  
  const post = db.posts[postIndex];

  if (post.reports?.some(r => r.reporterId === reporterId)) return { success: false, message: 'You have already reported this post.' };
  if (post.author.id === reporterId) return { success: false, message: 'You cannot report your own post.' };
  
  post.reports.push({ reporterId, reason, createdAt: new Date().toISOString() });
  db.posts[postIndex] = post;

  return { success: true, message: 'Thank you. An admin will review this post for community guideline violations.' };
};

// Functions below are for admin actions and also need to be connected.

export const dismissReports = async (postId: string): Promise<{ success: boolean }> => {
    console.warn(`dismissReports(${postId}) is using mock data.`);
    await delay(300);
    const postIndex = db.posts.findIndex(p => p.id === postId);
    if (postIndex > -1) {
        db.posts[postIndex].reports = [];
        return { success: true };
    }
    return { success: false };
};

export const strikeUserForPost = async (postId: string): Promise<{ success: boolean; message: string }> => {
    console.warn(`strikeUserForPost(${postId}) is using mock data.`);
    await delay(500);
    const postIndex = db.posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return { success: false, message: "Post not found." };
    
    const post = db.posts[postIndex];
    const authorId = post.author.id;
    const userIndex = db.users.findIndex(u => u.id === authorId);

    if (userIndex === -1) return { success: false, message: "Author not found." };

    const user = db.users[userIndex];
    user.strikes = (user.strikes || 0) + 1;

    let message = `User ${user.username} has been issued a strike. They now have ${user.strikes} strike(s).`;

    if (user.strikes >= STRIKE_LIMIT) {
        user.status = 'blocked';
        message += ` The user has been blocked.`;
        db.posts.forEach(p => {
            if (p.author.id === user.id) p.author = { ...user };
            p.comments.forEach(c => { if (c.author.id === user.id) c.author = { ...user }; });
        });
    }
    
    db.users[userIndex] = { ...user };
    post.status = 'warned';
    post.warningMessage = `This post has received a warning and its author has been issued a strike for violating community guidelines.`;
    post.reports = [];
    db.posts[postIndex] = post;

    return { success: true, message };
};

export const warnPostAsAdmin = async (postId: string): Promise<{ success: boolean }> => {
    console.warn(`warnPostAsAdmin(${postId}) is using mock data.`);
    await delay(400);
    const postIndex = db.posts.findIndex(p => p.id === postId);
    if (postIndex > -1) {
        db.posts[postIndex].status = 'warned';
        db.posts[postIndex].warningMessage = 'This post has received a warning from an administrator for violating community guidelines.';
        db.posts[postIndex].reports = [];
        return { success: true };
    }
    return { success: false };
};
