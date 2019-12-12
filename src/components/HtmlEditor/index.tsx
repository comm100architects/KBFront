import * as React from "react";
import { Editor, EditorState } from "draft-js";
import {
  makeStyles,
  withStyles,
  Theme,
  createStyles,
} from "@material-ui/core/styles";
import { convertToHTML, convertFromHTML } from "draft-convert";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import FormatColorFillIcon from "@material-ui/icons/FormatColorFill";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import FormatBoldIcon from "@material-ui/icons/FormatBold";
import FormatListBulleted from "@material-ui/icons/FormatListBulleted";
import FormatListNumbered from "@material-ui/icons/FormatListNumbered";
import FormatItalicIcon from "@material-ui/icons/FormatItalic";
import FormatUnderlinedIcon from "@material-ui/icons/FormatUnderlined";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import FormatAlignLeftIcon from "@material-ui/icons/FormatAlignLeft";
import FormatAlignCenterIcon from "@material-ui/icons/FormatAlignCenter";
import FormatAlignRightIcon from "@material-ui/icons/FormatAlignRight";
import IconButton from "@material-ui/core/IconButton";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import CodeIcon from "@material-ui/icons/Code";
import InsertPhotoIcon from "@material-ui/icons/InsertPhoto";
import InsertLinkIcon from "@material-ui/icons/InsertLink";
import GridOnIcon from "@material-ui/icons/GridOn";
import LinkTool from "./LinkTool";
import { FieldInputProps } from "formik";

interface HtmlEditorProps extends FieldInputProps<string> {}

const StyledToggleButtonGroup = withStyles(theme => ({
  grouped: {
    margin: theme.spacing(0.5),
    border: "none",
    padding: theme.spacing(0, 1),
    "&:not(:first-child)": {
      borderRadius: theme.shape.borderRadius,
    },
    "&:first-child": {
      borderRadius: theme.shape.borderRadius,
    },
  },
}))(ToggleButtonGroup);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tools: {
      display: "flex",
      borderBottom: `1px solid ${theme.palette.divider}`,
      flexWrap: "wrap",
    },
    divider: {
      alignSelf: "stretch",
      height: "auto",
      margin: theme.spacing(1, 0.5),
    },
    fontSelect: {
      width: 100,
      justifyContent: "center",
      paddingLeft: theme.spacing(1),
    },
    editorRoot: {
      border: `1px solid ${theme.palette.divider}`,
    },
    editorBody: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      "& .public-DraftEditor-content": {
        height: 300,
        maxHeight: 300,
        overflow: "auto",
      },
    },
  }),
);

const Tools = () => {
  const classes = useStyles({});
  const [fontSize, setFontSize] = React.useState(11);
  const [alignment, setAlignment] = React.useState("left");
  const [formats, setFormats] = React.useState(() => ["italic"]);
  const [editCode, setEditCode] = React.useState([] as string[]);

  const handleFormat = (
    _: React.MouseEvent<HTMLElement>,
    newFormats: string[],
  ) => {
    setFormats(newFormats);
  };

  const handleEditCode = (_: React.MouseEvent<HTMLElement>, values: string[]) =>
    setEditCode(values);

  const handleAlignment = (
    _: React.MouseEvent<HTMLElement>,
    newAlignment: string,
  ) => {
    setAlignment(newAlignment);
  };

  const handleFontSize = (evt: React.ChangeEvent<{ value: unknown }>) =>
    setFontSize(evt.target.value as number);

  const [linkToolAnchorEl, setLinkToolAnchorEl] = React.useState<
    Element | undefined
  >();

  const handleLinkClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setLinkToolAnchorEl(event.currentTarget);
  };

  const handleLinkToolChange = (_: string) => {
    setLinkToolAnchorEl(undefined);
  };

  const handleLinkToolClose = () => {
    setLinkToolAnchorEl(undefined);
  };

  const linkToolOpen = Boolean(linkToolAnchorEl);
  const linkToolId = "link-tool-popover";

  return (
    <div className={classes.tools}>
      <FormControl className={classes.fontSelect}>
        <Select value={fontSize} onChange={handleFontSize} disableUnderline>
          {[8, 9, 10, 11, 12, 13, 14, 15].map(n => {
            return <MenuItem value={n}>{`${n}pt`}</MenuItem>;
          })}
        </Select>
      </FormControl>
      <Divider orientation="vertical" className={classes.divider} />
      <StyledToggleButtonGroup
        value={formats}
        onChange={handleFormat}
        size="small"
      >
        <ToggleButton value="bold" aria-label="bold">
          <FormatBoldIcon />
        </ToggleButton>
        <ToggleButton value="italic" aria-label="italic">
          <FormatItalicIcon />
        </ToggleButton>
        <ToggleButton value="underlined" aria-label="underlined">
          <FormatUnderlinedIcon />
        </ToggleButton>
        <IconButton value="color" aria-label="color">
          <FormatColorFillIcon />
          <ArrowDropDownIcon />
        </IconButton>
      </StyledToggleButtonGroup>
      <Divider orientation="vertical" className={classes.divider} />
      <StyledToggleButtonGroup
        value={alignment}
        onChange={handleAlignment}
        size="small"
        exclusive
      >
        <ToggleButton value="left" aria-label="left aligned">
          <FormatAlignLeftIcon />
        </ToggleButton>
        <ToggleButton value="center" aria-label="centered">
          <FormatAlignCenterIcon />
        </ToggleButton>
        <ToggleButton value="right" aria-label="right aligned">
          <FormatAlignRightIcon />
        </ToggleButton>
      </StyledToggleButtonGroup>
      <Divider orientation="vertical" className={classes.divider} />
      <StyledToggleButtonGroup
        value={alignment}
        onChange={handleAlignment}
        size="small"
      >
        <IconButton value="bullets" aria-label="bullets">
          <FormatListBulleted />
        </IconButton>
        <IconButton value="numbers" aria-label="numbers">
          <FormatListNumbered />
        </IconButton>
      </StyledToggleButtonGroup>
      <Divider orientation="vertical" className={classes.divider} />
      <StyledToggleButtonGroup size="small">
        <IconButton
          value="link"
          aria-label="link"
          aria-describedby={linkToolId}
          onClick={handleLinkClick}
        >
          <InsertLinkIcon />
        </IconButton>
        <IconButton value="photo" aria-label="photo">
          <InsertPhotoIcon />
        </IconButton>
        <IconButton value="table" aria-label="table">
          <GridOnIcon />
          <ArrowDropDownIcon />
        </IconButton>
      </StyledToggleButtonGroup>
      <Divider orientation="vertical" className={classes.divider} />
      <StyledToggleButtonGroup
        value={editCode}
        onChange={handleEditCode}
        size="small"
      >
        <ToggleButton value="code" aria-label="code">
          <CodeIcon />
        </ToggleButton>
      </StyledToggleButtonGroup>
      <LinkTool
        id={linkToolId}
        open={linkToolOpen}
        anchorEl={linkToolAnchorEl}
        onChange={handleLinkToolChange}
        onClose={handleLinkToolClose}
      />
    </div>
  );
};

export default (props: HtmlEditorProps): JSX.Element => {
  const classes = useStyles();
  const [editorState, setEditorState] = React.useState(
    EditorState.createWithContent(convertFromHTML({})(props.value)),
  );

  function handleChange(e: EditorState) {
    if (e === editorState) return;
    setEditorState(e);

    props.onChange(convertToHTML({})(e.getCurrentContent()));
  }

  return (
    <Paper elevation={0} className={classes.editorRoot}>
      <Tools />
      <div className={classes.editorBody}>
        <Editor
          editorState={editorState}
          onChange={handleChange}
          onBlur={props.onBlur}
        />
      </div>
    </Paper>
  );
};
