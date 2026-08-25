import { render, screen } from '@testing-library/react';
import Layout from '@/components/layout/Layout';
import { vi } from 'vitest';

vi.mock('@/components/layout/Navigation', () => ({
  Navigation: () => <div data-testid="navigation-component">Navigation Mock</div>
}));

describe('Layout', () => {
  it('renders the Navigation component', () => {
    render(<Layout><div>Test Child Content</div></Layout>);
    expect(screen.getByTestId('navigation-component')).toBeInTheDocument();
  });

  it('renders the children content', () => {
    render(<Layout><div data-testid="child-content">Test Child Content</div></Layout>);
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('constrains the reading column', () => {
    render(<Layout><div>Test Child Content</div></Layout>);
    const main = screen.getByText('Test Child Content').parentElement;
    expect(main?.tagName).toBe('MAIN');
    expect(main).toHaveClass('max-w-shell');
  });
});
