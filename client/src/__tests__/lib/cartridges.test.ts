import { filterCartridges, type Cartridge } from '@/lib/cartridges';

const cart = (over: Partial<Cartridge>): Cartridge => ({
  id: 'x', title: 'X', system: 'nes', author: 'A', year: 2000, genre: 'puzzle',
  licence: 'CC BY 4.0', licenceUrl: '', source: '', rom: '/x.nes',
  blurb: '', colour: '#c9443a', ...over,
});

describe('filterCartridges', () => {
  const all = [
    cart({ id: 'lan', title: 'Lan Master', author: 'Shiru', system: 'nes' }),
    cart({ id: 'tobu', title: 'Tobu Tobu Girl', author: 'SimonLarsen', system: 'gb' }),
  ];

  it('returns everything for an empty query', () => {
    expect(filterCartridges(all, '')).toHaveLength(2);
  });

  it('matches on title, case-insensitively', () => {
    expect(filterCartridges(all, 'lan master').map(c => c.id)).toEqual(['lan']);
  });

  it('matches on author', () => {
    expect(filterCartridges(all, 'simon').map(c => c.id)).toEqual(['tobu']);
  });

  it('matches on system', () => {
    expect(filterCartridges(all, 'gb').map(c => c.id)).toEqual(['tobu']);
  });

  it('ignores surrounding whitespace', () => {
    expect(filterCartridges(all, '  lan  ').map(c => c.id)).toEqual(['lan']);
  });

  it('returns nothing when nothing matches', () => {
    expect(filterCartridges(all, 'zzz')).toEqual([]);
  });
});
