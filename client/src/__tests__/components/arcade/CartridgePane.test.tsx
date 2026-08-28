import { render, screen, fireEvent } from '@testing-library/react';
import { CartridgePane } from '@/components/arcade/CartridgePane';
import type { Cartridge } from '@/lib/cartridges';

const lan: Cartridge = {
  id: 'lan', title: 'Lan Master', system: 'nes', author: 'Shiru', year: 2011,
  genre: 'puzzle', licence: 'CC BY 4.0', licenceUrl: 'https://example.test/cc',
  source: '', rom: '/lan.nes', blurb: 'Route the signal.', colour: '#c9443a',
};

describe('CartridgePane', () => {
  it('prompts when nothing is inserted', () => {
    render(<CartridgePane cartridge={null} onEject={() => {}} />);
    expect(screen.getByText(/pick one/i)).toBeInTheDocument();
  });

  it('shows title, author and year', () => {
    render(<CartridgePane cartridge={lan} onEject={() => {}} />);
    expect(screen.getByText('Lan Master')).toBeInTheDocument();
    expect(screen.getByText(/Shiru/)).toBeInTheDocument();
    expect(screen.getByText(/2011/)).toBeInTheDocument();
  });

  it('always shows the licence, linked to its text', () => {
    render(<CartridgePane cartridge={lan} onEject={() => {}} />);
    const link = screen.getByRole('link', { name: 'CC BY 4.0' });
    expect(link).toHaveAttribute('href', 'https://example.test/cc');
  });

  it('says saves never leave the browser', () => {
    render(<CartridgePane cartridge={lan} onEject={() => {}} />);
    expect(screen.getByText(/never uploaded/i)).toBeInTheDocument();
  });

  it('ejects', () => {
    const onEject = vi.fn();
    render(<CartridgePane cartridge={lan} onEject={onEject} />);
    fireEvent.click(screen.getByRole('button', { name: /eject/i }));
    expect(onEject).toHaveBeenCalled();
  });
});
