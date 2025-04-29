import { render, screen } from '@testing-library/react';
import Layout from '@/components/layout/Layout';
import { vi } from 'vitest';

// Mock the Navigation component
vi.mock('@/components/layout/Navigation', () => ({
  Navigation: () => <div data-testid="navigation-component">Navigation Mock</div>
}));

describe('Layout', () => {
  it('renders the Navigation component', () => {
    render(
      <Layout>
        <div>Test Child Content</div>
      </Layout>
    );
    
    expect(screen.getByTestId('navigation-component')).toBeInTheDocument();
  });

  it('renders the children content', () => {
    render(
      <Layout>
        <div data-testid="child-content">Test Child Content</div>
      </Layout>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });

  it('applies correct styling to the main container', () => {
    render(
      <Layout>
        <div>Test Child Content</div>
      </Layout>
    );
    
    // Check the outer container has the background class
    const container = screen.getByText('Navigation Mock').parentElement;
    expect(container).toHaveClass('bg-background');

    // Check that the main element has the correct padding classes
    const mainElement = screen.getByText('Test Child Content').parentElement;
    expect(mainElement).toHaveClass('px-4');
    expect(mainElement).toHaveClass('py-8');
  });
});