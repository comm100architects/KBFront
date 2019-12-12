import { fetchJson } from "./network";

export interface IRepository<Entity> {
  add(obj: Entity): Promise<Entity>;
  update(id: string, obj: Entity): Promise<Entity>;
  get(id: string): Promise<Entity>;
  delete(id: string): Promise<void>;
  getList(params?: QueryItem[]): Promise<Entity[]>;
  execute(action: string, objectId: string, payload: any): Promise<any>;
}

export interface QueryItem {
  key: string;
  value: string;
}

export class RESTfulRepository<Entity> implements IRepository<Entity> {
  endPoint: string;
  constructor(host: string, entityName: string) {
    this.endPoint = `//${host}/${entityName}`;
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
  getList(params?: QueryItem[]): Promise<Entity[]> {
    const query = params
      ?.map(
        ({ key, value }) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join("&");
    const url = query ? `${this.endPoint}?${query}` : this.endPoint;
    return fetchJson(url, "GET");
  }
  execute(action: string, objectId: string, payload: any): Promise<any> {
    return fetchJson(`${this.endPoint}/${objectId}:${action}`, "POST", payload);
  }
}
