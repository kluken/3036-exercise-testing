import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import HomePage from './page';

// Import the mocked modules directly
import { PostFilter } from '../components/PostFilter';
import { PostList } from '../components/PostList';
import { posts } from '../lib/data';

// Mock the child components to isolate the HomePage component
vi.mock('../components/PostFilter', () => ({
    PostFilter: vi.fn().mockReturnValue(<div data-testid="post-filter" />)
}));

vi.mock('../components/PostList', () => ({
    PostList: vi.fn().mockReturnValue(<div data-testid="post-list" />)
}));

// Mock the data module
vi.mock('../lib/data', () => ({
    posts: [
        { id: '1', title: 'Test Post 1', date: '2023-01-01', tags: ['react'] },
        { id: '2', title: 'Test Post 2', date: '2023-02-01', tags: ['javascript'] },
        { id: '3', title: 'Test Post 3', date: '2023-01-01', tags: ['typescript'] }
    ]
}));

describe('HomePage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the UI structure correctly', () => {
        render(<HomePage />);
        
        // Check heading and navigation are present
        expect(screen.getByText('Blog Posts')).toBeInTheDocument();
        expect(screen.getByText('Admin Area')).toBeInTheDocument();
        
        // Check child components are rendered
        expect(screen.getByTestId('post-filter')).toBeInTheDocument();
        expect(screen.getByTestId('post-list')).toBeInTheDocument();
    });

    it('passes posts data to child components', () => {
        render(<HomePage />);
        
        // Check the PostFilter received the posts
        const filterProps = (PostFilter as vi.Mock).mock.calls[0][0];
        expect(filterProps.posts).toEqual(posts);
        expect(typeof filterProps.onFilterChange).toBe('function');
        
        // Check the PostList received the posts
        const listProps = (PostList as vi.Mock).mock.calls[0][0];
        expect(listProps.posts).toEqual(posts);
    });

    it('manages window event listeners correctly', () => {
        const addSpy = vi.spyOn(window, 'addEventListener');
        const removeSpy = vi.spyOn(window, 'removeEventListener');
        
        const { unmount } = render(<HomePage />);
        expect(addSpy).toHaveBeenCalledWith('storage', expect.any(Function));
        
        unmount();
        expect(removeSpy).toHaveBeenCalledWith('storage', expect.any(Function));
        
        addSpy.mockRestore();
        removeSpy.mockRestore();
    });

    it('filters posts when filter function is called', () => {
        render(<HomePage />);
        
        // Get filter function that was passed to PostFilter
        const filterProps = (PostFilter as vi.Mock).mock.calls[0][0];
        const onFilterChange = filterProps.onFilterChange;
        
        // Clear mock to check next calls more easily
        vi.clearAllMocks();
        
        // Call filter function with date filter
        act(() => {
            onFilterChange('2023-01-01', '');
        });
        
        // Check that PostList was called with filtered posts
        const filteredPosts = posts.filter(post => post.date === '2023-01-01');
        const updatedProps = (PostList as vi.Mock).mock.calls[0][0];
        expect(updatedProps.posts).toEqual(filteredPosts);
    });

    it('initializes posts on mount correctly', () => {
        // Clear mocks to ensure we only track the calls made during this test
        vi.clearAllMocks();
        
        // Instead of mocking useState, observe the props passed to the child components
        render(<HomePage />);
        
        // Check that PostFilter received the posts on initial render
        const filterProps = (PostFilter as vi.Mock).mock.calls[0][0];
        expect(filterProps.posts).toEqual(posts);
        
        // Check that PostList received the posts on initial render
        const listProps = (PostList as vi.Mock).mock.calls[0][0];
        expect(listProps.posts).toEqual(posts);
    });

    it('updates posts when storage event is triggered', () => {
        // Clear mocks to ensure we only track the calls made during this test
        vi.clearAllMocks();
        
        render(<HomePage />);
        
        // Clear component mocks after initial render
        vi.clearAllMocks();
        
        // Simulate storage event
        act(() => {
            window.dispatchEvent(new Event('storage'));
        });
        
        // Verify that the components were called again with the posts data
        // This confirms the event handler in useEffect is working
        expect(PostFilter).toHaveBeenCalledTimes(1);
        expect(PostList).toHaveBeenCalledTimes(1);
        
        // Check that the components received the correct data after event
        const filterProps = (PostFilter as vi.Mock).mock.calls[0][0];
        expect(filterProps.posts).toEqual(posts);
        
        const listProps = (PostList as vi.Mock).mock.calls[0][0];
        expect(listProps.posts).toEqual(posts);
    });

    it('filters posts by tag when tag filter is applied', () => {
        render(<HomePage />);
        
        // Get filter function that was passed to PostFilter
        const filterProps = (PostFilter as vi.Mock).mock.calls[0][0];
        const onFilterChange = filterProps.onFilterChange;
        
        // Clear mock to check next calls more easily
        vi.clearAllMocks();
        
        // Call filter function with tag filter
        act(() => {
            onFilterChange('', 'react');
        });
        
        // Check that PostList was called with posts filtered by tag
        const filteredPosts = posts.filter(post => 
            post.tags.some(tag => tag.toLowerCase() === 'react')
        );
        const updatedProps = (PostList as vi.Mock).mock.calls[0][0];
        expect(updatedProps.posts).toEqual(filteredPosts);
    });

    it('filters posts by multiple comma-separated tags', () => {
        render(<HomePage />);
        
        // Get filter function that was passed to PostFilter
        const filterProps = (PostFilter as vi.Mock).mock.calls[0][0];
        const onFilterChange = filterProps.onFilterChange;
        
        // Clear mock to check next calls more easily
        vi.clearAllMocks();
        
        // Call filter function with multiple tags
        act(() => {
            onFilterChange('', 'react, javascript');
        });
        
        // Check that PostList was called with posts filtered by multiple tags
        const filteredPosts = posts.filter(post => 
            post.tags.some(tag => 
                ['react', 'javascript'].includes(tag.toLowerCase())
            )
        );
        const updatedProps = (PostList as vi.Mock).mock.calls[0][0];
        expect(updatedProps.posts).toEqual(filteredPosts);
    });

    it('handles case-insensitive tag filtering', () => {
        render(<HomePage />);
        
        // Get filter function that was passed to PostFilter
        const filterProps = (PostFilter as vi.Mock).mock.calls[0][0];
        const onFilterChange = filterProps.onFilterChange;
        
        // Clear mock to check next calls more easily
        vi.clearAllMocks();
        
        // Call filter function with uppercase tag
        act(() => {
            onFilterChange('', 'REACT');
        });
        
        // Check that PostList was called with posts filtered by the tag (case-insensitive)
        const filteredPosts = posts.filter(post => 
            post.tags.some(tag => tag.toLowerCase() === 'react')
        );
        const updatedProps = (PostList as vi.Mock).mock.calls[0][0];
        expect(updatedProps.posts).toEqual(filteredPosts);
    });

    it('filters posts by both date and tag simultaneously', () => {
        render(<HomePage />);
        
        // Get filter function that was passed to PostFilter
        const filterProps = (PostFilter as vi.Mock).mock.calls[0][0];
        const onFilterChange = filterProps.onFilterChange;
        
        // Clear mock to check next calls more easily
        vi.clearAllMocks();
        
        // Call filter function with both date and tag filters
        act(() => {
            onFilterChange('2023-01-01', 'typescript');
        });
        
        // Check that PostList was called with posts filtered by both criteria
        const filteredPosts = posts.filter(post => 
            post.date === '2023-01-01' && 
            post.tags.some(tag => tag.toLowerCase() === 'typescript')
        );
        const updatedProps = (PostList as vi.Mock).mock.calls[0][0];
        expect(updatedProps.posts).toEqual(filteredPosts);
    });
});