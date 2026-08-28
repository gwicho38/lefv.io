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
    render(<CartridgeShelf cartridges={carts} selectedId={null} onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: /Lan Master/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tobu Tobu Girl/ })).toBeInTheDocument();
  });

  it('marks the selected cartridge as pressed', () => {
    render(<CartridgeShelf cartridges={carts} selectedId="lan" onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: /Lan Master/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Tobu Tobu Girl/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onSelect with the cartridge id', () => {
    const onSelect = vi.fn();
    render(<CartridgeShelf cartridges={carts} selectedId={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /Tobu Tobu Girl/ }));
    expect(onSelect).toHaveBeenCalledWith('tobu');
  });


});
