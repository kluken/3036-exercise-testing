import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdminPage from "./page";
import * as postActions from "../../actions/posts";
import { posts } from "../../lib/data";

// Sample post data for tests
const testPosts = [
  { id: 1, title: "Test Post 1", content: "Content 1", date: "2023-01-01", tags: ["test", "mock"] },
  { id: 2, title: "Test Post 2", content: "Content 2", date: "2023-01-02", tags: ["test"] }
];

// Mock all dependencies
vi.mock("../../actions/posts", () => ({
  deletePost: vi.fn(() => Promise.resolve({ success: true }))
}));

vi.mock("../../lib/data", () => ({
  posts: [
    { id: 1, title: "Test Post 1", content: "Content 1", date: "2023-01-01", tags: ["test", "mock"] },
    { id: 2, title: "Test Post 2", content: "Content 2", date: "2023-01-02", tags: ["test"] }
  ]
}));

// Mock the child component completely
vi.mock("../../components/AdminForm", () => ({
  AdminForm: ({ onSuccess }: { onSuccess: () => void }) => (
    <div data-testid="mocked-admin-form">
      Mocked Form
      <button data-testid="form-submit-button" onClick={onSuccess}>Submit Form</button>
    </div>
  )
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode, href: string }) => (
    <a href={href} data-testid="mocked-link">{children}</a>
  )
}));

describe("AdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset posts data before each test
    vi.mocked(posts).splice(0, posts.length);
    testPosts.forEach(post => {
      vi.mocked(posts).push({...post});
    });
  });

  describe("Component Rendering", () => {
    it("renders the page structure with correct headings", () => {
      render(<AdminPage />);
      
      expect(screen.getByRole("heading", { name: /blog admin/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /create new post/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /existing posts/i })).toBeInTheDocument();
      expect(screen.getByTestId("mocked-admin-form")).toBeInTheDocument();
    });
    
    it("renders the back to blog link with correct href", () => {
      render(<AdminPage />);
      
      const backLink = screen.getByText(/back to blog/i);
      expect(backLink).toBeInTheDocument();
      expect(backLink.getAttribute("href")).toBe("/");
    });
    
    it("renders posts from data source", () => {
      render(<AdminPage />);
      
      expect(screen.getByText("Test Post 1")).toBeInTheDocument();
      expect(screen.getByText("Test Post 2")).toBeInTheDocument();
    });
    
    it("renders 'No posts available' when posts array is empty", () => {
      // Empty the posts array for this specific test
      vi.mocked(posts).splice(0, posts.length);
      render(<AdminPage />);
      
      expect(screen.getByText("No posts available.")).toBeInTheDocument();
    });

    it("renders Edit buttons for each post", () => {
      render(<AdminPage />);
      
      const editButtons = screen.getAllByText("Edit");
      expect(editButtons.length).toBe(2);
    });

    it("renders Delete buttons for each post", () => {
      render(<AdminPage />);
      
      const deleteButtons = screen.getAllByText("Delete");
      expect(deleteButtons.length).toBe(2);
    });
  });

  // Add a new test group for interaction testing
  describe("Interaction and State Management", () => {
    it("calls deletePost with correct ID when Delete button is clicked", async () => {
      render(<AdminPage />);
      
      // Get the first delete button and click it
      const deleteButtons = screen.getAllByText("Delete");
      fireEvent.click(deleteButtons[0]);
      
      // Check if deletePost was called with the correct ID
      expect(postActions.deletePost).toHaveBeenCalledWith(1);
      
      // Wait for the async operation to complete and verify UI update
      await waitFor(() => {
        expect(screen.getByText("Post deleted successfully")).toBeInTheDocument();
      });
    });
    
    it("sets up editingPost state when Edit button is clicked", () => {
      render(<AdminPage />);
      
      // Get the first edit button and click it
      const editButtons = screen.getAllByText("Edit");
      fireEvent.click(editButtons[0]);
      
      // The component should now be in edit mode (check for "Edit Post" heading)
      expect(screen.getByRole("heading", { name: /edit post/i })).toBeInTheDocument();
    });
    
    it("shows Cancel Editing button when in edit mode", () => {
      render(<AdminPage />);
      
      // Get the first edit button and click it to enter edit mode
      const editButtons = screen.getAllByText("Edit");
      fireEvent.click(editButtons[0]);
      
      // Check if the Cancel Editing button appears
      expect(screen.getByText("Cancel Editing")).toBeInTheDocument();
    });
    
    it("clears editing state when Cancel Editing is clicked", () => {
      render(<AdminPage />);
      
      // Enter edit mode
      const editButtons = screen.getAllByText("Edit");
      fireEvent.click(editButtons[0]);
      
      // Click the Cancel Editing button
      const cancelButton = screen.getByText("Cancel Editing");
      fireEvent.click(cancelButton);
      
      // Should return to "Create New Post" mode
      expect(screen.getByRole("heading", { name: /create new post/i })).toBeInTheDocument();
      expect(screen.queryByText("Cancel Editing")).not.toBeInTheDocument();
    });
    
    it("refreshes post list and shows success message when form is submitted", async () => {
      render(<AdminPage />);
      
      // Simulate form submission by clicking the mocked form's submit button
      const submitButton = screen.getByTestId("form-submit-button");
      fireEvent.click(submitButton);
      
      // Check if success message appears
      expect(screen.getByText("Post saved successfully")).toBeInTheDocument();
    });
    
    it("resets edit mode after successful form submission", () => {
      render(<AdminPage />);
      
      // First enter edit mode
      const editButtons = screen.getAllByText("Edit");
      fireEvent.click(editButtons[0]);
      
      // Verify edit mode is active
      expect(screen.getByRole("heading", { name: /edit post/i })).toBeInTheDocument();
      
      // Simulate form submission
      const submitButton = screen.getByTestId("form-submit-button");
      fireEvent.click(submitButton);
      
      // Verify we're back to create mode
      expect(screen.getByRole("heading", { name: /create new post/i })).toBeInTheDocument();
    });
    
    it("clears editing state when the post being edited is deleted", async () => {
      render(<AdminPage />);
      
      // First enter edit mode for the first post
      const editButtons = screen.getAllByText("Edit");
      fireEvent.click(editButtons[0]);
      
      // Verify edit mode is active
      expect(screen.getByRole("heading", { name: /edit post/i })).toBeInTheDocument();
      
      // Now delete the same post
      const deleteButtons = screen.getAllByText("Delete");
      fireEvent.click(deleteButtons[0]);
      
      // Wait for the async delete operation to complete
      await waitFor(() => {
        // Verify we're back to create mode (editing state cleared)
        expect(screen.getByRole("heading", { name: /create new post/i })).toBeInTheDocument();
        expect(screen.queryByText("Cancel Editing")).not.toBeInTheDocument();
      });
    });
    
    it("displays error message when delete operation fails", async () => {
      // Setup mock to return an error response for this test case only
      vi.mocked(postActions.deletePost).mockResolvedValueOnce({
        success: false,
        error: "Failed to delete post"
      });
      
      render(<AdminPage />);
      
      // Get the first delete button and click it
      const deleteButtons = screen.getAllByText("Delete");
      fireEvent.click(deleteButtons[0]);
      
      // Wait for the async operation to complete
      await waitFor(() => {
        // Verify error message is displayed
        expect(screen.getByText("Error: Failed to delete post")).toBeInTheDocument();
      });
    });
  });

  // Test for event listeners
  describe("Effect Hooks", () => {
    it("updates post list when storage event is triggered", async () => {
      // Setup: clear posts array initially
      vi.mocked(posts).splice(0, posts.length);
      
      // Render component with empty posts
      render(<AdminPage />);
      
      // Verify initial state shows no posts
      expect(screen.getByText("No posts available.")).toBeInTheDocument();
      
      // Now add posts to the mocked data source
      const newPosts = [
        { id: 3, title: "New Post", content: "New Content", date: "2023-02-01", tags: ["new"] }
      ];
      
      vi.mocked(posts).push(...newPosts);
      
      // Create a spy for the window.dispatchEvent before calling it
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
      
      // Manually trigger the storage event to simulate changes from another tab
      const storageEvent = new Event('storage');
      window.dispatchEvent(storageEvent);
      
      // Verify the event was dispatched
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
      
      // Wait for component to update with the new posts
      await waitFor(() => {
        expect(screen.getByText("New Post")).toBeInTheDocument();
      });
      
      // Additional verification
      expect(screen.queryByText("No posts available.")).not.toBeInTheDocument();
      
      // Clean up the spy
      dispatchEventSpy.mockRestore();
    });
    
    it("sets up and cleans up storage event listener", () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(<AdminPage />);
      
      // Verify event listener was added with 'storage' event type
      expect(addEventListenerSpy).toHaveBeenCalledWith("storage", expect.any(Function));
      
      // Cleanup component
      unmount();
      
      // Verify event listener was removed
      expect(removeEventListenerSpy).toHaveBeenCalledWith("storage", expect.any(Function));
      
      // Restore original implementations
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

});
