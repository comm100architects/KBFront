import React, { useEffect, useState } from "react";
import _ from "lodash/fp";
import { Theme, makeStyles, styled } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import CheckBoxOutlinedIcon from "@material-ui/icons/CheckBoxOutlined";
import Upload, { CFile } from "./Upload";
import { ifValidFile } from "../framework/utils";
import Image from "./Image";

export interface CImage {
  id: string;
  name: string;
  fileKey?: string;
}

interface InternalCImage extends CImage {
  file?: CFile;
  isSelected: boolean;
  percent: number;
}

interface ImageSelectorProps {
  ifOpen?: boolean;
  uploadUrl: string;
  images?: CImage[];
  acceptFileExtension?: string[];
  maxSize?: number; // unit KB
  token?: string;
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

const ImageSelector: React.ComponentType<ImageSelectorProps> = ({
  uploadUrl,
  images = [],
  acceptFileExtension = [],
  maxSize = 200,
  token,
  ...others
}) => {
  const classes = useStyles();
  // state
  const [imageList, setImageList] = useState<InternalCImage[]>([]);
  // effect
  useEffect(() => {
    setImageList(
      images.map(img => ({
        ...img,
        isSelected: false,
        percent: 100,
      })),
    );
  }, []);
  const beforeUpload = (file: CFile, files: CFile[]) => {
    if (files.indexOf(file) >= 10) {
      return false;
    }
    if (
      (acceptFileExtension.length > 0 &&
        !ifValidFile(file.name, acceptFileExtension)) ||
      file.size > maxSize * 1024
    ) {
      return false;
    }
    if (files.indexOf(file) === 0) {
      const uploadFiles = files.slice(0, 10).map(item => ({
        id: item.uid,
        name: item.name,
        isSelected: true,
        file: item,
        percent: 0,
      }));
      setImageList([...imageList, ...uploadFiles]);
    }
    return true;
  };
  const onSuccess = (rsp: any, file: CFile) => {};
  const onProgress = (step: any, file: CFile) => {};
  const onError = (e: Event, rsp: any, file: CFile) => {};
  const onSelected = () => {
    others.onSelected(
      imageList
        .filter(img => !!img?.isSelected)
        .map(o => ({
          id: o.id,
          name: o.name,
          fileKey: o.fileKey,
        })),
    );
    others.onClose();
  };
  const onClickTile = (id: string) => {
    const img = imageList.find(item => item.id === id);
    setImageList([
      ...imageList.filter(item => item.id !== id),
      Object.assign({}, img, {
        isSelected: !img!.isSelected,
      }),
    ]);
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
          token={token}
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
                  onClickTile(img!.id);
                }}
                key={img?.id}
                cols={1}
              >
                <Image src={img?.file!} alt={img?.name} />
                {img?.isSelected && (
                  <div className={classes.status}>
                    <CheckBoxOutlinedIcon fontSize="small" />
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
