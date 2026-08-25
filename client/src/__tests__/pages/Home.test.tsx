import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    id: 1, slug: 'long-paper', title: 'A Long Paper', excerpt: 'about repeated games',
    readingTime: 68, createdAt: '2025-04-23T00:00:00.000Z',
    tags: [{ id: 1, name: 'game-theory' }],
  },
  {
    id: 2, slug: 'short-note', title: 'A Short Note', excerpt: 'about security',
    readingTime: 1, createdAt: '2024-01-18T00:00:00.000Z',
    tags: [{ id: 1, name: 'security' }],
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

  it('shows the masthead wordmark without a domain suffix', () => {
    renderHome();
    expect(screen.getByText('lefv')).toBeInTheDocument();
  });

  it('leads with who the site belongs to', () => {
    renderHome();
    expect(screen.getByText('Luis E. Fernández de la Vara')).toBeInTheDocument();
  });

  it('lists the writing grouped by year', async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText('A Long Paper')).toBeInTheDocument();
      expect(screen.getByText('2025')).toBeInTheDocument();
    });
  });

  it('narrows the list as you search', async () => {
    const user = userEvent.setup();
    renderHome();
    await waitFor(() => expect(screen.getByText('A Long Paper')).toBeInTheDocument());

    await user.type(screen.getByLabelText('Search writing'), 'security');

    await waitFor(() => {
      expect(screen.queryByText('A Long Paper')).not.toBeInTheDocument();
      expect(screen.getByText('A Short Note')).toBeInTheDocument();
    });
  });

  it('filters by clicking a tag, and clears again', async () => {
    const user = userEvent.setup();
    renderHome();
    await waitFor(() => expect(screen.getByText('A Long Paper')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'game-theory' }));
    await waitFor(() => {
      expect(screen.queryByText('A Short Note')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'clear' }));
    await waitFor(() => {
      expect(screen.getByText('A Short Note')).toBeInTheDocument();
    });
  });

  it('says so when nothing matches, rather than showing an empty page', async () => {
    const user = userEvent.setup();
    renderHome();
    await waitFor(() => expect(screen.getByText('A Long Paper')).toBeInTheDocument());

    await user.type(screen.getByLabelText('Search writing'), 'zzzz');

    await waitFor(() => {
      expect(screen.getByText(/nothing matches that/i)).toBeInTheDocument();
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
