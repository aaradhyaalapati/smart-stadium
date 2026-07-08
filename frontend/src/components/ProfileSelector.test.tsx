import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileSelector } from './ProfileSelector';
import { vi } from 'vitest';

describe('ProfileSelector', () => {
  it('calls onChange when language is selected', async () => {
    const onChange = vi.fn();
    render(<ProfileSelector profile={{}} onChange={onChange} />);
    
    const user = userEvent.setup();
    const select = screen.getByLabelText('Preferred Language');
    await user.selectOptions(select, 'es');
    
    expect(onChange).toHaveBeenCalledWith({ language: 'es' });
  });

  it('calls onChange when venue is selected', async () => {
    const onChange = vi.fn();
    render(<ProfileSelector profile={{}} onChange={onChange} />);
    
    const user = userEvent.setup();
    const select = screen.getByLabelText('Venue');
    await user.selectOptions(select, 'v-metlife');
    
    expect(onChange).toHaveBeenCalledWith({ venueId: 'v-metlife' });
  });

  it('calls onChange when needs are toggled', async () => {
    const onChange = vi.fn();
    render(<ProfileSelector profile={{ needs: [] }} onChange={onChange} />);
    
    const user = userEvent.setup();
    const checkbox = screen.getByLabelText('wheelchair');
    await user.click(checkbox);
    
    expect(onChange).toHaveBeenCalledWith({ needs: ['wheelchair'] });
  });

  it('calls onChange to remove need when unchecked', async () => {
    const onChange = vi.fn();
    render(<ProfileSelector profile={{ needs: ['wheelchair'] }} onChange={onChange} />);
    
    const user = userEvent.setup();
    const checkbox = screen.getByLabelText('wheelchair');
    await user.click(checkbox);
    
    expect(onChange).toHaveBeenCalledWith({ needs: [] });
  });
});
