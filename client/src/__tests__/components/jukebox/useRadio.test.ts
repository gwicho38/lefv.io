import { renderHook, act, waitFor } from '@testing-library/react';
import { useRadio } from '@/components/jukebox/useRadio';
import type { Station } from '@/lib/stations';

const fm4: Station = {
  id: 'fm4', name: 'FM4', city: 'Vienna', genre: 'alternative',
  url: 'https://example.test/fm4.mp3', codec: 'MP3', bitrate: 192,
  cors: true, colour: '#c9443a',
};

let played: number;
let paused: number;

beforeEach(() => {
  played = 0;
  paused = 0;
  vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => {
    played += 1;
    return Promise.resolve();
  });
  vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {
    paused += 1;
  });
});

afterEach(() => vi.restoreAllMocks());

describe('useRadio', () => {
  it('starts stopped with no station', () => {
    const { result } = renderHook(() => useRadio());
    expect(result.current.transport).toBe('stopped');
    expect(result.current.station).toBeNull();
    expect(played).toBe(0);
  });

  it('plays the station it is tuned to', async () => {
    const { result } = renderHook(() => useRadio());
    act(() => result.current.tuneTo(fm4));
    await waitFor(() => expect(result.current.transport).toBe('playing'));
    expect(result.current.station?.id).toBe('fm4');
    expect(played).toBe(1);
  });

  it('reports an error when the stream will not start', async () => {
    vi.spyOn(window.HTMLMediaElement.prototype, 'play')
      .mockImplementation(() => Promise.reject(new Error('blocked')));
    const { result } = renderHook(() => useRadio());
    act(() => result.current.tuneTo(fm4));
    await waitFor(() => expect(result.current.transport).toBe('error'));
  });

  it('pauses without dropping the station', async () => {
    const { result } = renderHook(() => useRadio());
    act(() => result.current.tuneTo(fm4));
    await waitFor(() => expect(result.current.transport).toBe('playing'));
    act(() => result.current.pause());
    expect(result.current.transport).toBe('paused');
    expect(result.current.station?.id).toBe('fm4');
    expect(paused).toBeGreaterThan(0);
  });

  it('stops and silences the meter', async () => {
    const { result } = renderHook(() => useRadio());
    act(() => result.current.tuneTo(fm4));
    await waitFor(() => expect(result.current.transport).toBe('playing'));
    act(() => result.current.stop());
    expect(result.current.transport).toBe('stopped');
    expect(result.current.levels.every(l => l === 0)).toBe(true);
  });

  it('exposes one level per bar', () => {
    const { result } = renderHook(() => useRadio());
    expect(result.current.levels).toHaveLength(12);
  });

  it('restarts the stream on play rather than resuming', async () => {
    const { result } = renderHook(() => useRadio());
    act(() => result.current.tuneTo(fm4));
    await waitFor(() => expect(result.current.transport).toBe('playing'));
    act(() => result.current.pause());
    act(() => result.current.play());
    await waitFor(() => expect(played).toBe(2));
  });

  it('tunes to a different station', async () => {
    const { result } = renderHook(() => useRadio());
    act(() => result.current.tuneTo(fm4));
    await waitFor(() => expect(result.current.transport).toBe('playing'));
    act(() => result.current.tuneTo({ ...fm4, id: 'cdm', name: 'Café del Mar' }));
    await waitFor(() => expect(result.current.station?.id).toBe('cdm'));
    expect(played).toBe(2);
  });
});
