import { render, screen, fireEvent } from '@testing-library/react';
import { Toggle } from '@/lib/components/ui/Toggle';

describe('Toggle', () => {
  it('should render as a switch', () => {
    render(<Toggle />);

    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('should render label when provided', () => {
    render(<Toggle label="Dark mode" />);

    expect(screen.getByText('Dark mode')).toBeInTheDocument();
  });

  it('should not render label when not provided', () => {
    render(<Toggle />);

    const button = screen.getByRole('switch');
    expect(button.textContent).toBe('');
  });

  it('should have aria-checked false by default', () => {
    render(<Toggle />);

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('should have aria-checked true when checked', () => {
    render(<Toggle checked />);

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('should call onToggle with true when unchecked toggle is clicked', () => {
    const handleToggle = jest.fn();
    render(<Toggle checked={false} onToggle={handleToggle} />);

    fireEvent.click(screen.getByRole('switch'));

    expect(handleToggle).toHaveBeenCalledWith(true);
  });

  it('should call onToggle with false when checked toggle is clicked', () => {
    const handleToggle = jest.fn();
    render(<Toggle checked={true} onToggle={handleToggle} />);

    fireEvent.click(screen.getByRole('switch'));

    expect(handleToggle).toHaveBeenCalledWith(false);
  });

  it('should not throw when clicked without onToggle handler', () => {
    render(<Toggle />);

    expect(() => {
      fireEvent.click(screen.getByRole('switch'));
    }).not.toThrow();
  });

  it('should apply checked styles when checked', () => {
    const { container } = render(<Toggle checked />);

    const track = container.querySelector('.bg-primary-600');
    expect(track).toBeInTheDocument();
  });

  it('should apply unchecked styles when not checked', () => {
    const { container } = render(<Toggle checked={false} />);

    const track = container.querySelector('.bg-gray-200');
    expect(track).toBeInTheDocument();
  });

  it('should have type="button"', () => {
    render(<Toggle />);

    expect(screen.getByRole('switch')).toHaveAttribute('type', 'button');
  });

  it('should append custom className', () => {
    render(<Toggle className="custom-toggle" />);

    const toggle = screen.getByRole('switch');
    expect(toggle.className).toContain('custom-toggle');
  });

  it('should pass through additional props', () => {
    render(<Toggle data-testid="my-toggle" disabled />);

    const toggle = screen.getByTestId('my-toggle');
    expect(toggle).toBeDisabled();
  });
});
