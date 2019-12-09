import * as React from "react";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
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
  onChange?(value: string): void;
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
  return (
    <Select
      value={props.value}
      onChange={
        props.onChange
          ? event => props.onChange!(event.target.value as string)
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
  );
};
