export interface IHttpClient {
  request(method: "GET" | "DELETE", path: string): Promise<any>;
  request(method: "POST" | "PUT", path: string, body: any): Promise<any>;
}
