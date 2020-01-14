import React, { useState } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ImageIcon from "@material-ui/icons/Image";
import ImageSelector, { CImage } from "./ImageSelector";
import DescriptionIcon from "@material-ui/icons/Description";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "block",
    height: "30px",
    borderBottom: "1px solid #ccc",
    backgroundColor: "#fafafa",
    "& li": {
      display: "block",
      float: "left",
      width: "auto",
      padding: "0px",
      marginLeft: "10px",
      marginTop: "5px",
      "& svg": {
        cursor: "pointer",
      },
    },
  },
}));

export interface CCodeEditorToolBarProps {
  onAddImages: (images: CImage[]) => void;
  onAddArticles: (articles: any) => void;
  onAddCategorys: (categories: any) => void;
}

const CCodeEditorToolBar: React.ComponentType<CCodeEditorToolBarProps> = (
  props: CCodeEditorToolBarProps,
) => {
  const classes = useStyles();
  const [ifOpen, setIfOpen] = useState(false);

  const closeHandle = () => {
    setIfOpen(false);
  };

  return (
    <>
      <List disablePadding className={classes.root}>
        <ListItem>
          <ImageIcon
            onClick={() => {
              setIfOpen(true);
            }}
            fontSize="small"
          />
        </ListItem>
        <ListItem>
          <DescriptionIcon fontSize="small" />
        </ListItem>
        <ListItem>
          <FolderOpenIcon fontSize="small" />
        </ListItem>
      </List>
      {ifOpen && (
        <ImageSelector
          uploadUrl="http://www.baidu.com"
          onSelected={props.onAddImages}
          onClose={closeHandle}
        />
      )}
    </>
  );
};
export default CCodeEditorToolBar;
