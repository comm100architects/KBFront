import * as React from "react";
export const isPromise = (obj: any) => typeof obj.then === "function";
export const changeHandler = (
  handler: (h: any) => void,
): React.ChangeEventHandler<{ value: any }> => {
  return (event: React.ChangeEvent<{ value: any }>) => {
    handler(event.target.value);
  };
};

export const splitFirst = (str: string, sep: string) => {
  const i = str.indexOf(sep);
  if (i > 0) {
    return [str.substring(0, i), str.substring(i + 1)];
  }
  return [];
};

export const undefinedDefault = (val: undefined | any, defaults: any): any =>
  val === undefined ? defaults : val;

const variableRegexp = /\$((?!\d)\w+)/g;
export const hasVariable = (s: string) => variableRegexp.test(s);
export const replaceVariables = (
  temp: string,
  values: { [id: string]: any } | undefined,
): string =>
  values
    ? temp.replace(
        // variable name contains \w and not start with number
        variableRegexp,
        (name, fieldName) => {
          const v = values[fieldName];
          if (v === undefined) {
            console.warn(`variable ${fieldName} does not exists`);
            return name;
          }
          return v.toString();
        },
      )
    : temp;
