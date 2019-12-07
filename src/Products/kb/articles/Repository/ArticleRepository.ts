import {
  IRepository,
  RESTfulRepository,
} from "../../../../framework/repository";
import { Article } from "../Entity/Article";

export interface IArticleRepository extends IRepository<Article> {
  publish(id: string): Promise<{}>;
}

export class ArticleRepository extends RESTfulRepository<Article>
  implements IArticleRepository {
  publish(id: string): Promise<{}> {
    throw new Error("Method not implemented.");
  }
}
