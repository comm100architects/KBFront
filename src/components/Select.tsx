import * as React from "react";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { CIconName, CIcon } from "./Icons";
import { CElementProps } from "./base";

export interface CSelectOption extends CElementProps {
  value: string | number;
  text: string;
  icon?: CIconName;
}

interface SelectProps extends CElementProps {
  value?: string | number;
  items: CSelectOption[];
  onChange?(value?: string | number): void;
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
        id={props.id}
        labelId={labelId}
        value={props.value}
        onChange={
          props.onChange
            ? event => props.onChange!(event.target.value as string | number)
            : undefined
        }
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
