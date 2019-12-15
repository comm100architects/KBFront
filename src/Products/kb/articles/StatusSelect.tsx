import * as React from "react";
import { ArticleStatus } from "./Entity/Article";
import { CSelect, CSelectProps } from "../../../components/Select";

export const StatusSelect = (props: Partial<CSelectProps>) => {
  return (
    <CSelect
      {...props}
      id="articleStatus"
      title="Status"
      options={[
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
