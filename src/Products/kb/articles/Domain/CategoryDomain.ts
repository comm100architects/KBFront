import { ICategoryRepository } from "../Repository/CategoryRepository";
import { Category, CategoryPosition } from "../Entity/Category";

export interface ICategoryDomain {}

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

  deleteCategory(id: string): Promise<{}> {
    return this.categoryRepository.delete(id);
  }

  moveCategory(id: string, to: CategoryPosition): Promise<{}> {
    return this.categoryRepository.move(id, to);
  }
}
