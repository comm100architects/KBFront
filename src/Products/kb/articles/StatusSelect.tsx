import * as React from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { ArticleStatus } from "./Entity/Article";
import { CSelect } from "../../../components/Select";
import FormControl from "@material-ui/core/FormControl";

const useStyles = makeStyles((_: Theme) =>
  createStyles({
    statusSelect: {
      width: 150,
      minWidth: 150,
    },
  }),
);

export const StatusSelect = ({
  value,
  onChange,
}: {
  value?: ArticleStatus;
  onChange: (status: ArticleStatus) => void;
}) => {
  const classes = useStyles();
  return (
    <CSelect
      id="article-status"
      label="Status"
      value={value}
      onChange={onChange}
      items={[
        {
          text: "All Status",
        },
        {
          value: ArticleStatus.published,
          text: "Published",
          icon: "dotPrimary",
        },
        {
          value: ArticleStatus.draft,
          text: "Draft",
          icon: "dotSecondary",
        },
      ]}
    ></CSelect>
  );
};
