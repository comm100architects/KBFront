import { IArticleRepository } from "../Repository/ArticleRepository";
import { Article } from "../Entity/Article";

export class ArticleDomain {
  private articleRepository: IArticleRepository;

  constructor(articleRepository: IArticleRepository) {
    this.articleRepository = articleRepository;
    // this.getArticleCached = _.memoize((keyword: string) => {
    //   const query = keyword ? [{ key: "keyword", value: keyword! }] : [];
    //   return this.articleRepository.list(query);
    // });
  }

  addArticle(article: Article): Promise<Article> {
    return this.articleRepository.add(article);
  }

  updateArticle(article: Article): Promise<Article> {
    return this.articleRepository.update(article.id, article);
  }

  getArticles(keyword?: string): Promise<Article[]> {
    const query = keyword ? [{ key: "keyword", value: keyword! }] : [];

    return this.articleRepository.list(query);
  }

  getArticle(id: string): Promise<Article> {
    return this.articleRepository.get(id);
  }

  deleteArticle(id: string): Promise<void> {
    return this.articleRepository.delete(id);
  }
}
