import { render, screen } from '@testing-library/react';
import NotFound from '@/pages/not-found';

describe('NotFound', () => {
  it('should render 404 error message', () => {
    render(<NotFound />);
    
    expect(screen.getByText('404 Page Not Found')).toBeInTheDocument();
    expect(screen.getByText('Did you forget to add the page to the router?')).toBeInTheDocument();
  });

  it('should render alert icon', () => {
    render(<NotFound />);
    
    const alertIcon = document.querySelector('.lucide-circle-alert');
    expect(alertIcon).toBeInTheDocument();
  });
});