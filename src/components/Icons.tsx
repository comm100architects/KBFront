import * as React from "react";
import StarIcon from "@material-ui/icons/Star";
import DotIcon from "@material-ui/icons/FiberManualRecord";
import SendIcon from "@material-ui/icons/Send";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import EditIcon from "@material-ui/icons/Edit";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import ViewIcon from "@material-ui/icons/Pageview";
import AddIcon from "@material-ui/icons/Add";
import { memoize } from "lodash";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";

const allIcons: { [id: string]: (props: any) => JSX.Element } = {
  starPrimary: () => <StarIcon color="primary" />,
  starAction: () => <StarIcon color="action" />,
  dotPrimary: () => <DotIcon color="primary" />,
  dotSecondary: () => <DotIcon color="secondary" />,
  send: SendIcon,
  inbox: InboxIcon,
  edit: EditIcon,
  delete: DeleteForeverIcon,
  view: ViewIcon,
  add: AddIcon,
  thumbUp: ThumbUpIcon,
  thumbDown: ThumbDownIcon,
};

export type CIconName =
  | "starPrimary"
  | "starAction"
  | "dotPrimary"
  | "dotSecondary"
  | "send"
  | "inbox"
  | "edit"
  | "delete"
  | "view"
  | "add"
  | "thumbUp"
  | "thumbDown";

const getIcon = memoize(
  (name: string): JSX.Element => {
    const Icon = allIcons[name];
    return <Icon />;
  },
);

export const CIcon = ({ name }: { name: CIconName }): JSX.Element => {
  return getIcon(name);
};
