import React from "react";
import { UIRow } from "./types";
import { CCodeEditor } from "../components/CodeEditor";

export const makeCodeEditor = async (
  _: UIRow,
): Promise<React.ComponentType<any>> => {
  return props => {
    return <CCodeEditor {...props} />;
  };
};
