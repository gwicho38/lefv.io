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
  it('renders the navigation with site name', () => {
    render(<Navigation />);
    expect(screen.getByText('lefv.io')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(<Navigation />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
  });

  it('applies correct styling to active link', () => {
    render(<Navigation />);
    const homeLink = screen.getByTestId('link-home');
    const blogLink = screen.getByTestId('link-blog');

    expect(blogLink.className).toContain('text-primary');
    expect(homeLink.className).toContain('text-muted-foreground');
  });

  it('has correct href attributes on links', () => {
    render(<Navigation />);
    const homeLink = screen.getByTestId('link-home');
    const blogLink = screen.getByTestId('link-blog');

    expect(homeLink).toHaveAttribute('href', '/');
    expect(blogLink).toHaveAttribute('href', '/blog');
  });
});
