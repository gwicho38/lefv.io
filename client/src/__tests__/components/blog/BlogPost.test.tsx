import { render, screen } from '@testing-library/react';
import { BlogPost } from '@/components/blog/BlogPost';
import { format } from 'date-fns';
import { vi } from 'vitest';

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => (
    <div data-testid="markdown-content">{children}</div>
  ),
}));

vi.mock('wouter', () => ({
  Link: ({ href, children, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe('BlogPost', () => {
  const mockPost = {
    id: 1,
    slug: 'test-post-title',
    title: 'Test Post Title',
    content: 'Test content for the blog post',
    excerpt: 'A short excerpt of the post.',
    readingTime: 2,
    createdAt: '2023-01-01T00:00:00.000Z',
    tags: [
      { id: 1, name: 'Tag1' },
      { id: 2, name: 'Tag2' },
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

  it('renders the reading time', () => {
    render(<BlogPost post={mockPost} />);
    expect(screen.getByText(/2 min read/)).toBeInTheDocument();
  });

  it('renders all tags', () => {
    render(<BlogPost post={mockPost} />);
    expect(screen.getByText('Tag1')).toBeInTheDocument();
    expect(screen.getByText('Tag2')).toBeInTheDocument();
  });

  it('renders the excerpt on the card', () => {
    render(<BlogPost post={mockPost} />);
    expect(screen.getByText(mockPost.excerpt)).toBeInTheDocument();
  });

  it('links to the individual blog post page', () => {
    render(<BlogPost post={mockPost} />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    const slugLinks = links.filter(
      (link) => link.getAttribute('href') === '/blog/test-post-title'
    );
    expect(slugLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('renders a post without tags', () => {
    const postWithoutTags = { ...mockPost, tags: [] };
    render(<BlogPost post={postWithoutTags} />);
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  it('falls back to content slice when no excerpt provided', () => {
    const postNoExcerpt = { ...mockPost, excerpt: undefined };
    render(<BlogPost post={postNoExcerpt} />);
    expect(
      screen.getByText(mockPost.content.slice(0, 220))
    ).toBeInTheDocument();
  });
});
