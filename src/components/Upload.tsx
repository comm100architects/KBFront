import React, { forwardRef } from "react";

const Upload = require("rc-upload");

interface HeaderType {
  [key: string]: string;
}

export interface CFile extends File {
  uid: string;
}

interface CUploadProps {
  disabled?: boolean;
  headers?: HeaderType;
  multiple?: boolean;
  uploadUrl: string;
  onStart?: (files: CFile | Array<CFile>) => void;
  beforeUpload: (file: CFile) => boolean | Promise<void>;
  onSuccess: (rsp: any, file: CFile) => void;
  onProgress: (step: any, file: CFile) => void;
  onError: (e: Event, rsp: any, file: CFile) => void;
  children: any;
}

const CUpload: React.ComponentType<CUploadProps> = forwardRef(
  (
    {
      uploadUrl,
      disabled = false,
      headers = {},
      multiple = false,
      children,
      ...others
    },
    ref,
  ) => (
    <Upload.default
      disabled={disabled}
      headers={headers}
      multiple={multiple}
      action={uploadUrl}
      {...others}
    >
      {children}
    </Upload.default>
  ),
);

CUpload.displayName = "CUpload";
export default CUpload;
