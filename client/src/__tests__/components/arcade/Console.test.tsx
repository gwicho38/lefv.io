import { render, screen } from '@testing-library/react';
import { Console } from '@/components/arcade/Console';
import { CONSOLE_SCREEN } from '@/data/consoleMap';

describe('Console', () => {
  it('renders an svg sized to the map', () => {
    const { container } = render(<Console />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 56 52');
  });

  it('renders the shell as rects', () => {
    const { container } = render(<Console />);
    expect(container.querySelectorAll('rect').length).toBeGreaterThan(20);
  });

  it('renders children inside the screen window', () => {
    render(<Console><span>game</span></Console>);
    expect(screen.getByText('game')).toBeInTheDocument();
  });

  it('positions the screen window from CONSOLE_SCREEN, not a magic number', () => {
    render(<Console><span data-testid="game">game</span></Console>);
    const window = screen.getByTestId('game').parentElement!;
    expect(window.style.left).toBe(`${(CONSOLE_SCREEN.x / 56) * 100}%`);
    expect(window.style.top).toBe(`${(CONSOLE_SCREEN.y / 52) * 100}%`);
  });

  it('renders crisp rather than smoothed', () => {
    const { container } = render(<Console />);
    expect(container.querySelector('svg')).toHaveAttribute('shape-rendering', 'crispEdges');
  });
});
