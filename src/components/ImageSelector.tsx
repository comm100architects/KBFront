import React, { useEffect, useState } from "react";
import { Theme, makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import IconButton from "@material-ui/core/IconButton";
import Upload, { CFile } from "./Upload";
import { ifValidFile } from "../framework/utils";
import { CIcon } from "./Icons";

export interface CImage {
  id: string;
  name: string;
  url: string;
}

interface InternalCImage extends CImage {
  isSelected: boolean;
  isUploaded: boolean;
  percent: number;
}

interface ImageSelectorProps {
  ifOpen?: boolean;
  uploadUrl: string;
  images?: CImage[];
  acceptFileExtension?: string[];
  maxSize?: number; // unit KB
  onSelected: (images: CImage[]) => void;
  onClose: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  gridList: {
    width: 500,
    height: 400,
  },
  uploadButton: {
    backgroundColor: "#329fd9",
    textTransform: "none",
  },
}));

let uploadFiles: InternalCImage[] = [];

const ImageSelector: React.ComponentType<ImageSelectorProps> = ({
  uploadUrl,
  images = [],
  acceptFileExtension = [],
  maxSize = 200,
  ...others
}) => {
  const classes = useStyles();
  // state
  const [imageList, setImageList] = useState<InternalCImage[]>([]);
  // effect
  useEffect(() => {
    uploadFiles = [];
  }, []);
  useEffect(() => {
    setImageList(
      images.map(img => ({
        ...img,
        isSelected: false,
        isUploaded: true,
        percent: 100,
      })),
    );
  }, []);
  const beforeUpload = (file: CFile) => {
    if (
      (acceptFileExtension.length > 0 &&
        !ifValidFile(file.name, acceptFileExtension)) ||
      file.size > maxSize * 1024
    ) {
      return false;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const newList = imageList.concat({
        id: file.uid,
        name: file.name,
        url: reader.result as string,
        isSelected: false,
        isUploaded: false,
        percent: 0,
      });
      newList.forEach(img => {
        if (!uploadFiles.some(item => item.id === img.id)) {
          uploadFiles.push(img);
        }
      });
      setImageList([...uploadFiles]);
    };
    reader.readAsDataURL(file);
    return true;
  };
  const onSuccess = (rsp: any, file: CFile) => {};
  const onProgress = (step: any, file: CFile) => {};
  const onError = (e: Event, rsp: any, file: CFile) => {};
  const onSelected = () => {
    others.onSelected(
      imageList.map(o => ({
        id: o.id,
        name: o.name,
        url: o.url,
      })),
    );
    others.onClose();
  };

  return (
    <Dialog
      onClose={others.onClose}
      aria-labelledby="customized-dialog-title"
      open
    >
      <DialogTitle>Images</DialogTitle>
      <DialogContent>
        <List>
          <ListItem>
            <ListItemText
              primary={`Formats supported: ${acceptFileExtension.join(",")}`}
            />
          </ListItem>
          <ListItem>
            <ListItemText primary="Max files at a time: 10" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Max size of a file: 200KB" />
          </ListItem>
        </List>
        <Upload
          multiple
          uploadUrl={uploadUrl}
          beforeUpload={beforeUpload}
          onSuccess={onSuccess}
          onProgress={onProgress}
          onError={onError}
        >
          <Button className={classes.uploadButton}>Upload Image</Button>
        </Upload>
        <GridList className={classes.gridList} cellHeight={160} cols={4}>
          {imageList.map(img => (
            <GridListTile key={img.id} cols={1}>
              <img src={img.url} alt={img.name} />
              <GridListTileBar
                titlePosition="top"
                actionIcon={<CIcon name="checkBox" />}
              />
            </GridListTile>
          ))}
        </GridList>
      </DialogContent>
      <DialogActions>
        <Button onClick={onSelected} color="primary">
          OK
        </Button>
        <Button onClick={others.onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
ImageSelector.displayName = "CImageSelector";
export default ImageSelector;
