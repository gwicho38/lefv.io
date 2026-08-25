import { render, screen } from '@testing-library/react';
import { Navigation } from '@/components/layout/Navigation';
import { vi } from 'vitest';

vi.mock('wouter', () => ({
  Link: ({ href, className, children }: any) => (
    <a
      href={href}
      className={className}
      data-testid={`link-${href === '/' ? 'home' : href.replace('/', '')}`}
    >
      {children}
    </a>
  ),
  useLocation: () => ['/blog'],
}));

describe('Navigation', () => {
  it('renders the site name', () => {
    render(<Navigation />);
    expect(screen.getByText('lefv.io')).toBeInTheDocument();
  });

  it('names its sections rather than page types', () => {
    render(<Navigation />);
    expect(screen.getByText('Writing')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('offers the feed', () => {
    render(<Navigation />);
    expect(screen.getByText('RSS')).toHaveAttribute('href', '/feed.xml');
  });

  it('marks Writing active on a post URL, since posts live under it', () => {
    render(<Navigation />);
    expect(screen.getByText('Writing').className).toContain('text-foreground');
    expect(screen.getByText('About').className).toContain('text-muted-foreground');
  });

  it('points Writing at the index', () => {
    render(<Navigation />);
    // The wordmark also links to "/", so match on the link text instead.
    expect(screen.getByText('Writing')).toHaveAttribute('href', '/');
    expect(screen.getByText('About')).toHaveAttribute('href', '/about');
  });
});
