import * as React from "react";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { CElementProps } from "./Base";
import { FieldInputProps } from "formik";
import { convertType } from "../framework/utils.ts";

export interface CRadioOption extends CElementProps {
  value: string | number;
  label: string;
}

export interface CRadioGroupProps
  extends FieldInputProps<string | number | boolean>,
    CElementProps {
  options: CRadioOption[];
}

export const CRadioGroup = (props: CRadioGroupProps) => {
  const handleChange = (e: React.ChangeEvent<{ value: string }>) => {
    return props.onChange({
      target: {
        id: props.id,
        name: props.name,
        value: convertType(typeof props.value, e.target.value),
      },
    });
  };
  return (
    <RadioGroup
      id={props.id}
      onChange={handleChange}
      onBlur={props.onBlur}
      value={props.value}
      name={props.name}
    >
      {props.options.map(({ label, value }) => (
        <FormControlLabel
          data-test-id={`form-radio-group-item-${value}`}
          key={value}
          value={value}
          control={<Radio color="primary" />}
          label={label}
        />
      ))}
    </RadioGroup>
  );
};
CRadioGroup.displayName = "CRadioGroup";
