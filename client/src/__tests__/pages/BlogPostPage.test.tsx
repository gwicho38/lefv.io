import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import BlogPostPage from '@/pages/BlogPostPage';

vi.mock('wouter', () => ({
  Link: ({ href, className, children }: any) => (
    <a href={href} className={className}>{children}</a>
  ),
  useRoute: () => [true, { slug: 'a-post' }],
}));

const post = {
  id: 1, slug: 'a-post', title: 'A Post', excerpt: 'x', content: 'Body text.',
  readingTime: 3, createdAt: '2026-07-02T00:00:00.000Z',
  tags: [{ id: 1, name: 'engineering' }],
};

const renderPost = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}><BlogPostPage /></QueryClientProvider>
  );
};

describe('BlogPostPage', () => {
  it('sends the reader back to the writing index, not the landing page', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => post }) as any;
    renderPost();
    await waitFor(() => {
      expect(screen.getByText('Back to writing')).toHaveAttribute('href', '/writing');
    });
  });

  it('offers the same way back when the post is missing', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as any;
    renderPost();
    await waitFor(() => {
      expect(screen.getByText('Back to writing')).toHaveAttribute('href', '/writing');
    });
  });

  it('renders the post', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => post }) as any;
    renderPost();
    await waitFor(() => {
      expect(screen.getByText('A Post')).toBeInTheDocument();
      expect(screen.getByText('3 min')).toBeInTheDocument();
    });
  });
});
