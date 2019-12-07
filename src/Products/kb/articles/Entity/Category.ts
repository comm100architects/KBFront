export type Category = {
  id: string;
  title: string;
  position: CategoryPosition;
};

export type CategoryPosition = {
  parentCategoryId: string;
  index: number;
};

