import React from "react";
import { CSearchBox } from "../components/SearchBox";
import { withProps } from "../framework/hoc";

export const makeKeywordSearch = async (): Promise<React.ComponentType<
  any
>> => {
  return withProps(CSearchBox, { label: "Keyword" });
};
