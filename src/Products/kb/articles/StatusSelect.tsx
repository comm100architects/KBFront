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
          label: "All Status",
        },
        {
          value: ArticleStatus.published,
          label: "Published",
          icon: "dotPrimary",
        },
        {
          value: ArticleStatus.draft,
          label: "Draft",
          icon: "dotSecondary",
        },
      ]}
    ></CSelect>
  );
};
