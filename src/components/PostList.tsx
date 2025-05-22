import React from "react";
import { Post } from "../types";

/**
 * Props interface for the PostList component
 * Specifies the array of posts to display
 */
interface PostListProps {
  posts: Post[]; // Array of post objects to render in the list
}

/**
 * PostList Component
 * 
 * Renders a list of blog posts with their titles, content, dates, and tags.
 * Includes conditional rendering when no posts are available.
 * 
 * @param {PostListProps} props - Component properties containing posts array
 * @returns {JSX.Element} Rendered list of posts
 */
export function PostList({ posts }: PostListProps) {

  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state-message">No posts found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <article key={post.id} className="post-card">
          <div className="post-content">
            <h2 className="post-title" role="heading">{post.title}</h2>
            <div className="post-meta">
              <span className="post-date">{post.date}</span>
            </div>
            <p className="post-excerpt">{post.content}</p>
            {post.tags && post.tags.length > 0 && (
              <div className="post-tags-list" data-testid="post-tags-container">
                {post.tags.map((tag) => (
                  <span key={tag} className="post-tag" data-testid={`tag-${tag}`}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}


// tags: string[];