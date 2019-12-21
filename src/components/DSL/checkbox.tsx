import React from "react";
import { RawCheckbox, UIRowCheckbox } from "./types";
import { FieldInputProps } from "formik";
import { CCheckbox } from "../Checkbox";

export const makeCheckbox = async ({
  label,
  title,
}: RawCheckbox): Promise<React.ComponentType<FieldInputProps<any>>> => {
  return props => {
    return <CCheckbox {...props} title={title} label={label} />;
  };
};

export const makeCheckbox2 = async ({
  label,
  field,
}: UIRowCheckbox): Promise<React.ComponentType<FieldInputProps<any>>> => {
  return props => {
    return <CCheckbox {...props} title={field.title} label={label} />;
  };
};
