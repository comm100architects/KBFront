import * as React from "react";
import { FieldInputProps } from "formik";
import Input from "@material-ui/core/Input";
import { CElementProps } from "./base";
import FormLabel from "@material-ui/core/FormLabel";

interface CInputProps extends FieldInputProps<string>, CElementProps {
  label?: string;
  type: string;
}

export const CInput = (props: CInputProps) => {
  return (
    <>
      {props.label && (
        <FormLabel
          data-test-id="input-label"
          htmlFor={props.id}
          component="div"
        >
          {props.label}
        </FormLabel>
      )}
      <Input {...props} />
    </>
  );
};
CInput.displayName = "CInput";
