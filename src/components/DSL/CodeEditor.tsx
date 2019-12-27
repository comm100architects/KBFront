import React from "react";
import { FieldInputProps } from "formik";
import { UIRowCodeEditor } from "./types";
import { CCodeEdit } from "../CodeEditor";
import { FormLabel } from "@material-ui/core";

export const makeCodeEditor = async (
  row: UIRowCodeEditor,
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
        <CCodeEdit {...props} language={row.codeLanguage} />
      </>
    );
  };
};
