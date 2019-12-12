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
  text: string;
  icon?: CIconName;
}

export interface CSelectProps
  extends CElementProps,
    Partial<FieldInputProps<string | number | undefined>> {
  items: CSelectOption[];
  label?: string;
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
      {props.label && <InputLabel id={labelId}>{props.label}</InputLabel>}
      <Select
        id={props.id}
        labelId={labelId}
        value={props.value}
        name={props.name}
        onChange={props.onChange}
        onBlur={props.onBlur}
        className={classes.root}
      >
        {props.items.map(({ id, value, text, icon }) => {
          return (
            <MenuItem id={id} key={value} value={value}>
              <span className={classes.icon}>
                {icon && <CIcon name={icon} />}
              </span>
              {text}
            </MenuItem>
          );
        })}
      </Select>
    </>
  );
};
