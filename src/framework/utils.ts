import * as React from "react";
export const isPromise = (obj: any) => typeof obj.then === "function";
export const changeHandler = (
  handler: (h: any) => void,
): React.ChangeEventHandler<{ value: any }> => {
  return (event: React.ChangeEvent<{ value: any }>) => {
    handler(event.target.value);
  };
};
