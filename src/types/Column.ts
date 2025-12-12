export type SortOption = 'normal' | 'A-Z' | 'Z-A';

export interface Column {
  id: string;
  name: string;
  order: number;
  sortOption?: SortOption;
}

