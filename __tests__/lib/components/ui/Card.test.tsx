import { render, screen } from '@testing-library/react';
import { Card } from '@/lib/components/ui/Card';

describe('Card', () => {
  it('should render children correctly', () => {
    render(<Card>Card content</Card>);

    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should apply medium padding by default', () => {
    render(<Card data-testid="card">Content</Card>);

    const card = screen.getByTestId('card');
    expect(card.className).toContain('p-4');
  });

  it('should apply no padding when padding is none', () => {
    render(<Card padding="none" data-testid="card">Content</Card>);

    const card = screen.getByTestId('card');
    expect(card.className).not.toContain('p-3');
    expect(card.className).not.toContain('p-4');
    expect(card.className).not.toContain('p-6');
  });

  it('should apply small padding', () => {
    render(<Card padding="sm" data-testid="card">Content</Card>);

    const card = screen.getByTestId('card');
    expect(card.className).toContain('p-3');
  });

  it('should apply large padding', () => {
    render(<Card padding="lg" data-testid="card">Content</Card>);

    const card = screen.getByTestId('card');
    expect(card.className).toContain('p-6');
  });

  it('should have base card styles', () => {
    render(<Card data-testid="card">Content</Card>);

    const card = screen.getByTestId('card');
    expect(card.className).toContain('bg-white');
    expect(card.className).toContain('rounded-lg');
    expect(card.className).toContain('shadow-md');
  });

  it('should append custom className', () => {
    render(<Card className="custom-card" data-testid="card">Content</Card>);

    const card = screen.getByTestId('card');
    expect(card.className).toContain('custom-card');
  });

  it('should pass through additional props', () => {
    render(
      <Card data-testid="card" id="my-card" aria-label="My Card">
        Content
      </Card>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('id', 'my-card');
    expect(card).toHaveAttribute('aria-label', 'My Card');
  });

  it('should render complex children', () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Description</p>
        <button>Action</button>
      </Card>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });
});
