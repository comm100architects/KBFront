import * as React from "react";
import createSvgIcon from "@material-ui/icons/utils/createSvgIcon";
import StarIcon from "@material-ui/icons/Star";
import DotIcon from "@material-ui/icons/FiberManualRecord";
import CodeIcon from "@material-ui/icons/Code";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";
import { withProps } from "../framework/hoc";
import { SvgIconProps } from "@material-ui/core/SvgIcon";
import { fetchJson } from "../framework/network";

const allIcons: { [id: string]: (props: SvgIconProps) => JSX.Element } = {};

interface IconSvg {
  name: string;
  svg: string;
}

export const fetchAndCacheIcons = async (url: string) => {
  const icons = await fetchJson<IconSvg[]>(url, "GET");
  icons.reduce((res, { name, svg }) => {
    res[name] = createSvgIcon(
      <g dangerouslySetInnerHTML={{ __html: svg }}></g>,
      name,
    );
    return res;
  }, allIcons);

  allIcons["blank"] = createSvgIcon(<g></g>, "blank");
  allIcons["starPrimary"] = withProps(allIcons["star"], { color: "primary" });
  allIcons["starAction"] = withProps(allIcons["star"], { color: "action" });
  allIcons["dotPrimary"] = withProps(allIcons["dot"], { color: "primary" });
  allIcons["dotSecondary"] = withProps(allIcons["dot"], { color: "secondary" });

  return allIcons;
};

export type CIconName = string;

export interface CIconProps {
  name: CIconName;
  onClick?: () => void;
}

export const CIcon = React.forwardRef(
  (props: CIconProps, ref: React.Ref<HTMLOrSVGElement>): JSX.Element => {
    const Icon = allIcons[props.name];
    if (!Icon) {
      throw new Error(`Icon "${name}" does not exist.`);
    }

    return <Icon {...props} innerRef={ref} fontSize="small" />;
  },
);
