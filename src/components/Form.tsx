import * as React from "react";
import { CElementProps } from "./Base";
import { Field, FieldValidator, FieldInputProps } from "formik";

export interface CFormFieldProps<Val> extends CElementProps {
  onChange(value: Val): void;
  onBlue(): void;
  name: string;
  value: Val;
}

export interface CFieldProps<Value> {
  validate?: FieldValidator;
  name: string;
  type?: string;
  value?: any;
  children: React.Component<CFormFieldProps<Value>>;
}

export function CField<Value>(props: CFieldProps<Value>): JSX.Element {
  const Ctrl = props.children;
  const control = (props2: FieldInputProps) => {
    return <Ctrl />;
  };

  return <Field as={control}></Field>;
}
