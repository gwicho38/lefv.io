import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TagSelector } from '@/components/blog/TagSelector';
import { vi } from 'vitest';

// Mock the react-query hook
vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey, queryFn }: any) => {
    if (queryKey[0] === '/api/tags') {
      return {
        data: [
          { id: 1, name: 'React' },
          { id: 2, name: 'TypeScript' },
          { id: 3, name: 'JavaScript' }
        ],
        isLoading: false
      };
    }
    return { data: undefined, isLoading: true };
  }
}));

describe('TagSelector', () => {
  const onTagClickMock = vi.fn();

  beforeEach(() => {
    onTagClickMock.mockReset();
  });

  it('renders the tag selector button', () => {
    render(<TagSelector selectedTags={[]} onTagClick={onTagClickMock} />);
    expect(screen.getByText('Filter by Tags')).toBeInTheDocument();
  });

  it('shows badge count when tags are selected', () => {
    render(<TagSelector selectedTags={['React', 'TypeScript']} onTagClick={onTagClickMock} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('opens dialog when button is clicked', async () => {
    render(<TagSelector selectedTags={[]} onTagClick={onTagClickMock} />);
    
    const button = screen.getByText('Filter by Tags');
    fireEvent.click(button);
    
    // Dialog title should be visible
    expect(screen.getByText('Select Tags')).toBeInTheDocument();
    
    // Tags should be rendered
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  it('highlights selected tags', () => {
    render(<TagSelector selectedTags={['React']} onTagClick={onTagClickMock} />);
    
    const button = screen.getByText('Filter by Tags');
    fireEvent.click(button);
    
    // Find the React badge - it should have a different style than non-selected tags
    const reactBadge = screen.getByText('React').closest('div');
    const typeScriptBadge = screen.getByText('TypeScript').closest('div');
    
    // Check for different styling using classes
    expect(reactBadge).toHaveClass('bg-primary');
    expect(typeScriptBadge).not.toHaveClass('bg-primary');
    
    // Check for the presence of × anywhere in the document
    expect(screen.getByText('×')).toBeInTheDocument();
  });

  it('calls onTagClick when a tag is clicked', () => {
    render(<TagSelector selectedTags={[]} onTagClick={onTagClickMock} />);
    
    const button = screen.getByText('Filter by Tags');
    fireEvent.click(button);
    
    const reactBadge = screen.getByText('React');
    fireEvent.click(reactBadge);
    
    expect(onTagClickMock).toHaveBeenCalledWith('React');
  });

  it('clears all selected tags when clear button is clicked', () => {
    render(<TagSelector selectedTags={['React', 'TypeScript']} onTagClick={onTagClickMock} />);
    
    const button = screen.getByText('Filter by Tags');
    fireEvent.click(button);
    
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    
    // Should call onTagClick for both selected tags
    expect(onTagClickMock).toHaveBeenCalledWith('React');
    expect(onTagClickMock).toHaveBeenCalledWith('TypeScript');
    expect(onTagClickMock).toHaveBeenCalledTimes(2);
  });

  it('disables clear button when no tags are selected', () => {
    render(<TagSelector selectedTags={[]} onTagClick={onTagClickMock} />);
    
    const button = screen.getByText('Filter by Tags');
    fireEvent.click(button);
    
    const clearButton = screen.getByText('Clear');
    expect(clearButton).toBeDisabled();
  });

  it('closes dialog when Close button is clicked', () => {
    render(<TagSelector selectedTags={[]} onTagClick={onTagClickMock} />);
    
    // Open dialog
    const button = screen.getByText('Filter by Tags');
    fireEvent.click(button);
    
    // Dialog should be open
    expect(screen.getByText('Select Tags')).toBeInTheDocument();
    
    // Close dialog
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    // Dialog should be closed (title no longer visible)
    waitFor(() => {
      expect(screen.queryByText('Select Tags')).not.toBeInTheDocument();
    });
  });
});