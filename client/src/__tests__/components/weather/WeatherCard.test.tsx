import { render, screen, fireEvent } from '@testing-library/react';
import { WeatherCard, WeatherMetric } from '@/components/weather/WeatherCard';
import { vi } from 'vitest';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Cloud: () => <div data-testid="icon-cloud">Cloud Icon</div>,
  Droplets: () => <div data-testid="icon-droplets">Droplets Icon</div>,
  Gauge: () => <div data-testid="icon-gauge">Gauge Icon</div>,
  ThermometerSnowflake: () => <div data-testid="icon-thermometer">Thermometer Icon</div>,
  Wind: () => <div data-testid="icon-wind">Wind Icon</div>,
}));

describe('WeatherCard', () => {
  const temperatureMetric: WeatherMetric = {
    label: 'Temperature',
    value: 23.5,
    unit: '°C',
    icon: 'temperature'
  };

  const humidityMetric: WeatherMetric = {
    label: 'Humidity',
    value: 45.0,
    unit: '%',
    icon: 'humidity'
  };

  it('renders the weather card with correct label', () => {
    render(<WeatherCard metric={temperatureMetric} />);
    expect(screen.getByText('Temperature')).toBeInTheDocument();
  });

  it('displays the correct value and unit', () => {
    render(<WeatherCard metric={temperatureMetric} />);
    expect(screen.getByText('23.5')).toBeInTheDocument();
    expect(screen.getByText('°C')).toBeInTheDocument();
  });

  it('shows the correct icon for temperature', () => {
    render(<WeatherCard metric={temperatureMetric} />);
    expect(screen.getByTestId('icon-thermometer')).toBeInTheDocument();
  });

  it('shows the correct icon for humidity', () => {
    render(<WeatherCard metric={humidityMetric} />);
    expect(screen.getByTestId('icon-droplets')).toBeInTheDocument();
  });

  it('opens the detail dialog when clicked', () => {
    render(<WeatherCard metric={temperatureMetric} />);
    
    // Find the card and click it
    const card = screen.getByText('Temperature');
    fireEvent.click(card);
    
    // Check if the modal is displayed with the detailed title
    expect(screen.getByText('Temperature Details')).toBeInTheDocument();
  });

  it('shows historical data in the modal', () => {
    render(<WeatherCard metric={temperatureMetric} />);
    
    // Open the modal
    const card = screen.getByText('Temperature');
    fireEvent.click(card);
    
    // Check for historical data section
    expect(screen.getByText('Historical Data')).toBeInTheDocument();
    expect(screen.getByText(/24 Hour Average:/)).toBeInTheDocument();
    expect(screen.getByText(/24 Hour High:/)).toBeInTheDocument();
    expect(screen.getByText(/24 Hour Low:/)).toBeInTheDocument();
  });

  it('shows trends in the modal', () => {
    render(<WeatherCard metric={temperatureMetric} />);
    
    // Open the modal
    const card = screen.getByText('Temperature');
    fireEvent.click(card);
    
    // Check for trends section
    expect(screen.getByText('Trends')).toBeInTheDocument();
    expect(screen.getByText(/Hourly Change:/)).toBeInTheDocument();
    expect(screen.getByText(/Daily Change:/)).toBeInTheDocument();
  });

  it('shows additional information in the modal', () => {
    render(<WeatherCard metric={temperatureMetric} />);
    
    // Open the modal
    const card = screen.getByText('Temperature');
    fireEvent.click(card);
    
    // Check for additional information section
    expect(screen.getByText('Additional Information')).toBeInTheDocument();
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    expect(screen.getByText('Sensor Status: Active')).toBeInTheDocument();
    expect(screen.getByText('Data Quality: Good')).toBeInTheDocument();
  });
});