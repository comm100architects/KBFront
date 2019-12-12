import axios from "axios";

export const fetchJson = async (
  url: string,
  method: "GET" | "DELETE" | "POST" | "PUT",
  body?: any,
): Promise<any> => {
  const resp = await axios({
    url,
    method,
    responseType: "json",
    data: body,
  });
  return resp.data;
};
