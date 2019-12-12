import { Category, CategoryPosition } from "../Entity/Category";
import { IRepository } from "../../../../framework/repository";

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
  categoryRepository: IRepository<Category>;

  constructor(categoryRepository: IRepository<Category>) {
    this.categoryRepository = categoryRepository;
  }

  addCategory(category: Category): Promise<Category> {
    return this.categoryRepository.add(category);
  }

  updateCategory(category: Category): Promise<Category> {
    return this.categoryRepository.update(category.id, category);
  }

  getCategories(kbId?: string): Promise<Category[]> {
    if (!kbId) {
      return Promise.resolve([]);
    }

    return this.categoryRepository.getList([{ key: "kbId", value: kbId }]);
  }

  deleteCategory(id: string): Promise<void> {
    return this.categoryRepository.delete(id);
  }

  moveCategory(id: string, to: CategoryPosition): Promise<void> {
    return this.categoryRepository.execute("move", id, to);
  }
}
