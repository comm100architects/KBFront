import React from "react";
import { FieldInputProps } from "formik";
import { CCodeEdit } from "../CodeEditor";
import { FormLabel } from "@material-ui/core";
import { UIRow } from "./types";

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
        <CCodeEdit {...props} />
      </>
    );
  };
};
