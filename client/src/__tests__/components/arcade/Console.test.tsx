import { render, screen } from '@testing-library/react';
import { Console } from '@/components/arcade/Console';
import { CONSOLE_MAP, CONSOLE_SCREEN } from '@/data/consoleMap';
import { mapSize } from '@/lib/pixels';

describe('Console', () => {
  it('renders an svg sized to the map', () => {
    const { container } = render(<Console />);
    const svg = container.querySelector('svg');
    const { width, height } = mapSize(CONSOLE_MAP);
    expect(svg).toHaveAttribute('viewBox', `0 0 ${width} ${height}`);
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
    const { width, height } = mapSize(CONSOLE_MAP);
    expect(window.style.left).toBe(`${(CONSOLE_SCREEN.x / width) * 100}%`);
    expect(window.style.top).toBe(`${(CONSOLE_SCREEN.y / height) * 100}%`);
  });

  it('renders crisp rather than smoothed', () => {
    const { container } = render(<Console />);
    expect(container.querySelector('svg')).toHaveAttribute('shape-rendering', 'crispEdges');
  });
});
