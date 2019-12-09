import * as Query from "query-string";
import * as H from "history";

export const withQueryParam = (key: string, value?: string) => (
  search: string,
) => {
  const query = Query.parse(search);
  return `?${Query.stringify({ ...query, [key]: value })}`;
};

export const removeQueryParam = (key: string) => withQueryParam(key);

export const toPath = (
  path: string,
  changeSearch?: (search: string) => string,
) => (location: H.Location) => ({
  ...location,
  pathname: path,
  search: changeSearch ? changeSearch!(location.search) : location.search,
});

export const goToPath = (
  history: H.History,
  newLoc: (location: H.Location) => H.Location,
  replace?: boolean,
) => {
  if (replace) {
    history.replace(newLoc(history.location));
  } else {
    history.push(newLoc(history.location));
  }
};

export const goToSearch = (
  history: H.History,
  newSearch: (search: string) => string,
  replace?: boolean,
) => {
  if (replace) {
    history.replace({
      ...history.location,
      search: newSearch(history.location.search),
    });
  } else {
    history.push({
      ...history.location,
      search: newSearch(history.location.search),
    });
  }
};
