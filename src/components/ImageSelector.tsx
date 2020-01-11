import React, { useEffect, useState, useMemo } from "react";
import { Map } from "immutable";
import { Theme, makeStyles, styled } from "@material-ui/core/styles";
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
    marginTop: "20px !important",
  },
  summary: {
    margin: "10px 0px",
    padding: 0,
    listStyle: "none",
  },
  status: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    overflow: "hidden",
    color: "#329fd9",
  },
}));

const CActions = styled(DialogActions)({
  justifyContent: "center",
});
const NormalButton = styled(Button)({
  backgroundColor: "#329fd9",
  color: "#fff",
  textTransform: "none",
});
const CancelButton = styled(Button)({
  backgroundColor: "#fafafa",
  textTransform: "none",
});

let uploadFiles: Map<string, InternalCImage> = Map<string, InternalCImage>({});

const ImageSelector: React.ComponentType<ImageSelectorProps> = ({
  uploadUrl,
  images = [],
  acceptFileExtension = [],
  maxSize = 200,
  ...others
}) => {
  const classes = useStyles();
  // state
  const [imageList, setImageList] = useState<Map<string, InternalCImage>>(
    Map<string, InternalCImage>({}),
  );
  // effect
  useEffect(() => {
    uploadFiles = uploadFiles.clear();
  }, []);
  useEffect(() => {
    setImageList(
      images.reduce(
        (map, img) =>
          map.set(img.id, {
            ...img,
            isSelected: false,
            isUploaded: true,
            percent: 100,
          }),
        Map<string, InternalCImage>(),
      ),
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
      if (!uploadFiles.has(file.uid)) {
        uploadFiles = uploadFiles.set(file.uid, {
          id: file.uid,
          name: file.name,
          url: reader.result as string,
          isSelected: true,
          isUploaded: false,
          percent: 0,
        });
        setImageList(uploadFiles);
      }
    };
    reader.readAsDataURL(file);
    return true;
  };
  const onSuccess = (rsp: any, file: CFile) => {};
  const onProgress = (step: any, file: CFile) => {};
  const onError = (e: Event, rsp: any, file: CFile) => {};
  const onSelected = () => {
    others.onSelected(
      imageList
        .filter(img => !!img?.isSelected)
        .toArray()
        .map(o => ({
          id: o.id,
          name: o.name,
          url: o.url,
        })),
    );
    others.onClose();
  };
  const onClickTile = (id: string | undefined) => {
    const img = imageList.get(id as string);
    if (!img) return;
    setImageList(
      imageList.set(
        img.id,
        Object.assign({}, img, {
          isSelected: !img.isSelected,
        }),
      ),
    );
  };

  return (
    <Dialog
      onClose={others.onClose}
      aria-labelledby="customized-dialog-title"
      open
    >
      <DialogTitle>Images</DialogTitle>
      <DialogContent>
        <ul className={classes.summary}>
          <li>{`Formats supported: ${acceptFileExtension.join(",")}`}</li>
          <li>Max files at a time: 10</li>
          <li>{`Max size of a file: ${maxSize}KB`}</li>
        </ul>
        <Upload
          multiple
          uploadUrl={uploadUrl}
          beforeUpload={beforeUpload}
          onSuccess={onSuccess}
          onProgress={onProgress}
          onError={onError}
        >
          <NormalButton>Upload Image</NormalButton>
        </Upload>
        <GridList className={classes.gridList} cellHeight={160} cols={4}>
          {imageList.map(img => {
            return (
              <GridListTile
                onClick={() => {
                  onClickTile(img?.id);
                }}
                key={img?.id}
                cols={1}
              >
                <img src={img?.url} alt={img?.name} />
                {img?.isSelected && (
                  <div className={classes.status}>
                    <CIcon name="checkBox" />
                  </div>
                )}
              </GridListTile>
            );
          })}
        </GridList>
      </DialogContent>
      <CActions>
        <NormalButton onClick={onSelected} color="primary">
          OK
        </NormalButton>
        <CancelButton onClick={others.onClose}>Cancel</CancelButton>
      </CActions>
    </Dialog>
  );
};
ImageSelector.displayName = "CImageSelector";
export default ImageSelector;
