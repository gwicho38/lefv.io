import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Arcade from '@/pages/Arcade';
import type { Cartridge } from '@/lib/cartridges';

const carts: Cartridge[] = [{
  id: 'lan', title: 'Lan Master', system: 'nes', author: 'Shiru', year: 2011,
  genre: 'puzzle', licence: 'CC BY 4.0', licenceUrl: 'https://example.test/cc', source: '',
  rom: '/lan.nes', blurb: 'Route the signal.', colour: '#c9443a',
}];

const renderPage = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><Arcade /></QueryClientProvider>);
};

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => carts }) as never;
});

describe('Arcade', () => {
  it('renders the shelf label and the empty console state', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('SHELF')).toBeInTheDocument());
    expect(screen.getByText('NO CARTRIDGE')).toBeInTheDocument();
  });

  it('lists cartridges from the manifest', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: /Lan Master/ })).toBeInTheDocument());
  });

  it('names the running cartridge and offers eject once selected', async () => {
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /Lan Master/ }));
    fireEvent.click(screen.getByRole('button', { name: /Lan Master/ }));
    expect(screen.getByRole('button', { name: 'eject' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'CC BY 4.0' })).toBeInTheDocument();
  });

  it('prints the licence as plain text when it has no url', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ ...carts[0], licenceUrl: '' }],
    }) as never;
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /Lan Master/ }));
    fireEvent.click(screen.getByRole('button', { name: /Lan Master/ }));
    expect(screen.queryByRole('link', { name: 'CC BY 4.0' })).not.toBeInTheDocument();
    expect(screen.getByText(/CC BY 4.0/)).toBeInTheDocument();
  });

  it('filters the shelf by search', async () => {
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /Lan Master/ }));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzz' } });
    expect(screen.queryByRole('button', { name: /Lan Master/ })).not.toBeInTheDocument();
  });
});
