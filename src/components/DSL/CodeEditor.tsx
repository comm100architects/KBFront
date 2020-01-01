import React, { Suspense } from "react";
import { FieldInputProps } from "formik";
import { FormLabel } from "@material-ui/core";
import { UIRow } from "./types";

const CodeEditor = React.lazy(() =>
  import(
    /* webpackChunkName: "codeEditor" */
    `../CodeEditor`
  ),
);

export const makeCodeEditor = async (
  row: UIRow,
): Promise<React.ComponentType<FieldInputProps<any>>> => {
  const title = row.field.title;

  return props => {
    return (
      <>
        {title && (
          <FormLabel data-test-id="codeEditor-label" component="div">
            {title}
          </FormLabel>
        )}
        <Suspense fallback={<div>Loading...</div>}>
          <CodeEditor {...props} />
        </Suspense>
      </>
    );
  };
};
