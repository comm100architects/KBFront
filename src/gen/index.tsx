import React from "react";
import _ from "lodash";
import { fetchJson } from "../framework/network";
import { normalizeRawUIPage, UIPage, GlobalSettings } from "./types";
import { makeEditFormComponent, makeNewFormComponent } from "./form";
import { makeGridComponent } from "./grid";

const makePage = async (page: UIPage): Promise<React.ComponentType<any>> => {
  if (page.type === "singular") {
    return await makeEditFormComponent(page);
  } else if (page.type === "singularNew") {
    return await makeNewFormComponent(page);
  } else if (page.type === "list") {
    return await makeGridComponent(page);
  }

  return Promise.resolve(() => <></>);
};

export const makePageComponent = async (
  settings: GlobalSettings,
  configUrl: string,
  relatviePath: string = "",
): Promise<React.ComponentType<any>> => {
  const page = normalizeRawUIPage(
    settings,
    await fetchJson(configUrl, "GET"),
    relatviePath,
  );
  return await makePage(page);
};
