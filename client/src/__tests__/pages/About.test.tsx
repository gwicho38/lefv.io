import { render, screen } from '@testing-library/react';
import About from '@/pages/About';

describe('About', () => {
  it('introduces the author', () => {
    render(<About />);
    expect(screen.getByText(/Luis E. Fernández de la Vara/)).toBeInTheDocument();
  });

  it('hosts the Pico-8 cartridge that used to occupy the homepage', () => {
    render(<About />);
    const iframe = document.querySelector('iframe');
    expect(iframe).toHaveAttribute('src', 'https://www.lexaloffle.com/bbs/widget.php?pid=picochill');
    expect(iframe).toHaveAttribute('loading', 'lazy');
  });
});
