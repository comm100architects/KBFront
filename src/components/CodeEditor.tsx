import React from "react";
import { FieldInputProps } from "formik";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/xml/xml";
import "codemirror/mode/css/css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/htmlmixed/htmlmixed";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import hljs from "highlight.js/lib/highlight";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import CCodeEditorToolBar from "./CodeEditorToolBar";

hljs.registerLanguage("css", css);
hljs.registerLanguage("htmlmixed", xml);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    codeMirror: {
      fontFamily: "Consolas, monospace",
      fontSize: 16,
      width: "100%",
    },
  }),
);

const useContainerStyles = makeStyles((theme: Theme) => ({
  root: {
    border: "1px solid #ccc",
    padding: "0px",
  },
}));

interface CCodeEditorProps extends FieldInputProps<string> {}

const CCodeEditor: React.ComponentType<CCodeEditorProps> = (
  props: CCodeEditorProps,
) => {
  // const [value, setValue] = React.useState(props.value);

  const handleBlur = (_editor: any) => {
    props.onBlur({ target: { name: props.name } });
  };
  const handleBeforeChange = (_editor: any, _data: any, val: string) => {
    console.log("handleBeforeChange");
    // setValue(val);
    props.onChange({ target: { value: val, name: props.name } });
  };
  const classes = useStyles();
  const containerCSS = useContainerStyles();
  const lang = React.useMemo(
    () => hljs.highlightAuto(props.value || "").language || "mixedhtml",
    [],
  );
  return (
    <Container className={containerCSS.root}>
      <CCodeEditorToolBar
        onAddImages={_ => void 0}
        onAddArticles={_ => void 0}
        onAddCategorys={_ => void 0}
      />
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
    </Container>
  );
};
CCodeEditor.displayName = "CCodeEditor";
export default CCodeEditor;
