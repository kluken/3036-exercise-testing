"use client"; // Directive for Next.js that marks this as a client component (runs in browser)

import React, { useState, useCallback, useEffect } from "react";
import { PostFilter } from "../components/PostFilter";
import { PostList } from "../components/PostList";
import { posts } from "../lib/data";
import { Post } from "../types";
import Link from "next/link";

/**
 * HomePage Component
 *
 * This is the main page component for our blog application.
 * It manages post filtering state and coordinates between the filter
 * and list components.
 *
 * @returns {JSX.Element} The rendered home page
 */
export default function HomePage() {
  // State to track all posts and which posts should be displayed based on applied filters
  // Initially shows all posts from our data source
  const [allPosts, setAllPosts] = useState<Post[]>(posts);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts);

  // Update posts when the component mounts or localStorage changes
  useEffect(() => {
    setAllPosts([...posts]);
    setFilteredPosts([...posts]);

    const handleStorageChange = () => {
      setAllPosts([...posts]);
      setFilteredPosts([...posts]);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  /**
   * Filter change handler
   *
   * Uses useCallback to prevent unnecessary re-renders in child components
   * that receive this function as a prop.
   *
   * @param {string} dateFilter - The selected date to filter by (YYYY-MM-DD format)
   * @param {string} tagFilter - Comma-separated list of tags to filter by
   */
  const handleFilterChange = useCallback(
    (dateFilter: string, tagFilter: string) => {
      // Start with a copy of all posts
      let results = [...allPosts];

      // Filter by date if provided
      // Only show posts that exactly match the selected date
      if (dateFilter) {
        results = results.filter((post) => post.date === dateFilter);
      }

      // Filter by tag if provided
      // Handle comma-separated tags and case-insensitive matching
      if (tagFilter) {
        const tags = tagFilter.toLowerCase().split(",").map((tag) => tag.trim());
        results = results.filter((post) =>
          post.tags.some((tag) => tags.includes(tag.toLowerCase()))
        );
      }

      // Update state with filtered results
      setFilteredPosts(results);
    },
    [allPosts] // Depend on allPosts state to update filtered results accordingly
  );

  return (
    <div>
      <header className="blog-header">
        <h1>Blog Posts</h1>
        <Link href="/admin" className="admin-link">Admin Area</Link>
      </header>

      {/* Filter component with callback for filter changes */}
      <PostFilter posts={allPosts} onFilterChange={handleFilterChange} />

      {/* List component showing only the filtered posts */}
      <PostList posts={filteredPosts} />
    </div>
  );
}
