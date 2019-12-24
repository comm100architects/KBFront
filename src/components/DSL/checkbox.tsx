import React from "react";
import { UIRow } from "./types";
import { FieldInputProps } from "formik";
import { CCheckbox } from "../Checkbox";

export const makeCheckbox = async ({
  field,
}: UIRow): Promise<React.ComponentType<FieldInputProps<any>>> => {
  return props => {
    return (
      <CCheckbox
        {...props}
        title={field.title}
        label={field.labelsForValue!.find(({ key }) => key)!.label}
      />
    );
  };
};
