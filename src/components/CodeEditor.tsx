import React from "react";
import { FieldInputProps } from "formik";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/xml/xml";
import "codemirror/mode/css/css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/htmlmixed/htmlmixed";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import hljs from "highlight.js/lib/highlight";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";

hljs.registerLanguage("css", css);
hljs.registerLanguage("htmlmixed", xml);

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

interface CCodeEditorProps extends FieldInputProps<string> {}

const CCodeEditor: React.ComponentType<CCodeEditorProps> = (
  props: CCodeEditorProps,
) => {
  const handleBlur = (_editor: any, event: Event) => {
    props.onBlur(event);
  };
  const handleBeforeChange = (_editor: any, _data: any, val: string) => {
    props.onChange({ target: { value: val, name: props.name } });
  };
  const classes = useStyles();
  const lang = React.useMemo(
    () => hljs.highlightAuto(props.value).language || "mixedhtml",
    [],
  );
  return (
    <CodeMirror
      className={classes.codeMirror}
      value={props.value}
      onBeforeChange={handleBeforeChange}
      onBlur={handleBlur}
      options={{
        lineNumbers: 20,
        lineWrapping: true,
        mode: lang,
      }}
    />
  );
};
CCodeEditor.displayName = "CCodeEditor";
export default CCodeEditor;
