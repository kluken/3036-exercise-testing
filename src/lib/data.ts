import type { Post } from "../types";

// Initial seed data
const initialPosts: Post[] = [
  {
    id: 1,
    title: "Welcome",
    content: "First post!",
    date: "2025-04-13",
    tags: ["intro"],
  },
  {
    id: 2,
    title: "Modern CSS Features",
    content: "Exploring CSS Grid, Flexbox, and Custom Properties for modern layouts",
    date: "2025-04-15",
    tags: ["css", "frontend"],
  },
  {
    id: 3,
    title: "TypeScript Best Practices",
    content: "Tips for writing maintainable TypeScript code with proper type definitions",
    date: "2025-04-18",
    tags: ["typescript", "javascript"],
  },
  {
    id: 4,
    title: "Web Performance Optimization",
    content: "Techniques to improve loading times and overall site performance",
    date: "2025-04-22",
    tags: ["performance", "optimization"],
  },
  {
    id: 5,
    title: "Introduction to React Hooks",
    content: "Understanding useState, useEffect and custom hooks in React applications",
    date: "2025-04-25",
    tags: ["react", "frontend", "javascript"],
  },
  {
    id: 6,
    title: "Building RESTful APIs with Node.js",
    content: "A step-by-step guide to creating robust REST APIs using Express",
    date: "2025-04-29",
    tags: ["nodejs", "backend", "api"],
  },
  {
    id: 7,
    title: "Responsive Design Principles",
    content: "Creating websites that work well on any device size",
    date: "2025-05-03",
    tags: ["css", "frontend", "design"],
  },
  {
    id: 8,
    title: "Web Accessibility Guidelines",
    content: "Making your web applications accessible to all users following WCAG standards",
    date: "2025-05-07",
    tags: ["accessibility", "frontend", "best-practices"],
  },
  {
    id: 9,
    title: "Authentication with JWT",
    content: "Implementing secure user authentication using JSON Web Tokens",
    date: "2025-05-10",
    tags: ["security", "backend", "authentication"],
  },
  {
    id: 10,
    title: "Introduction to GraphQL",
    content: "Understanding the benefits of GraphQL over traditional REST APIs",
    date: "2025-05-13",
    tags: ["graphql", "api", "backend"],
  },
];

// Helper function to get posts from localStorage or initialize with seed data
const getPosts = (): Post[] => {
  if (typeof window === 'undefined') {
    return initialPosts; // Return initial data during SSR
  }
  
  const storedPosts = localStorage.getItem('blog-posts');
  if (storedPosts) {
    try {
      return JSON.parse(storedPosts);
    } catch (error) {
      console.error('Error parsing posts from localStorage:', error);
      // Fall back to seed data
      savePosts(initialPosts);
      return initialPosts;
    }
  } else {
    // First time - initialize with seed data
    localStorage.setItem('blog-posts', JSON.stringify(initialPosts));
    return initialPosts;
  }
};

// Helper function to save posts to localStorage
export const savePosts = (updatedPosts: Post[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('blog-posts', JSON.stringify(updatedPosts));
  }
};

// Export posts from localStorage or initial data
export const posts: Post[] = getPosts();

// Function to reset posts back to initial state (useful for testing)
export const resetPosts = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('blog-posts', JSON.stringify(initialPosts));
  }
};
