import React from "react";
import { UIRow } from "./types";

export const makeCodeEditor = async (
  _: UIRow,
): Promise<React.ComponentType<any>> => {
  const CodeEditor = await import(
    /* webpackChunkName: "codeEditor" */
    `../components/CodeEditor`
  );

  return CodeEditor.default;
};
