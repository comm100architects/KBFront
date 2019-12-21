import * as React from "react";
import { FieldInputProps } from "formik";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import { CElementProps } from "./base";

interface CInputProps extends FieldInputProps<string>, CElementProps {
  label?: string;
  type: string;
}

export const CInput = (props: CInputProps) => {
  return (
    <>
      {props.label && (
        <InputLabel data-test-id="input-label" htmlFor={props.id}>
          {props.label}
        </InputLabel>
      )}
      <Input {...props} />
    </>
  );
};
