import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/lib/components/ui/Input';
import { createRef } from 'react';

describe('Input', () => {
  it('should render an input element', () => {
    render(<Input placeholder="Enter text" />);

    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should render label when provided', () => {
    render(<Input label="Email" />);

    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should not render label when not provided', () => {
    render(<Input placeholder="No label" />);

    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });

  it('should render error message when error is provided', () => {
    render(<Input error="This field is required" />);

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should apply error styles when error is provided', () => {
    render(<Input error="Error message" data-testid="error-input" />);

    const input = screen.getByTestId('error-input');
    expect(input.className).toContain('border-red-500');
  });

  it('should handle value changes', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} placeholder="Type here" />);

    const input = screen.getByPlaceholderText('Type here');
    fireEvent.change(input, { target: { value: 'test value' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('should forward ref to input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} placeholder="Ref test" />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.placeholder).toBe('Ref test');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled" />);

    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
  });

  it('should pass through additional props', () => {
    render(<Input type="email" name="email" data-testid="email-input" />);

    const input = screen.getByTestId('email-input');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('name', 'email');
  });

  it('should append custom className', () => {
    render(<Input className="custom-input" data-testid="custom" />);

    const input = screen.getByTestId('custom');
    expect(input.className).toContain('custom-input');
  });

  it('should have displayName set', () => {
    expect(Input.displayName).toBe('Input');
  });
});
