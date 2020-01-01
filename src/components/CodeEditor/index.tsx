import React, { Suspense } from "react";
import { FieldInputProps } from "formik";

export interface CCodeEditorProps extends FieldInputProps<string> {}

export const CCodeEditor = (props: CCodeEditorProps) => {
  const CodeEditor = React.lazy(() =>
    import(
      /* webpackChunkName: "codeEditor" */
      `./CodeEditor`
    ),
  );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CodeEditor {...props} />
    </Suspense>
  );
};
