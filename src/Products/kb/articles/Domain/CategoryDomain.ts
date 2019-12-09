import { ICategoryRepository } from "../Repository/CategoryRepository";
import { Category, CategoryPosition } from "../Entity/Category";

export interface CategoryTree {
  id: string;
  title: string;
  children: CategoryTree[];
}

export const makeCategoryTree = (
  categories: Category[],
  currentCategory: Category,
): CategoryTree => ({
  id: currentCategory.id,
  title: currentCategory.title,
  children: categories
    .filter(c => c.parentCategoryId === currentCategory.id)
    .sort((a, b) => a.index - b.index)
    .map(c => makeCategoryTree(categories, c)),
});

export const findRootCategory = (categories: Category[]): Category =>
  categories.find(c => !Boolean(c.parentCategoryId))!;

export class CategoryDomain {
  categoryRepository: ICategoryRepository;

  constructor(categoryRepository: ICategoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  addCategory(category: Category): Promise<Category> {
    return this.categoryRepository.add(category);
  }

  updateCategory(category: Category): Promise<Category> {
    return this.categoryRepository.update(category.id, category);
  }

  getCategories(): Promise<Category[]> {
    return this.categoryRepository.list();
  }

  deleteCategory(id: string): Promise<void> {
    return this.categoryRepository.delete(id);
  }

  moveCategory(id: string, to: CategoryPosition): Promise<void> {
    return this.categoryRepository.move(id, to);
  }
}
