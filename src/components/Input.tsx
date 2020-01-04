import * as React from "react";
import { FieldInputProps } from "formik";
import Input from "@material-ui/core/Input";
import { CElementProps } from "./Base";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

interface CInputProps extends FieldInputProps<string>, CElementProps {
  type: string;
  autoFocus?: boolean;
}

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 204,
    },
  }),
);

export const CInput = (props: CInputProps) => {
  const classes = useStyle();
  return <Input className={classes.root} {...props} />;
};
CInput.displayName = "CInput";
