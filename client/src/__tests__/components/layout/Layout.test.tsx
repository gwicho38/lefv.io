import { render, screen } from '@testing-library/react';
import Layout, { Column } from '@/components/layout/Layout';
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

  it('leaves main unconstrained so a page can go edge to edge', () => {
    render(<Layout><div>Test Child Content</div></Layout>);
    const main = screen.getByText('Test Child Content').parentElement;
    expect(main?.tagName).toBe('MAIN');
    expect(main).not.toHaveClass('max-w-shell');
  });

  it('constrains the reading measure in Column instead', () => {
    render(<Column><div>Column Content</div></Column>);
    expect(screen.getByText('Column Content').parentElement).toHaveClass('max-w-shell');
  });
});
