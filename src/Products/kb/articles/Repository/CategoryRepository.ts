import {
  IRepository,
  RESTfulRepository,
} from "../../../../framework/repository";
import { Category, CategoryPosition } from "../Entity/Category";

export interface ICategoryRepository extends IRepository<Category> {
  move(id: string, to: CategoryPosition): Promise<{}>;
}

export class CategoryRepository extends RESTfulRepository<Category>
  implements ICategoryRepository {
  move(id: string, to: CategoryPosition): Promise<{}> {
    throw new Error("Method not implemented.");
  }
}
