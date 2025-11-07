import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SurveyForm from './SurveyForm';

describe('SurveyForm', () => {
  it('shows required field errors when submitted empty', async () => {
    render(<SurveyForm />);

    const submit = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submit);

    // Expect validation messages for firstName, lastName and email
  expect(await screen.findByText(/First name is required/i)).toBeTruthy();
  expect(screen.getByText(/Last name is required/i)).toBeTruthy();
  expect(screen.getByText(/Invalid email address/i)).toBeTruthy();
  });
});
