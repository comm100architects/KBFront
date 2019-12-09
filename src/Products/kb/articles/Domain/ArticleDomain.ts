import { IArticleRepository } from "../Repository/ArticleRepository";
import { Article, ArticleStatus } from "../Entity/Article";

interface ArticleFilter {
  status?: ArticleStatus;
  tag?: string;
  keyword?: string;
  categoryId?: string;
}

export class ArticleDomain {
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
      ? [{ key: "q", value: filter.categoryId! }]
      : [];

    // FIXME: cache articles??
    const result = await this.articleRepository.list(query);

    return result
      .filter(article => {
        if (filter.categoryId) {
          return article.categoryId === filter.categoryId!;
        }
        return true;
      })
      .filter(article => {
        if (filter.status) {
          return article.status === filter.status!;
        }
        return true;
      })
      .filter(article => {
        if (filter.tag) {
          return article.tags.indexOf(filter.tag!) !== -1;
        }
        return true;
      });
  }

  getArticle(id: string): Promise<Article> {
    return this.articleRepository.get(id);
  }

  deleteArticle(id: string): Promise<void> {
    return this.articleRepository.delete(id);
  }
}
