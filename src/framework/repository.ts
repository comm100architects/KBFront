import { fetchJson } from "./network";
import _ from "lodash";

export interface IRepository<Entity> {
  add(obj: Entity): Promise<Entity>;
  update(id: string | number, obj: Entity): Promise<Entity>;
  get(id?: string | number): Promise<Entity>;
  delete(id: string | number): Promise<void>;
  getList(params?: QueryItem[]): Promise<Entity[]>;
  execute(
    action: string,
    objectId: string | number,
    payload: any,
  ): Promise<any>;
}

export interface QueryItem {
  key: string;
  value: string;
}

export class ReadonlyLocalRepository<
  Entity extends { id: string | number; [key: string]: any }
> implements IRepository<Entity> {
  private entities: Entity[];
  constructor(entities: Entity[]) {
    this.entities = entities;
  }

  add(): Promise<Entity> {
    return Promise.reject("readonly");
  }
  update(): Promise<Entity> {
    return Promise.reject("readonly");
  }

  delete(): Promise<void> {
    return Promise.reject("readonly");
  }

  execute(): Promise<any> {
    return Promise.reject("readonly");
  }

  get(id?: string): Promise<Entity> {
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

  getList(params?: QueryItem[]): Promise<Entity[]> {
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

export class RESTfulRepository<Entity> implements IRepository<Entity> {
  endPoint: string;
  constructor(url: string, entityName?: string) {
    if (entityName == null) {
      this.endPoint = url;
    } else {
      this.endPoint = `${url}/${entityName}`;
    }
  }

  add(obj: Entity): Promise<Entity> {
    return fetchJson(this.endPoint, "POST", obj);
  }
  update(id: string, obj: Entity): Promise<Entity> {
    return fetchJson(`${this.endPoint}/${id}`, "PUT", obj);
  }
  async get(id?: string): Promise<Entity> {
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
