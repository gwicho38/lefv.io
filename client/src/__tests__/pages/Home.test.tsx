import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import Home from '@/pages/Home';

vi.mock('wouter', () => ({
  Link: ({ href, className, children }: any) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

const posts = [
  {
    id: 1, slug: 'long-paper', title: 'A Long Paper', excerpt: 'x',
    readingTime: 68, createdAt: '2025-04-23T00:00:00.000Z',
    tags: [{ id: 1, name: 'game-theory' }],
  },
  {
    id: 2, slug: 'short-note', title: 'A Short Note', excerpt: 'y',
    readingTime: 1, createdAt: '2024-01-18T00:00:00.000Z', tags: [],
  },
];

const renderHome = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}><Home /></QueryClientProvider>
  );
};

describe('Home', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => posts }) as any;
  });

  it('leads with who the site belongs to', () => {
    renderHome();
    expect(screen.getByText('Luis E. Fernández de la Vara')).toBeInTheDocument();
  });

  it('lists the writing', async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText('A Long Paper')).toBeInTheDocument();
      expect(screen.getByText('A Short Note')).toBeInTheDocument();
    });
  });

  it('groups posts by year', async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText('2025')).toBeInTheDocument();
      expect(screen.getByText('2024')).toBeInTheDocument();
    });
  });

  it('shows reading time so the commitment is visible before clicking', async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText('68 min')).toBeInTheDocument();
      expect(screen.getByText('1 min')).toBeInTheDocument();
    });
  });

  it('explains itself when posts cannot load', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false }) as any;
    renderHome();
    await waitFor(() => {
      expect(screen.getByText(/not loading right now/i)).toBeInTheDocument();
    });
  });
});
