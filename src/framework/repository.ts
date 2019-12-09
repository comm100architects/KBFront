import { fetchJson } from "./network";

export interface IRepository<Entity> {
  endPoint: string;

  add(obj: Entity): Promise<Entity>;
  update(id: string, obj: Entity): Promise<Entity>;
  get(id: string): Promise<Entity>;
  delete(id: string): Promise<void>;
  list(params?: QueryItem[]): Promise<Entity[]>;
}

export interface QueryItem {
  key: string;
  value: string;
}

export class RESTfulRepository<Entity> implements IRepository<Entity> {
  endPoint: string;
  constructor(endPoint: string) {
    this.endPoint = endPoint;
  }

  add(obj: Entity): Promise<Entity> {
    return fetchJson(this.endPoint, "POST", obj);
  }
  update(id: string, obj: Entity): Promise<Entity> {
    return fetchJson(`${this.endPoint}/${id}`, "PUT", obj);
  }
  get(id: string): Promise<Entity> {
    return fetchJson(`${this.endPoint}/${id}`, "GET");
  }
  delete(id: string): Promise<void> {
    return fetchJson(`${this.endPoint}/${id}`, "DELETE");
  }
  list(params?: QueryItem[]): Promise<Entity[]> {
    const query = params
      ?.map(
        ({ key, value }) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join("&");
    const url = query ? `${this.endPoint}?${query}` : this.endPoint;
    return fetchJson(url, "GET");
  }
}
