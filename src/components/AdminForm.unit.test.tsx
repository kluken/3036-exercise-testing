import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminForm } from './AdminForm';
import * as postsActions from '../actions/posts';

/**
 * Unit Tests for AdminForm Component
 * 
 * These tests verify that the AdminForm component correctly renders for both
 * create and edit modes, and properly handles form submission by calling 
 * the appropriate server action with the correct form data.
 */

// Mock the posts actions module to control its behavior and inspect calls
// This allows us to verify the component interacts correctly with server actions
vi.mock('../actions/posts', () => ({
    savePost: vi.fn((formData) => {
        // Expose the formData values for testing
        return formData;
    })
}));

describe('AdminForm', () => {
    // Reset mocks before each test to ensure test isolation
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Test Case 1: Verify basic form rendering in create mode
    it('renders create form when no post is provided', () => {
        render(<AdminForm />);
        
        // Check if form elements are present
        expect(screen.getByLabelText('Title')).toBeInTheDocument();
        expect(screen.getByLabelText('Content')).toBeInTheDocument();
        expect(screen.getByLabelText(/Tags/)).toBeInTheDocument();
        
        // Check if button text indicates creation mode
        expect(screen.getByRole('button')).toHaveTextContent('Create Post');
        
        // Form should not have a hidden ID field in create mode
        expect(screen.queryByDisplayValue(/id/i)).not.toBeInTheDocument();
    });

    // Test Case 2: Verify form renders correctly in edit mode with existing data
    it('renders edit form with post data when post is provided', () => {
        // Create test post data to simulate editing an existing post
        const post = {
            id: 123,
            title: 'Test Title',
            content: 'Test Content',
            tags: ['react', 'typescript'],
            date: new Date().toISOString()
        };
        
        render(<AdminForm post={post} />);
        
        // Check if form elements are pre-populated with post data
        expect(screen.getByLabelText('Title')).toHaveValue('Test Title');
        expect(screen.getByLabelText('Content')).toHaveValue('Test Content');
        expect(screen.getByLabelText(/Tags/)).toHaveValue('react, typescript');
        
        // Check if button text indicates edit mode
        expect(screen.getByRole('button')).toHaveTextContent('Update Post');
        
        // Check if hidden ID field exists with correct value
        const idField = document.querySelector('input[name="id"]');
        expect(idField).toBeInTheDocument();
        expect(idField).toHaveValue('123');
    });

    // Test Case 3: Verify form validation requirements
    it('marks title and content as required fields', () => {
        render(<AdminForm />);
        
        // Required fields should have the required attribute
        expect(screen.getByLabelText('Title')).toHaveAttribute('required');
        expect(screen.getByLabelText('Content')).toHaveAttribute('required');
        
        // Tags field should be optional
        expect(screen.getByLabelText(/Tags/)).not.toHaveAttribute('required');
    });

    // Test Case 4: Test form submission for creating a new post
    it('calls savePost with correct data on form submission for new post', async () => {
        render(<AdminForm />);
        
        // Fill out the form using userEvent for more realistic user interaction
        await userEvent.type(screen.getByLabelText('Title'), 'New Post Title');
        await userEvent.type(screen.getByLabelText('Content'), 'New post content');
        await userEvent.type(screen.getByLabelText(/Tags/), 'react, testing');
        
        // Submit the form
        const form = screen.getByRole('form');
        fireEvent.submit(form);
        
        // Verify savePost was called exactly once
        expect(postsActions.savePost).toHaveBeenCalledTimes(1);
        
        // Get the FormData from the first call to inspect it
        const formDataArg = vi.mocked(postsActions.savePost).mock.calls[0][0];
        expect(formDataArg).toBeInstanceOf(FormData);
        
        // Verify FormData contains expected values
        expect(formDataArg.get('title')).toBe('New Post Title');
        expect(formDataArg.get('content')).toBe('New post content');
        expect(formDataArg.get('tags')).toBe('react, testing');
    });

    // Test Case 5: Test form submission for editing an existing post
    it('calls savePost with correct data on form submission for editing existing post', async () => {
        // Create test data for an existing post
        const post = {
            id: 123,
            title: 'Original Title',
            content: 'Original Content',
            tags: ['original'],
            date: new Date().toISOString()
        };
        
        render(<AdminForm post={post} />);
        
        // Change the form values to simulate user edits
        const titleInput = screen.getByLabelText('Title');
        await userEvent.clear(titleInput);
        await userEvent.type(titleInput, 'Updated Title');
        
        const contentInput = screen.getByLabelText('Content');
        await userEvent.clear(contentInput);
        await userEvent.type(contentInput, 'Updated Content');
        
        const tagsInput = screen.getByLabelText(/Tags/);
        await userEvent.clear(tagsInput);
        await userEvent.type(tagsInput, 'updated, tags');
        
        // Submit the form
        const form = screen.getByRole('form');
        fireEvent.submit(form);
        
        // Verify savePost was called exactly once
        expect(postsActions.savePost).toHaveBeenCalledTimes(1);
        
        // Get the FormData from the first call
        const formDataArg = vi.mocked(postsActions.savePost).mock.calls[0][0];
        expect(formDataArg).toBeInstanceOf(FormData);
        
        // Verify FormData contains all expected values including the ID
        expect(formDataArg.get('id')).toBe('123');
        expect(formDataArg.get('title')).toBe('Updated Title');
        expect(formDataArg.get('content')).toBe('Updated Content');
        expect(formDataArg.get('tags')).toBe('updated, tags');
    });

    // Test Case 6: Verify preventDefault behavior to ensure client-side handling
    it('should prevent default form submission and use savePost instead', () => {
        // Setup a spy on preventDefault to track when it's called
        const preventDefaultSpy = vi.spyOn(Event.prototype, 'preventDefault');
        
        // Render the component
        render(<AdminForm />);
        
        // Get the form element
        const form = screen.getByRole('form');
        
        // Submit the form (will use a real Event internally)
        fireEvent.submit(form);
        
        // Verify both the spy was called (preventing default browser submission)
        // and our savePost action was called (client-side handling)
        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(postsActions.savePost).toHaveBeenCalled();
        
        // Clean up the spy to avoid affecting other tests
        preventDefaultSpy.mockRestore();
    });

    // Test Case 7: Verify onSuccess callback is called when form submission succeeds
    it('calls onSuccess callback when savePost returns success', async () => {
        // Setup savePost mock to return success
        vi.mocked(postsActions.savePost).mockResolvedValueOnce({ success: true, id: 123 });
        
        // Create a mock for the onSuccess callback
        const onSuccessMock = vi.fn();
        
        render(<AdminForm onSuccess={onSuccessMock} />);
        
        // Fill out the form with minimal required data
        await userEvent.type(screen.getByLabelText('Title'), 'Test Title');
        await userEvent.type(screen.getByLabelText('Content'), 'Test Content');
        
        // Submit the form
        const form = screen.getByRole('form');
        await fireEvent.submit(form);
        
        // Verify onSuccess was called
        expect(onSuccessMock).toHaveBeenCalledTimes(1);
    });

    // Test Case 8: Verify onSuccess is not called when savePost fails
    it('does not call onSuccess callback when savePost returns failure', async () => {
        // Setup savePost mock to return failure
        vi.mocked(postsActions.savePost).mockResolvedValueOnce({ success: false, error: "Post not found" });
        
        // Create a mock for the onSuccess callback
        const onSuccessMock = vi.fn();
        
        render(<AdminForm onSuccess={onSuccessMock} />);
        
        // Fill out the form with minimal required data
        await userEvent.type(screen.getByLabelText('Title'), 'Test Title');
        await userEvent.type(screen.getByLabelText('Content'), 'Test Content');
        
        // Submit the form
        const form = screen.getByRole('form');
        await fireEvent.submit(form);
        
        // Verify onSuccess was NOT called
        expect(onSuccessMock).not.toHaveBeenCalled();
    });


    // Test Case 10: Verify form is NOT reset after updating an existing post
    it('does not reset the form after successful update of an existing post', async () => {
        // Setup savePost mock to return success
        vi.mocked(postsActions.savePost).mockResolvedValueOnce({ success: true, id:123 });
        
        // Create a spy on the form reset method
        const resetMock = vi.fn();
        HTMLFormElement.prototype.reset = resetMock;
        
        // Create test post data to simulate editing
        const post = {
            id: 123,
            title: 'Original Title',
            content: 'Original Content',
            tags: ['test'],
            date: new Date().toISOString()
        };
        
        render(<AdminForm post={post} />);
        
        // Submit the form without changes
        const form = screen.getByRole('form');
        await fireEvent.submit(form);
        
        // Verify form was NOT reset
        expect(resetMock).not.toHaveBeenCalled();
    });
});