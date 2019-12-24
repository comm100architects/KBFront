import React from "react";
import { CInput } from "../Input";
import { FieldInputProps } from "formik";
import { UIRow } from "./types";

export const makeInput = async (
  row: UIRow,
): Promise<React.ComponentType<FieldInputProps<any>>> => {
  return props => <CInput {...props} label={row.field.title} type="text" />;
};
