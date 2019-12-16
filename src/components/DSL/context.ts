import React from "react";
import { History } from "History";
import { goToSearch } from "../../framework/locationHelper";
import setIn from "lodash/fp/set";
import Query from "query-string";
import _ from "lodash";
import { splitFirst } from "../../framework/utils";

export const GlobalContext = React.createContext(
  {} as { [key: string]: IGlobalVariable },
);

interface IGlobalVariable {
  getValue(path: string): any;
  setValue(path: string, val: any): void;
}

export class GlobalQueryString implements IGlobalVariable {
  private history: History;
  private query: Query.ParsedQuery;

  constructor(history: History) {
    this.history = history;
    this.query = Query.parse(history.location.search);
  }

  getValue(path: string) {
    return _.get(this.query, path);
  }

  setValue(path: string, val: any): void {
    const newQuery = setIn(path, val, this.query);
    console.log("setValue", path, val, this.query, newQuery);
    if (_.isEqual(this.query, newQuery)) {
      return;
    } else {
      this.query = newQuery;
      goToSearch(this.history, () => Query.stringify(this.query));
    }
  }
}

export class GlobalState implements IGlobalVariable {
  private state: any;
  private setState: (s: any) => void;
  constructor(state: any, setState: (s: any) => void) {
    this.state = state;
    this.setState = setState;
  }

  getValue(path: string) {
    return _.get(this.state, path);
  }
  setValue(path: string, val: any): void {
    this.state = setIn(path, val, this.state);
    this.setState(this.state);
  }
}

const parseVariable = (variable: string) => {
  const [name, path] = splitFirst(variable, ".");
  if (name && path) {
    return { name, path };
  }
  throw new Error(`parseVariable error: ${variable}`);
};

export const useGlobal = (variable: string) => {
  const { name, path } = parseVariable(variable);
  const res = React.useContext(GlobalContext)[name];
  if (!res)
    throw new Error(
      `No global variable: ${name}. Only "query" and "state" are supported right now.`,
    );
  return [res.getValue(path), (val: any) => res.setValue(path, val)];
};
