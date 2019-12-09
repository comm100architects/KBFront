export interface Category {
  id: string;
  title: string;
  parentCategoryId: string;
  index: number;
}

export interface CategoryPosition {
  parentCategoryId: string;
  index: number;
}

