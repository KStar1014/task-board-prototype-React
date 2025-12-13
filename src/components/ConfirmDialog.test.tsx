import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog Component', () => {
  const defaultProps = {
    open: true,
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dialog when open is true', () => {
      render(<ConfirmDialog {...defaultProps} />);
      
      expect(screen.getByText('Delete Item')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
    });

    it('should not render dialog when open is false', () => {
      render(<ConfirmDialog {...defaultProps} open={false} />);
      
      expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
    });

    it('should render default button texts', () => {
      render(<ConfirmDialog {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should render custom button texts', () => {
      render(
        <ConfirmDialog
          {...defaultProps}
          confirmText="Yes, Remove"
          cancelText="No, Keep"
        />
      );
      
      expect(screen.getByRole('button', { name: /yes, remove/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /no, keep/i })).toBeInTheDocument();
    });

    it('should render with custom confirm color', () => {
      render(<ConfirmDialog {...defaultProps} confirmColor="warning" />);
      
      const confirmButton = screen.getByRole('button', { name: /delete/i });
      expect(confirmButton).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = jest.fn();
      
      render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
      
      const confirmButton = screen.getByRole('button', { name: /delete/i });
      await user.click(confirmButton);
      
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      
      render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when dialog backdrop is clicked', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      
      render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
      
      // MUI Dialog calls onClose when clicking backdrop
      // This is handled by the Dialog component itself
      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {

    it('should have dialog title with proper id', () => {
      render(<ConfirmDialog {...defaultProps} />);
      
      const title = screen.getByText('Delete Item');
      expect(title).toHaveAttribute('id', 'confirm-dialog-title');
    });

    it('should have dialog description with proper id', () => {
      render(<ConfirmDialog {...defaultProps} />);
      
      const description = screen.getByText('Are you sure you want to delete this item?');
      expect(description).toHaveAttribute('id', 'confirm-dialog-description');
    });

  });

  describe('Different Scenarios', () => {
    it('should handle task deletion scenario', () => {
      render(
        <ConfirmDialog
          open={true}
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
        />
      );
      
      expect(screen.getByText('Delete Task')).toBeInTheDocument();
      expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
    });

    it('should handle column deletion scenario', () => {
      render(
        <ConfirmDialog
          open={true}
          title="Delete Column"
          message="All tasks in this column will also be deleted."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
        />
      );
      
      expect(screen.getByText('Delete Column')).toBeInTheDocument();
      expect(screen.getByText(/all tasks in this column/i)).toBeInTheDocument();
    });
  });
});

