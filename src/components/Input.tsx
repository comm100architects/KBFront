import * as React from "react";
import { FieldInputProps } from "formik";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import { CElementProps } from "./base";

interface CInputProps extends FieldInputProps<string>, CElementProps {
  label?: string;
  type: string;
  startAdornment: React.ReactNode;
  endAdornment: React.ReactNode;
}

export const CInput = (props: CInputProps) => {
  return (
    <>
      {props.label && (
        <InputLabel id={`${props.id}-label`}>{props.label}</InputLabel>
      )}
      <Input {...props} />
    </>
  );
};
