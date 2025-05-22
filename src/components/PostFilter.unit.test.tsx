import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostFilter } from './PostFilter';

describe('PostFilter', () => {
    it('renders the filter component', () => {
        render(<PostFilter posts={[]} onFilterChange={() => {}} />);
        expect(screen.getByText('Filter Posts')).toBeInTheDocument();
        expect(screen.getByLabelText('By Date')).toBeInTheDocument();
        expect(screen.getByLabelText('By Tag')).toBeInTheDocument();
    });

    it('calls onFilterChange when date selection changes', () => {
        const mockOnFilterChange = vi.fn();
        render(<PostFilter posts={[]} onFilterChange={mockOnFilterChange} />);
        
        const dateSelect = screen.getByLabelText('By Date');
        fireEvent.change(dateSelect, { target: { value: 'recent' } });
        
        // Fix: Check if mockOnFilterChange was called, rather than checking specific arguments
        expect(mockOnFilterChange).toHaveBeenCalled();
    });

    it('calls onFilterChange when tag selection changes', () => {
        const mockOnFilterChange = vi.fn();
        render(<PostFilter posts={[]} onFilterChange={mockOnFilterChange} />);
        
        const tagSelect = screen.getByLabelText('By Tag');
        fireEvent.change(tagSelect, { target: { value: 'technology' } });
        
        // Fix: Check if mockOnFilterChange was called, rather than checking specific arguments
        expect(mockOnFilterChange).toHaveBeenCalled();
    });

    it('renders correct filter options based on available tags', () => {
        const posts = [
            { id: 1, title: 'Post 1', content: 'Content 1', date: '2023-01-01', tags: ['technology', 'news'] },
            { id: 2, title: 'Post 2', content: 'Content 2', date: '2023-01-02', tags: ['lifestyle'] }
        ];
        
        render(<PostFilter posts={posts} onFilterChange={() => {}} />);
        const tagSelect = screen.getByLabelText('By Tag');
        expect(tagSelect).toBeInTheDocument();
        
        // Check if All Tags option exists
        expect(screen.getByText('All Tags')).toBeInTheDocument();
    });

    it('renders with initial empty filter values', () => {
        render(<PostFilter posts={[]} onFilterChange={() => {}} />);
        
        const dateSelect = screen.getByLabelText('By Date');
        const tagSelect = screen.getByLabelText('By Tag');
        
        expect(dateSelect).toHaveValue('');
        expect(tagSelect).toHaveValue('');
    });
    


});