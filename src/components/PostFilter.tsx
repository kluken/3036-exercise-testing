"use client"; // Marks this as a client component for Next.js (runs in the browser)

import { useState, useEffect } from "react";
import { Post } from "../types";

/**
 * Props interface for the PostFilter component
 * Defines the expected input properties and callback structure
 */
interface PostFilterProps {
  posts: Post[];                                         // Array of posts to be filtered
  onFilterChange: (dateFilter: string, tagFilter: string) => void; // Callback to notify parent of filter changes
}
  
/**
 * PostFilter Component
 * 
 * Provides UI controls for filtering blog posts by date and tags.
 * Maintains local state for filter values and notifies parent component of changes.
 * 
 * @param {PostFilterProps} props - Component properties including posts and filter change handler
 * @returns {JSX.Element} Rendered filter controls
 */
export function PostFilter({ posts, onFilterChange }: PostFilterProps) {
  // State hooks for tracking filter values
  const [dateFilter, setDateFilter] = useState<string>(""); // Date filter - empty string means no filter
  const [tagFilter, setTagFilter] = useState<string>("");   // Tag filter - empty string means no filter
  const [dates, setDates] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);


  // Get unique dates and tags from posts - move both to useEffect
  useEffect(() => {
    const uniqueDates = [...new Set(posts.map(post => post.date))].sort();
    const uniqueTags = [...new Set(posts.flatMap((post) => post.tags).filter(Boolean))].sort();
    
    setDates(uniqueDates);
    setTags(uniqueTags);
  }, [posts]);

  
  /**
   * Effect hook to notify parent component when filters change
   * Calls the onFilterChange callback whenever either filter is updated
   */
  useEffect(() => {
    onFilterChange(dateFilter, tagFilter);
    // Dependencies array includes all values referenced in the effect
  }, [dateFilter, tagFilter, onFilterChange]);

  return (
    <div className="filter-container">
      {/* Section heading */}
      <h2 className="filter-title">Filter Posts</h2>
      <div className="filter-controls">
        {/* Date filter control */}
        <div className="filter-group">
          <label htmlFor="date-filter" className="filter-label">
            By Date
          </label>
          <select
            id="date-filter"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Dates</option>
            {dates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>

        {/* Tag filter control */}
        <div className="filter-group">
          <label htmlFor="tag-filter" className="filter-label">
            By Tag
          </label>
          <select
            id="tag-filter"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
