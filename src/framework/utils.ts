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

const variableRegexp = () => /\$((?!\d)\w+)/g;
export const hasVariable = (s: string): boolean => {
  return variableRegexp().test(s);
};
export const replaceVariables = (
  temp: string,
  values: { [id: string]: any } | undefined,
): string =>
  values
    ? temp.replace(
        // variable name contains \w and not start with number
        variableRegexp(),
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

export const convertType = (type: string, value: String): any => {
  if (type === "number" && typeof value === "string") {
    return parseInt(value);
  } else if (type === "boolean" && typeof value === "string") {
    return value === "true";
  }
  return value;
};

const evalCondition = (expression: string, values: any) => {
  const m = expression.match(/\s*([^\s]+?)\s*==\s*([^\s]+?)\s*$/);
  if (m) {
    const [_, variable, value] = m;
    return values[variable] == value;
  }

  throw new Error("Eval condition error");
};

export const evalConditions = (
  expressions: string[],
  values: any,
  andOp: boolean,
): boolean => {
  if (andOp) {
    for (const expression of expressions) {
      if (!evalCondition(expression, values)) return false;
    }
    return true;
  }

  for (const expression of expressions) {
    if (evalCondition(expression, values)) return true;
  }
  return false;
};

// ER field.type
export const emptyValueOfType = (type: string) => {
  switch (type) {
    case "string":
      return "";
    case "int":
      return 0;
    case "bool":
      return false;
    default:
      return undefined;
  }
};

export const tocamelCase = (s: string): string => {
  if (s.length > 0) return s[0].toLowerCase() + s.substr(1);
  return s;
};

export const toCamelCase = (s: string): string => {
  if (s.length > 0) return s[0].toUpperCase() + s.substr(1);
  return s;
};

export const wordsInsideSentence = (words: string): string =>
  words.replace(/(\w+)/g, word => tocamelCase(word));

export const ifValidFile = (
  fileName: string,
  acceptExTenssion: string[] = [],
): boolean => {
  const reg = new RegExp(`\.(${acceptExTenssion.join("|")})$`, "i");
  return reg.test(fileName);
};
