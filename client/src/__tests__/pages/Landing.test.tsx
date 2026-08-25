import { render, screen } from '@testing-library/react';
import Landing from '@/pages/Landing';

describe('Landing', () => {
  it('shows the wordmark without a domain suffix', () => {
    render(<Landing />);
    expect(screen.getByText('lefv')).toBeInTheDocument();
  });

  it('carries nothing but the wordmark', () => {
    const { container } = render(<Landing />);
    expect(container.textContent?.trim()).toBe('lefv');
  });
});
