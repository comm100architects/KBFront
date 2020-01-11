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

const allIcons = {
  star: StarIcon,
  dot: DotIcon,
  send: SendIcon,
  inbox: InboxIcon,
  edit: EditIcon,
  delete: DeleteForeverIcon,
  view: ViewIcon,
  add: AddIcon,
  thumbUp: ThumbUpIcon,
  thumbDown: ThumbDownIcon,
  description: DescriptionIcon,
  image: ImageIcon,
  viewQuilt: ViewQuiltIcon,
  settings: SettingsIcon,
  widgets: WidgetsIcon,
  dashboard: DashboardIcon,
  webAsset: WebAssetIcon,
  chat: ChatIcon,
  assessment: AssessmentIcon,
  history: HistoryIcon,
  groupWork: GroupWorkIcon,
  create: CreateIcon,
  code: CodeIcon,
};

const stripSvgTag = svg => {
  return svg.replace(/\<svg[^>]*?\>|\<\/svg\>/gi, "");
};

const getIconContent = icon => {
  return stripSvgTag(ReactDOMServer.renderToString(React.createElement(icon)));
};

export const genIcons = () =>
  Object.entries(allIcons).map(([name, icon]) => ({
    name,
    svg: getIconContent(icon),
  }));
