import React, { useState, useEffect } from "react";

interface ImageProps {
  src: string | File;
  alt: string;
}

const CImage = (props: ImageProps) => {
  const [src, setSRC] = useState("");
  useEffect(() => {
    if (props.src instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        setSRC(reader.result as string);
      };
      reader.readAsDataURL(props.src);
    }
  }, [props.src]);
  return <img src={src} alt={props.alt} />;
};
CImage.displayName = "CImage";
export default CImage;
