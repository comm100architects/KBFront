import { IHttpClient } from "./network";

export interface IRepository<Entity> {
  endPoint: string;

  add(obj: Entity): Promise<Entity>;
  update(id: string, obj: Entity): Promise<Entity>;
  get(id: string): Promise<Entity>;
  delete(id: string): Promise<{}>;
  list(params?: QueryItem[]): Promise<Entity[]>;
}

export interface QueryItem {
  key: string;
  value: string;
}

export class RESTfulRepository<Entity> implements IRepository<Entity> {
  endPoint: string;
  client: IHttpClient;
  constructor(endPoint: string) {
    this.endPoint = endPoint;
    this.client = { request: () => Promise.resolve({}) };
  }

  add(obj: Entity): Promise<Entity> {
    return this.client.request("POST", this.endPoint, JSON.stringify(obj));
  }
  update(id: string, obj: Entity): Promise<Entity> {
    return this.client.request(
      "PUT",
      `${this.endPoint}/${id}`,
      JSON.stringify(obj),
    );
  }
  get(id: string): Promise<Entity> {
    return this.client.request("GET", `${this.endPoint}/${id}`);
  }
  delete(id: string): Promise<{}> {
    return this.client.request("DELETE", `${this.endPoint}/${id}`);
  }
  list(params?: QueryItem[]): Promise<Entity[]> {
    const query = params
      ?.map(
        ({ key, value }) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join("&");
    return this.client.request("GET", `${this.endPoint}?${query}`);
  }
}
