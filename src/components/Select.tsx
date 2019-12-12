import * as React from "react";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { SvgIconProps } from "@material-ui/core/SvgIcon";

export interface CSelectOption {
  value: string | number;
  text: string;
  icon?(props: SvgIconProps): JSX.Element;
}

interface SelectProps {
  value: string | number;
  items: CSelectOption[];
  onChange?(value: string | number): void;
  id?: string;
  label?: string;
}

const useSelectStyle = makeStyles((theme: Theme) =>
  createStyles({
    icon: {
      marginRight: theme.spacing(1),
    },
  }),
);

export const CSelect = (props: SelectProps) => {
  const classes = useSelectStyle();
  const labelId = props.id ? `${props.id}-label` : undefined;
  return (
    <>
      {props.label && <InputLabel id={labelId}>{props.label}</InputLabel>}
      <Select
        labelId={labelId}
        value={props.value}
        onChange={
          props.onChange
            ? event => props.onChange!(event.target.value as string | number)
            : undefined
        }
      >
        {props.items.map(({ value, text, icon }) => {
          return (
            <MenuItem key={value} value={value}>
              <span className={classes.icon}>
                {icon && icon({ titleAccess: text, fontSize: "small" })}
              </span>
              {text}
            </MenuItem>
          );
        })}
      </Select>
    </>
  );
};
