import * as React from "react";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { CIconName, CIcon } from "./Icons";
import { CElementProps } from "./Base";
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
}

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      "& > .MuiSelect-root": {
        display: "flex",
        alignItems: "center",
      },
      width: 204,
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
    <Select
      id={props.id}
      labelId={labelId}
      value={props.value || props.options[0]?.value}
      name={props.name}
      onChange={props.onChange}
      onBlur={props.onBlur}
      className={classes.root}
      displayEmpty={true}
    >
      {props.options.map(({ id, value, label, icon }, i) => {
        return (
          <MenuItem
            data-test-id={`select-option-${id}`}
            id={id}
            key={i}
            value={value}
          >
            <span className={classes.icon}>
              {icon && <CIcon name={icon} />}
            </span>
            {label}
          </MenuItem>
        );
      })}
    </Select>
  );
};
CSelect.displayName = "CSelect";
