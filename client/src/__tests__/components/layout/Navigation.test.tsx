import { render, screen } from '@testing-library/react';
import { Navigation } from '@/components/layout/Navigation';
import { vi } from 'vitest';

// Mock the wouter hook
vi.mock('wouter', () => ({
  Link: ({ href, className, children }: any) => (
    <a href={href} className={className} data-testid={`link-${href.replace('/', '')}`}>
      {children}
    </a>
  ),
  useLocation: () => {
    // Return a mock location that can be set for different test cases
    return [vi.fn().mockReturnValue('/blog')];
  },
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
    expect(screen.getByText('Weather')).toBeInTheDocument();
  });

  it('applies correct styling to active link', () => {
    render(<Navigation />);
    
    // Since we mocked useLocation to return '/blog', Blog should be active
    const homeLink = screen.getByTestId('link-');
    const blogLink = screen.getByTestId('link-blog');
    const weatherLink = screen.getByTestId('link-weather');
    
    // Check that Blog has the text-primary class
    expect(blogLink.className).toContain('text-primary');
    
    // Check that other links don't have text-primary class
    expect(homeLink.className).toContain('text-muted-foreground');
    expect(weatherLink.className).toContain('text-muted-foreground');
  });

  it('has correct href attributes on links', () => {
    render(<Navigation />);
    
    const homeLink = screen.getByTestId('link-');
    const blogLink = screen.getByTestId('link-blog');
    const weatherLink = screen.getByTestId('link-weather');
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(blogLink).toHaveAttribute('href', '/blog');
    expect(weatherLink).toHaveAttribute('href', '/weather');
  });
});