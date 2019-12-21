import React from "react";
import { CInput } from "../Input";
import { FieldInputProps } from "formik";
import { RawFieldInputControl, UIRow } from "./types";

export interface RawInput extends RawFieldInputControl {
  title: string;
  type: "text" | "url" | "number" | "email";
}

export const makeInput = async ({
  title,
  type,
}: RawInput): Promise<React.ComponentType<FieldInputProps<any>>> => {
  return props => <CInput {...props} label={title} type={type} />;
};

export const makeInput2 = async (
  row: UIRow,
): Promise<React.ComponentType<FieldInputProps<any>>> => {
  return props => <CInput {...props} label={row.field.title} type="text" />;
};
