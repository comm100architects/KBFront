import { Article, ArticleStatus } from "../Entity/Article";
import {
  ITableSource,
  LocalTableSource,
} from "../../../../components/Table/CTableSource";
import { IRepository } from "../../../../framework/repository";

export interface ArticleFilter {
  status?: ArticleStatus;
  categoryId?: string;
  keyword?: string;
  kbId?: string;
}

export class ArticleDomain {
  private articleRepository: IRepository<Article>;

  constructor(articleRepository: IRepository<Article>) {
    this.articleRepository = articleRepository;
  }

  addArticle(article: Article): Promise<Article> {
    return this.articleRepository.add(article);
  }

  updateArticle(article: Article): Promise<Article> {
    return this.articleRepository.update(article.id, article);
  }

  getArticles(filter: ArticleFilter): Promise<Article[]> {
    const query = [];

    if (!filter.kbId) {
      return Promise.resolve([]);
    }

    query.push({ key: "kbId", value: filter.kbId! });

    if (filter.keyword) {
      query.push({ key: "keyword", value: filter.keyword!.toString() });
    }

    if (filter.categoryId) {
      query.push({ key: "categoryId", value: filter.categoryId! as string });
    }

    if (filter.status != null) {
      query.push({ key: "status", value: filter.status!.toString() });
    }

    return this.articleRepository.getList(query);
  }

  getArticle(id: string): Promise<Article> {
    return this.articleRepository.get(id);
  }

  deleteArticle(id: string): Promise<void> {
    return this.articleRepository.delete(id);
  }

  tableSource(filter: ArticleFilter): ITableSource<Article> {
    return new LocalTableSource(this.getArticles(filter));
  }
}
