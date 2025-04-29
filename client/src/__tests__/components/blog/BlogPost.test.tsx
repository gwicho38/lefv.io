import { render, screen, fireEvent } from '@testing-library/react';
import { BlogPost } from '@/components/blog/BlogPost';
import { format } from 'date-fns';
import { vi } from 'vitest';

// Mock react-markdown because we don't need to test its implementation
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown-content">{children}</div>,
}));

describe('BlogPost', () => {
  const mockPost = {
    id: 1,
    title: 'Test Post Title',
    content: 'Test content for the blog post',
    createdAt: '2023-01-01T00:00:00.000Z',
    tags: [
      { id: 1, name: 'Tag1' },
      { id: 2, name: 'Tag2' }
    ],
  };

  it('renders the blog post with correct title', () => {
    render(<BlogPost post={mockPost} />);
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  it('formats the date correctly', () => {
    render(<BlogPost post={mockPost} />);
    const formattedDate = format(new Date(mockPost.createdAt), 'MMMM d, yyyy');
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });

  it('renders all tags', () => {
    render(<BlogPost post={mockPost} />);
    expect(screen.getByText('Tag1')).toBeInTheDocument();
    expect(screen.getByText('Tag2')).toBeInTheDocument();
  });

  it('renders markdown content', () => {
    render(<BlogPost post={mockPost} />);
    const markdownElement = screen.getByTestId('markdown-content');
    expect(markdownElement).toBeInTheDocument();
    expect(markdownElement.textContent).toBe(mockPost.content);
  });

  it('opens the modal when clicked', () => {
    render(<BlogPost post={mockPost} />);
    
    // Find the card and click it
    const card = screen.getByText('Test Post Title');
    fireEvent.click(card);
    
    // Check if the modal is displayed with the same content
    const dialogTitle = screen.getAllByText('Test Post Title')[1]; // There should be two - one in card, one in dialog
    expect(dialogTitle).toBeInTheDocument();
  });

  it('renders a post without tags', () => {
    const postWithoutTags = { ...mockPost, tags: [] };
    render(<BlogPost post={postWithoutTags} />);
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    // Should not crash when tags are empty
  });
});