import { fetchJson } from "./network";
import _ from "lodash";

export interface IRepository<E> {
  add(obj: E): Promise<E>;
  update(id: string | number, obj: E): Promise<E>;
  get(id?: string | number): Promise<E>;
  delete(id: string | number): Promise<void>;
  getList(params?: QueryItem[]): Promise<E[]>;
  execute(
    action: string,
    objectId: string | number,
    payload: any,
  ): Promise<any>;
}

export interface QueryItem {
  key: string;
  value: string | number;
}

export class ReadonlyLocalRepository<
  E extends { id: string | number; [key: string]: any }
> implements IRepository<E> {
  private entities: E[];
  constructor(entities: E[]) {
    this.entities = entities;
  }

  add(): Promise<E> {
    return Promise.reject("readonly");
  }
  update(): Promise<E> {
    return Promise.reject("readonly");
  }

  delete(): Promise<void> {
    return Promise.reject("readonly");
  }

  execute(): Promise<any> {
    return Promise.reject("readonly");
  }

  get(id?: string): Promise<E> {
    if (id) {
      const res = this.entities.find(entity => entity.id === id);
      if (res) {
        return Promise.resolve(res!);
      }
      return Promise.reject();
    } else {
      return Promise.resolve(this.entities[0]);
    }
  }

  getList(params?: QueryItem[]): Promise<E[]> {
    if (!params) {
      return Promise.resolve(this.entities);
    }

    return Promise.resolve(
      this.entities.filter(entity =>
        params.some(({ key, value }) => entity[key] == value),
      ),
    );
  }
}

export class RESTfulRepository<E> implements IRepository<E> {
  endPoint: string;
  constructor(url: string, entityName: string) {
    this.endPoint = `${url}/${entityName}`;
  }

  add(obj: E): Promise<E> {
    return fetchJson(this.endPoint, "POST", obj);
  }
  update(id: string | number, obj: E): Promise<E> {
    return fetchJson(`${this.endPoint}/${id}`, "PUT", obj);
  }
  async get(id?: string | number): Promise<E> {
    if (id) {
      return await fetchJson(`${this.endPoint}/${id}`, "GET");
    } else {
      const result = await fetchJson(this.endPoint, "GET");
      if (_.isArray(result)) {
        return result[0];
      }
      return result;
    }
  }
  delete(id: string | number): Promise<void> {
    return fetchJson(`${this.endPoint}/${id}`, "DELETE");
  }
  getList(params?: QueryItem[]): Promise<E[]> {
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
