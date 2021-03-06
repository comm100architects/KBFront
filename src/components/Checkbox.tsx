import * as React from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { CElementProps } from "./Base";
import { FieldInputProps } from "formik";

export interface CCheckboxProps
  extends FieldInputProps<string | number | boolean>,
  CElementProps {
  label: string;
}

export const CCheckbox = (props: CCheckboxProps) => {
  return (
    <FormControlLabel
      id={props.id}
      onChange={props.onChange}
      onBlur={props.onBlur}
      value={props.value}
      name={props.name}
      checked={props.value as boolean}
      control={<Checkbox color="primary" />}
      label={props.label}
    />
  );
};
