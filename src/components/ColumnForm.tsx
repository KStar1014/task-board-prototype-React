import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

interface ColumnFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  initialName?: string;
  title?: string;
}

export const ColumnForm: React.FC<ColumnFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialName = '',
  title = 'Create Column',
}) => {
  const [name, setName] = useState(initialName);

  React.useEffect(() => {
    if (open) {
      setName(initialName);
    }
  }, [open, initialName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="column-form-dialog">
      <form onSubmit={handleSubmit}>
        <DialogTitle id="column-form-dialog">{title}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Column Name"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            aria-required="true"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} aria-label="Cancel">
            Cancel
          </Button>
          <Button type="submit" variant="contained" aria-label="Submit">
            {initialName ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

