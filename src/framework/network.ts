import axios from "axios";

export const fetchJson = async <T = any>(
  url: string,
  method: "GET" | "DELETE" | "POST" | "PUT",
  body?: T,
): Promise<T> => {
  const resp = await axios({
    url,
    method,
    responseType: "json",
    data: body,
  });
  return resp.data;
};
