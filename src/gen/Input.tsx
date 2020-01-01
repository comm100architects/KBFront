import React from "react";
import { CInput } from "../components/Input";
import { FieldInputProps } from "formik";
import { UIRow } from "./types";

export const makeInput = async (
  _: UIRow,
): Promise<React.ComponentType<FieldInputProps<any>>> => {
  return props => <CInput {...props} type="text" />;
};
