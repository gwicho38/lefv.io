import { render, screen, fireEvent } from '@testing-library/react';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { vi } from 'vitest';

// Mock AspectRatio component to avoid any DOM measurement issues
vi.mock('@/components/ui/aspect-ratio', () => ({
  AspectRatio: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="aspect-ratio">{children}</div>
  ),
}));

describe('GalleryGrid', () => {
  const mockItems = [
    {
      id: 1,
      title: 'Mountain Landscape',
      imageUrl: '/images/mountain.jpg',
      description: 'Beautiful mountain landscape with snow peaks and clear sky',
    },
    {
      id: 2,
      title: 'Beach Sunset',
      imageUrl: '/images/beach.jpg',
      description: 'Stunning sunset view over the ocean with palm trees',
    },
    {
      id: 3,
      title: 'City Skyline',
      imageUrl: '/images/city.jpg',
      description: 'Modern city skyline at night with tall buildings and lights',
    },
  ];

  it('renders all gallery items', () => {
    render(<GalleryGrid items={mockItems} />);
    
    expect(screen.getByText('Mountain Landscape')).toBeInTheDocument();
    expect(screen.getByText('Beach Sunset')).toBeInTheDocument();
    expect(screen.getByText('City Skyline')).toBeInTheDocument();
  });

  it('renders item descriptions', () => {
    render(<GalleryGrid items={mockItems} />);
    
    expect(screen.getByText('Beautiful mountain landscape with snow peaks and clear sky')).toBeInTheDocument();
    expect(screen.getByText('Stunning sunset view over the ocean with palm trees')).toBeInTheDocument();
    expect(screen.getByText('Modern city skyline at night with tall buildings and lights')).toBeInTheDocument();
  });

  it('renders all images with correct attributes', () => {
    render(<GalleryGrid items={mockItems} />);
    
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
    
    expect(images[0]).toHaveAttribute('src', '/images/mountain.jpg');
    expect(images[0]).toHaveAttribute('alt', 'Mountain Landscape');
    
    expect(images[1]).toHaveAttribute('src', '/images/beach.jpg');
    expect(images[1]).toHaveAttribute('alt', 'Beach Sunset');
    
    expect(images[2]).toHaveAttribute('src', '/images/city.jpg');
    expect(images[2]).toHaveAttribute('alt', 'City Skyline');
  });

  it('opens a dialog when an item is clicked', () => {
    render(<GalleryGrid items={mockItems} />);
    
    // Find and click the first gallery item
    const firstItem = screen.getByText('Mountain Landscape');
    fireEvent.click(firstItem);
    
    // Check if the dialog is displayed with the same content
    const dialogTitle = screen.getAllByText('Mountain Landscape')[1]; // There should be two - one in card, one in dialog
    expect(dialogTitle).toBeInTheDocument();
    
    // Check if the description is also shown
    const descriptions = screen.getAllByText('Beautiful mountain landscape with snow peaks and clear sky');
    expect(descriptions.length).toBe(2); // One in card, one in dialog
  });

  it('shows full description in the dialog', () => {
    render(<GalleryGrid items={mockItems} />);
    
    // Find and click the first gallery item
    const firstItem = screen.getByText('Mountain Landscape');
    fireEvent.click(firstItem);
    
    // Check if the description is shown in the dialog
    const dialogDescription = screen.getAllByText('Beautiful mountain landscape with snow peaks and clear sky')[1];
    expect(dialogDescription).toBeInTheDocument();
    // In the card it would be line-clamped, but in the dialog it's not
    expect(dialogDescription).not.toHaveClass('line-clamp-2');
  });

  it('renders an empty gallery when no items provided', () => {
    render(<GalleryGrid items={[]} />);
    
    // Check that the grid container is empty by querying for the first grid element
    const gridContainer = document.querySelector('.grid');
    expect(gridContainer?.childElementCount).toBe(0);
  });
});