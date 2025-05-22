/**
 * Admin Dashboard Page Component
 * 
 * This component serves as the main admin interface for the blog application.
 * It provides a structured layout with appropriate headings and includes
 * the AdminForm component for creating and managing blog posts.
 */

"use client";

import { useState, useEffect } from "react";
import { AdminForm } from "../../components/AdminForm";
import { posts } from "../../lib/data";
import { deletePost } from "../../actions/posts";
import { Post } from "../../types";
import Link from "next/link";

/**
 * AdminPage Component
 * 
 * Renders the admin dashboard with:
 * - A primary heading that identifies the page
 * - A section for post creation with its own heading
 * - The AdminForm component for handling post submission
 * 
 * @returns {JSX.Element} The rendered AdminPage component
 */
export default function AdminPage() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [message, setMessage] = useState<string>("");

  // Load posts on mount and when localStorage changes
  useEffect(() => {
    // Update posts when the component mounts
    setAllPosts([...posts]);

    // Setup event listener for storage changes
    const handleStorageChange = () => {
      // This will handle updates from other tabs/windows
      setAllPosts([...posts]);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setMessage("");
  };

  const handleDelete = async (id: number) => {
    const result = await deletePost(id);
    if (result.success) {
      setAllPosts(allPosts.filter(post => post.id !== id));
      setMessage("Post deleted successfully");
      
      // If we were editing this post, clear the form
      if (editingPost?.id === id) {
        setEditingPost(null);
      }
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  const handleFormSubmit = () => {
    // This will be called after form submission
    // Refresh posts from storage
    setAllPosts([...posts]);
    setEditingPost(null);
    setMessage("Post saved successfully");
  };

  return (
    <div className="admin-page">
      <h1>Blog Admin</h1>
      <Link href="/" className="home-link">← Back to Blog</Link>
      
      {message && <div className="message">{message}</div>}
      
      <div className="admin-layout">
        <div className="post-editor">
          <h2>{editingPost ? "Edit Post" : "Create New Post"}</h2>
          <AdminForm 
            post={editingPost || undefined} 
            onSuccess={handleFormSubmit}
          />
          {editingPost && (
            <button 
              onClick={() => setEditingPost(null)} 
              className="cancel-button"
            >
              Cancel Editing
            </button>
          )}
        </div>
        
        <div className="post-list">
          <h2>Existing Posts</h2>
          {allPosts.length === 0 ? (
            <p>No posts available.</p>
          ) : (
            <ul>
              {allPosts.map(post => (
                <li key={post.id} className="admin-post-item">
                  <article>
                  <div className="post-info">
                    <h3>{post.title}</h3>
                    <p className="post-date">{post.date}</p>
                    <p className="post-tags">{post.tags.join(", ")}</p>
                  </div>
                  <div className="post-actions">
                    <button 
                      onClick={() => handleEdit(post)}
                      className="edit-button"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}