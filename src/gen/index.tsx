import React from "react";
import _ from "lodash";
import { PageProps, GlobalSettings } from "./types";
import { makeEditFormComponent, makeNewFormComponent } from "./Form";
import { makeGridComponent } from "./Grid";

export const makePageComponent = async (
  settings: GlobalSettings,
  page: PageProps,
): Promise<React.ComponentType<any>> => {
  const entity = await page.entity();
  if (page.isMultiRowsUI) {
    return await makeGridComponent(settings, entity);
  } else if (page.actionForSingleRow === "new") {
    return await makeNewFormComponent(settings, entity);
  } else if (page.actionForSingleRow === "update") {
    return await makeEditFormComponent(settings, entity);
  }

  return Promise.resolve(() => <></>);
};

