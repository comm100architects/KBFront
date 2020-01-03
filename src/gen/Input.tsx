import React from "react";
import { CInput } from "../components/Input";
import { FieldInputProps } from "formik";

export const makeInput = async (): Promise<React.ComponentType<
  FieldInputProps<any>
>> => {
  return props => <CInput {...props} type="text" />;
};
