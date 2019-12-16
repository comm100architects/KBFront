import React from "react";
import { RawCheckbox } from "./types";
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
