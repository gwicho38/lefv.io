import { render, screen, fireEvent } from '@testing-library/react';
import { CartridgeShelf } from '@/components/arcade/CartridgeShelf';
import type { Cartridge } from '@/lib/cartridges';

const cart = (id: string, title: string): Cartridge => ({
  id, title, system: 'nes', author: 'A', year: 2000, genre: 'puzzle',
  licence: 'CC BY 4.0', licenceUrl: '', source: '', rom: `/${id}.nes`,
  blurb: '', colour: '#c9443a',
});

const carts = [cart('lan', 'Lan Master'), cart('tobu', 'Tobu Tobu Girl')];

describe('CartridgeShelf', () => {
  it('renders one button per cartridge', () => {
    render(<CartridgeShelf cartridges={carts} selectedId={null} onSelect={() => {}} onDrop={() => {}} />);
    expect(screen.getByRole('button', { name: /Lan Master/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tobu Tobu Girl/ })).toBeInTheDocument();
  });

  it('marks the selected cartridge as pressed', () => {
    render(<CartridgeShelf cartridges={carts} selectedId="lan" onSelect={() => {}} onDrop={() => {}} />);
    expect(screen.getByRole('button', { name: /Lan Master/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Tobu Tobu Girl/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onSelect with the cartridge id', () => {
    const onSelect = vi.fn();
    render(<CartridgeShelf cartridges={carts} selectedId={null} onSelect={onSelect} onDrop={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Tobu Tobu Girl/ }));
    expect(onSelect).toHaveBeenCalledWith('tobu');
  });

  it('always offers the drop slot', () => {
    render(<CartridgeShelf cartridges={[]} selectedId={null} onSelect={() => {}} onDrop={() => {}} />);
    expect(screen.getByText(/drop/i)).toBeInTheDocument();
  });

  it('hands a dropped file to onDrop', () => {
    const onDrop = vi.fn();
    render(<CartridgeShelf cartridges={carts} selectedId={null} onSelect={() => {}} onDrop={onDrop} />);
    const file = new File(['rom'], 'game.nes');
    fireEvent.drop(screen.getByTestId('drop-slot'), { dataTransfer: { files: [file] } });
    expect(onDrop).toHaveBeenCalledWith(file);
  });
});
