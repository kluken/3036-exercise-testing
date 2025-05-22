import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostList } from "./PostList";
import { Post } from "../types";

describe("PostList Component", () => {
    const mockPosts: Post[] = [
        {
            id: 1,
            title: "First Post",
            content: "This is the first post content",
            date: "2023-01-01",
            tags: ["react", "typescript"]
        },
        {
            id: 2,
            title: "Second Post",
            content: "This is the second post content",
            date: "2023-01-02",
            tags: ["javascript"]
        }
    ];

    it("renders a list of posts correctly", () => {
        render(<PostList posts={mockPosts} />);
        
        expect(screen.getByText("First Post")).toBeInTheDocument();
        expect(screen.getByText("This is the first post content")).toBeInTheDocument();
        expect(screen.getByText("2023-01-01")).toBeInTheDocument();
        
        expect(screen.getByText("Second Post")).toBeInTheDocument();
        expect(screen.getByText("This is the second post content")).toBeInTheDocument();
        expect(screen.getByText("2023-01-02")).toBeInTheDocument();
    });

    it("renders post tags correctly", () => {
        render(<PostList posts={mockPosts} />);
        
        expect(screen.getByText("react")).toBeInTheDocument();
        expect(screen.getByText("typescript")).toBeInTheDocument();
        expect(screen.getByText("javascript")).toBeInTheDocument();
    });

    it("displays empty state message when no posts are provided", () => {
        render(<PostList posts={[]} />);
        
        expect(screen.getByText("No posts found matching your criteria.")).toBeInTheDocument();
        expect(screen.queryByText("First Post")).not.toBeInTheDocument();
    });

    it("renders posts without tags correctly", () => {
        const postsWithoutTags: Post[] = [
            {
                id: 3,
                title: "No Tags Post",
                content: "This post has no tags",
                date: "2023-01-03",
                tags: []
            }
        ];
        
        render(<PostList posts={postsWithoutTags} />);
        
        expect(screen.getByText("No Tags Post")).toBeInTheDocument();
        expect(screen.getByText("This post has no tags")).toBeInTheDocument();
        expect(screen.getByText("2023-01-03")).toBeInTheDocument();
        
        // Verify tag container is not rendered
        const article = screen.getByRole("article");
        expect(article.querySelector(".post-tags-list")).toBeFalsy();
    });

    it("renders each post with correct structure", () => {
        render(<PostList posts={mockPosts} />);
        
        const articles = screen.getAllByRole("article");
        expect(articles).toHaveLength(2);
        
        articles.forEach(article => {
            expect(article.querySelector(".post-title")).toBeInTheDocument();
            expect(article.querySelector(".post-meta")).toBeInTheDocument();
            expect(article.querySelector(".post-excerpt")).toBeInTheDocument();
        });
    });
});