import React from "react";

export const makeCodeEditor = async (): Promise<React.ComponentType<any>> => {
  const CodeEditor = await import(
    /* webpackChunkName: "codeEditor" */
    `../components/CodeEditor`
  );

  return CodeEditor.default;
};
