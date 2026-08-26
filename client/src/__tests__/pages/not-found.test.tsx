import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import NotFound from '@/pages/not-found';

vi.mock('wouter', () => ({
  Link: ({ href, className, children }: any) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

describe('NotFound', () => {
  it('tells the visitor what happened in their terms', () => {
    render(<NotFound />);
    expect(screen.getByText('Not found')).toBeInTheDocument();
    expect(screen.getByText(/that page is not here/i)).toBeInTheDocument();
  });

  it('does not leak developer-facing copy', () => {
    render(<NotFound />);
    expect(screen.queryByText(/router/i)).not.toBeInTheDocument();
  });

  it('offers a way back rather than a dead end', () => {
    render(<NotFound />);
    expect(screen.getByText('Writing')).toHaveAttribute('href', '/writing');
    expect(screen.getByText('About')).toHaveAttribute('href', '/about');
    expect(screen.getByText('RSS')).toHaveAttribute('href', '/feed.xml');
  });
});
