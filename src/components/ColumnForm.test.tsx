import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ColumnForm } from './ColumnForm';

describe('ColumnForm Component', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render form when open is true', () => {
      render(<ColumnForm {...defaultProps} />);
      
      expect(screen.getByText('Create Column')).toBeInTheDocument();
      expect(screen.getByLabelText(/column name/i)).toBeInTheDocument();
    });

    it('should not render form when open is false', () => {
      render(<ColumnForm {...defaultProps} open={false} />);
      
      expect(screen.queryByText('Create Column')).not.toBeInTheDocument();
    });

    it('should render custom title', () => {
      render(<ColumnForm {...defaultProps} title="Edit Column" />);
      
      expect(screen.getByText('Edit Column')).toBeInTheDocument();
    });

    it('should render Cancel button', () => {
      render(<ColumnForm {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should populate input with initial name', () => {
      render(<ColumnForm {...defaultProps} initialName="In Progress" />);
      
      const input = screen.getByLabelText(/column name/i) as HTMLInputElement;
      expect(input.value).toBe('In Progress');
    });
  });

  describe('User Interactions', () => {
    it('should update input value when typing', async () => {
      const user = userEvent.setup();
      render(<ColumnForm {...defaultProps} />);
      
      const input = screen.getByLabelText(/column name/i);
      await user.type(input, 'New Column');
      
      expect(input).toHaveValue('New Column');
    });

    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      
      render(<ColumnForm {...defaultProps} onClose={onClose} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should reset form when reopened', async () => {
      const { rerender } = render(<ColumnForm {...defaultProps} open={false} />);
      
      rerender(<ColumnForm {...defaultProps} open={true} initialName="" />);
      
      const input = screen.getByLabelText(/column name/i) as HTMLInputElement;
      expect(input.value).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ColumnForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/column name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cancel/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/submit/i)).toBeInTheDocument();
    });
  });
});

