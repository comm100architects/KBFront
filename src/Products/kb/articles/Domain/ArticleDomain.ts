import { IArticleRepository } from "../Repository/ArticleRepository";
import { Article, ArticleStatus } from "../Entity/Article";
import {
  ITableSource,
  LocalTableSource,
} from "../../../../components/Table/CTableSource";
import { IRepository } from "../../../../framework/repository";

export interface ArticleFilter {
  status: ArticleStatus;
  categoryId?: string;
  keyword?: string;
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

  async getArticles(filter: ArticleFilter): Promise<Article[]> {
    const query = filter.keyword
      ? [{ key: "keyword", value: filter.keyword! }]
      : [];

    const articles = await this.articleRepository.getList(query);
    return articles
      .filter(article => {
        if (filter.categoryId) {
          return article.categoryId === filter.categoryId!;
        }
        return true;
      })
      .filter(article => {
        if (filter.status === ArticleStatus.all) {
          return true;
        }
        return article.status === filter.status;
      });
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

export class ArticleDomainRemotePaginate {
  private articleRepository: IArticleRepository;

  constructor(articleRepository: IArticleRepository) {
    this.articleRepository = articleRepository;
  }

  addArticle(article: Article): Promise<Article> {
    return this.articleRepository.add(article);
  }

  updateArticle(article: Article): Promise<Article> {
    return this.articleRepository.update(article.id, article);
  }

  async getArticles(filter: ArticleFilter): Promise<Article[]> {
    const query = filter.keyword
      ? [{ key: "keyword", value: filter.keyword! }]
      : [];

    const articles = await this.articleRepository.getList(query);
    return articles
      .filter(article => {
        if (filter.categoryId) {
          return article.categoryId === filter.categoryId!;
        }
        return true;
      })
      .filter(article => {
        if (filter.status === ArticleStatus.all) {
          return true;
        }
        return article.status === filter.status;
      });
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
