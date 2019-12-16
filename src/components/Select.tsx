import * as React from "react";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { CIconName, CIcon } from "./Icons";
import { CElementProps } from "./base";
import { FieldInputProps } from "formik";

export interface CSelectOption extends CElementProps {
  value?: string | number;
  label: string;
  icon?: CIconName;
}

export interface CSelectProps
  extends CElementProps,
    Partial<FieldInputProps<string | number | undefined>> {
  options: CSelectOption[];
  title?: string;
}

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      "& > .MuiSelect-root": {
        display: "flex",
        alignItems: "center",
      },
    },
    icon: {
      marginRight: theme.spacing(1),
      lineHeight: 0,
    },
  }),
);

export const CSelect = (props: CSelectProps) => {
  const classes = useStyle();
  const labelId = props.id ? `${props.id}-label` : undefined;
  return (
    <>
      {props.title && (
        <InputLabel htmlFor={props.id} id={labelId}>
          {props.title}
        </InputLabel>
      )}
      <Select
        id={props.id}
        labelId={labelId}
        value={props.value || props.options[0]?.value}
        name={props.name}
        onChange={props.onChange}
        onBlur={props.onBlur}
        className={classes.root}
      >
        {props.options.map(({ id, value, label, icon }) => {
          return (
            <MenuItem id={id} key={value} value={value}>
              <span className={classes.icon}>
                {icon && <CIcon name={icon} />}
              </span>
              {label}
            </MenuItem>
          );
        })}
      </Select>
    </>
  );
};
