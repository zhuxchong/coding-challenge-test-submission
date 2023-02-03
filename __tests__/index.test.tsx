import { act, render, screen } from '@testing-library/react';
import Home from '@/pages/index';

describe('Home', () => {
  it('renders a heading', async () => {
    render(<Home />);

    await act(() => {
      const heading = screen.getByText(/Create your own address book/i);
      expect(heading).toBeInTheDocument();
    });
  });
});
