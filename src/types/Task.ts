import { Attachment } from './Attachment';

export interface Task {
  id: string;
  name: string;
  description: string;
  deadline: string | null;
  columnId: string;
  imageUrl: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  // Keep attachments for backward compatibility
  attachments?: Attachment[];
}

