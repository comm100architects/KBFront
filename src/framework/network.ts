export const fetchJson = async (
  path: string,
  method: "GET" | "DELETE" | "POST" | "PUT",
  body?: any,
): Promise<any> => {
  const resp = await fetch(path, {
    method,
    body: JSON.stringify(body),
    headers: [["Content-Type", "application/json"]],
  });
  return await resp.json();
};
