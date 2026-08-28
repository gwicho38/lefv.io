import { render, screen, fireEvent } from '@testing-library/react';
import { Boombox } from '@/components/jukebox/Boombox';
import { BOOMBOX_MAP } from '@/data/boomboxMap';
import { mapSize } from '@/lib/pixels';

const props = {
  transport: 'stopped' as const,
  levels: new Array(12).fill(0),
  onPlay: () => {},
  onPause: () => {},
  onStop: () => {},
};

describe('Boombox', () => {
  it('renders the body as crisp pixels', () => {
    const { container } = render(<Boombox {...props} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('shape-rendering', 'crispEdges');
    const { width, height } = mapSize(BOOMBOX_MAP);
    expect(svg).toHaveAttribute('viewBox', `0 0 ${width} ${height}`);
  });

  it('offers play, pause and stop as controls', () => {
    render(<Boombox {...props} />);
    for (const name of ['play', 'pause', 'stop']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });

  it('calls the handler for the key pressed', () => {
    const onPlay = vi.fn();
    const onPause = vi.fn();
    render(<Boombox {...props} onPlay={onPlay} onPause={onPause} />);
    fireEvent.click(screen.getByRole('button', { name: 'play' }));
    expect(onPlay).toHaveBeenCalled();
    expect(onPause).not.toHaveBeenCalled();
  });

  it('is operable from the keyboard', () => {
    const onStop = vi.fn();
    render(<Boombox {...props} onStop={onStop} />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'stop' }), { key: 'Enter' });
    expect(onStop).toHaveBeenCalled();
  });

  it('shows play held down while playing', () => {
    render(<Boombox {...props} transport="playing" />);
    expect(screen.getByRole('button', { name: 'play' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'stop' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows stop held down when stopped', () => {
    render(<Boombox {...props} transport="stopped" />);
    expect(screen.getByRole('button', { name: 'stop' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders the station readout in the display', () => {
    render(<Boombox {...props}>FM4 · Vienna</Boombox>);
    expect(screen.getByText('FM4 · Vienna')).toBeInTheDocument();
  });

  it('draws one analyser bar per level', () => {
    const { container } = render(
      <Boombox {...props} levels={[0.1, 0.9, 0.5, 0.2, 0, 0.4, 0.6, 0.3, 0.8, 0.1, 0.2, 0.7]} />,
    );
    expect(container.querySelectorAll('span.w-\\[2px\\]')).toHaveLength(12);
  });
});
