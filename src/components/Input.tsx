import * as React from "react";
import { FieldInputProps } from "formik";
import Input from "@material-ui/core/Input";
import { CElementProps } from "./base";

interface CInputProps extends FieldInputProps<string>, CElementProps {
  type: string;
  autoFocus?: boolean;
}

export const CInput = (props: CInputProps) => {
  return <Input {...props} />;
};
CInput.displayName = "CInput";
