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
