import React from "react";
import { FieldInputProps } from "formik";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/xml/xml";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/css/css";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    codeMirror: {
      fontFamily: "Consolas, monospace",
      fontSize: 16,
      width: "100%",
      border: `solid 1px ${theme.palette.divider}`,
      borderRadius: theme.shape.borderRadius,
    },
  }),
);

export interface CCodeEditProps extends FieldInputProps<string> {
  language?: string;
}

export const CCodeEdit: React.ComponentType<CCodeEditProps> = (
  props: CCodeEditProps,
) => {
  const handleBlur = (_editor: any, event: Event) => {
    props.onBlur(event);
  };
  const handleBeforeChange = (_editor: any, _data: any, val: string) => {
    props.onChange({ target: { value: val, name: props.name } });
  };
  const classes = useStyles();
  return (
    <CodeMirror
      className={classes.codeMirror}
      value={props.value}
      onBeforeChange={handleBeforeChange}
      onBlur={handleBlur}
      options={{
        lineNumbers: 20,
        lineWrapping: true,
        mode: props.language,
      }}
    />
  );
};
CCodeEdit.displayName = "CCodeEditor";
