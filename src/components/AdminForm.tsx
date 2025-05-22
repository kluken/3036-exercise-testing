"use client";

import { FormEvent } from "react";
import { savePost } from "../actions/posts";
import { Post } from "../types";

/**
 * Props interface for the AdminForm component
 * Allows for optional post data when editing an existing post
 */
interface AdminFormProps {
  post?: Post;
  onSuccess?: () => void;
}

/**
 * AdminForm Component
 * 
 * A form component for creating new posts or editing existing ones.
 * It handles form submission and passes form data to the savePost action.
 * 
 * @param {AdminFormProps} props - Component properties including optional post data
 * @returns {JSX.Element} Rendered form component
 */
export function AdminForm({ post, onSuccess }: AdminFormProps) {
  /**
   * Form submission handler
   * Prevents default form submission, collects form data, and passes it to the savePost action
   * 
   * @param {FormEvent<HTMLFormElement>} event - The form submission event
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await savePost(formData);
    
    if (result.success && onSuccess) {
      onSuccess();
      
      // Reset form if it's a new post
      if (!post) {
        (event.target as HTMLFormElement).reset();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} role="form" className="admin-form">
      {/* Post title input field */}
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={post?.title || ''}
          required
          className="form-control"
          data-testid="post-title-input"
        />
      </div>

      {/* Post content textarea */}
      <div className="form-group">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          defaultValue={post?.content || ''}
          required
          className="form-control"
          rows={5}
          data-testid="post-content-input"
        />
      </div>

      {/* Post tags input field - accepts comma-separated values */}
      <div className="form-group">
        <label htmlFor="tags">Tags (comma separated)</label>
        <input
          type="text"
          id="tags"
          name="tags"
          defaultValue={post?.tags?.join(', ') || ''}
          className="form-control"
          placeholder="e.g. javascript, react, frontend"
          data-testid="post-tags-input"
        />
      </div>

      {/* Hidden field to pass post ID when editing */}
      {post?.id && <input type="hidden" name="id" value={post.id} />}
      
      {/* Submit button with context-aware label */}
      <button type="submit" className="submit-button" data-testid="post-submit-button">
        {post ? 'Update Post' : 'Create Post'}
      </button>
    </form>
  );
}
