import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from '@/pages/Home';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('Home', () => {
  it('should render the home page content', () => {
    renderWithQueryClient(<Home />);
    
    expect(screen.getByText('lefv.io')).toBeInTheDocument();
  });

  it('should render iframe content', () => {
    renderWithQueryClient(<Home />);
    
    const iframe = document.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://www.lexaloffle.com/bbs/widget.php?pid=picochill');
  });
});
