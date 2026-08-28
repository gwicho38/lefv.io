import { filterStations, type Station } from '@/lib/stations';

const station = (over: Partial<Station>): Station => ({
  id: 'x', name: 'X', city: 'Nowhere', genre: 'ambient',
  url: 'https://example.test/stream', codec: 'MP3', bitrate: 128,
  cors: true, colour: '#2f6f96', ...over,
});

describe('filterStations', () => {
  const all = [
    station({ id: 'fm4', name: 'FM4', city: 'Vienna', genre: 'alternative' }),
    station({ id: 'cdm', name: 'Café del Mar', city: 'Ibiza', genre: 'chillout' }),
  ];

  it('returns everything for an empty query', () => {
    expect(filterStations(all, '')).toHaveLength(2);
  });

  it('matches on name, case-insensitively', () => {
    expect(filterStations(all, 'fm4').map(s => s.id)).toEqual(['fm4']);
  });

  it('matches on city', () => {
    expect(filterStations(all, 'ibiza').map(s => s.id)).toEqual(['cdm']);
  });

  it('matches on genre', () => {
    expect(filterStations(all, 'chill').map(s => s.id)).toEqual(['cdm']);
  });

  it('ignores surrounding whitespace', () => {
    expect(filterStations(all, '  vienna  ').map(s => s.id)).toEqual(['fm4']);
  });

  it('returns nothing when nothing matches', () => {
    expect(filterStations(all, 'zzz')).toEqual([]);
  });
});
