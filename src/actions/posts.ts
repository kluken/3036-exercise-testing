"use client";

import { posts, savePosts } from "../lib/data";
import type { Post } from "../types";

/**
 * Client-side action: Save Post
 * 
 * This function handles both creating new posts and updating existing ones.
 * It processes form data, validates inputs, and updates the data store.
 * 
 * @param formData - FormData object containing post details
 * @returns Object with success status and post ID or error message
 */
export async function savePost(formData: FormData) {
  // Get current posts - make a copy to work with
  const currentPosts = [...posts];
  
  // STEP 1: Extract input data from the form
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const tagsString = formData.get('tags') as string;
  const existingId = formData.get('id') as string;

  // STEP 2: Process tags
  const tags = tagsString
    ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    : [];

  // STEP 3: Generate current date in YYYY-MM-DD format for new posts
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];

  // STEP 4: Handle post updates vs new post creation
  if (existingId) {
    // UPDATE LOGIC
    const id = parseInt(existingId, 10);
    const postIndex = currentPosts.findIndex(post => post.id === id);
    
    if (postIndex !== -1) {
      // Update existing post
      currentPosts[postIndex] = {
        ...currentPosts[postIndex],
        title,
        content,
        tags,
      };
      
      // Save updated posts to localStorage AND update the original array
      savePosts(currentPosts);
      
      // Update the original posts array
      posts.length = 0;
      posts.push(...currentPosts);
      
      return { success: true, id };
    } else {
      return { success: false, error: "Post not found" };
    }
  } else {
    // CREATE LOGIC
    const maxId = currentPosts.reduce((max, post) => Math.max(max, post.id), 0);
    const newId = maxId + 1;
    
    const newPost: Post = {
      id: newId,
      title,
      content,
      date: dateString,
      tags,
    };
    
    // Add to posts array and save to localStorage
    currentPosts.push(newPost);
    savePosts(currentPosts);
    
    // Update the original posts array
    posts.length = 0;
    posts.push(...currentPosts);
    
    return { success: true, id: newId };
  }
}

// Function to delete a post
export async function deletePost(id: number) {
  const currentPosts = [...posts];
  const updatedPosts = currentPosts.filter(post => post.id !== id);
  
  if (updatedPosts.length !== currentPosts.length) {
    savePosts(updatedPosts);
    return { success: true };
  }
  
  return { success: false, error: "Post not found" };
}
