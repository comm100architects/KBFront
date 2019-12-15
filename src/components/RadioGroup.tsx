import * as React from "react";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { CElementProps } from "./Base";
import { FieldInputProps } from "formik";
import FormLabel from "@material-ui/core/FormLabel";

export interface CRadioOption extends CElementProps {
  value: string | number;
  text: string;
}

export interface CRadioGroupProps
  extends FieldInputProps<string | number>,
    CElementProps {
  options: CRadioOption[];
  title?: string;
}

export const CRadioGroup = (props: CRadioGroupProps) => {
  return (
    <>
      {props.title && <FormLabel component="div">{props.title}</FormLabel>}
      <RadioGroup
        id={props.id}
        onChange={props.onChange}
        onBlur={props.onBlur}
        value={props.value}
        name={props.name}
      >
        {props.options.map(({ text, value }) => (
          <FormControlLabel
            key={value}
            value={value}
            control={<Radio color="primary" />}
            label={text}
          />
        ))}
      </RadioGroup>
    </>
  );
};