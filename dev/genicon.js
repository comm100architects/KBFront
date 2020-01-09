import React from "react";
import ReactDOMServer from "react-dom/server";
import StarIcon from "@material-ui/icons/Star";
import DotIcon from "@material-ui/icons/FiberManualRecord";
import SendIcon from "@material-ui/icons/Send";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import EditIcon from "@material-ui/icons/Edit";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import ViewIcon from "@material-ui/icons/Pageview";
import AddIcon from "@material-ui/icons/Add";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import DescriptionIcon from "@material-ui/icons/Description";
import ImageIcon from "@material-ui/icons/Image";
import ViewQuiltIcon from "@material-ui/icons/ViewQuilt";
import SettingsIcon from "@material-ui/icons/Settings";
import WidgetsIcon from "@material-ui/icons/Widgets";
import DashboardIcon from "@material-ui/icons/Dashboard";
import WebAssetIcon from "@material-ui/icons/WebAsset";
import ChatIcon from "@material-ui/icons/Chat";
import AssessmentIcon from "@material-ui/icons/Assessment";
import HistoryIcon from "@material-ui/icons/History";
import GroupWorkIcon from "@material-ui/icons/GroupWork";
import CreateIcon from "@material-ui/icons/Create";
import CodeIcon from "@material-ui/icons/Code";

const stripSvgTag = svg => {
  return svg.replace(/\<svg[^>]*?\>|\<\/svg\>/gi, "");
};

const getIconContent = icon => {
  return stripSvgTag(ReactDOMServer.renderToString(React.createElement(icon)));
};

console.error(getIconContent(StarIcon));

const allIcons = {
  star: getIconContent(StarIcon),
  dot: getIconContent(DotIcon),
  send: getIconContent(SendIcon),
  inbox: getIconContent(InboxIcon),
  edit: getIconContent(EditIcon),
  delete: getIconContent(DeleteForeverIcon),
  view: getIconContent(ViewIcon),
  add: getIconContent(AddIcon),
  thumbUp: getIconContent(ThumbUpIcon),
  thumbDown: getIconContent(ThumbDownIcon),
  description: getIconContent(DescriptionIcon),
  image: getIconContent(ImageIcon),
  viewQuilt: getIconContent(ViewQuiltIcon),
  settings: getIconContent(SettingsIcon),
  widgets: getIconContent(WidgetsIcon),
  dashboard: getIconContent(DashboardIcon),
  webAsset: getIconContent(WebAssetIcon),
  chat: getIconContent(ChatIcon),
  assessment: getIconContent(AssessmentIcon),
  history: getIconContent(HistoryIcon),
  groupWork: getIconContent(GroupWorkIcon),
  create: getIconContent(CreateIcon),
  code: CodeIcon,
};

export const genIcons = () =>
  Object.entries(allIcons).map(([name, svg]) => ({ name, svg }));
