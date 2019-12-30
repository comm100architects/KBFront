import React from "react";
import _ from "lodash";
import CPage from "../Page";
import { fetchJson } from "../../framework/network";
import { useHistory } from "react-router";
import { GlobalContext, GlobalQueryString, GlobalState } from "./context";
import { normalizeRawUIPage, UIPage, GlobalSettings } from "./types";
import { makeEditFormComponent, makeNewFormComponent } from "./form";
import { makeGridComponent } from "./grid";

const makePageBody = async (
  page: UIPage,
): Promise<React.ComponentType<any>> => {
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
  const Body = await makePageBody(page);
  Body.displayName = "PageBody";
  return () => {
    const history = useHistory();
    const [state, setState] = React.useState();
    const globalVariables = {
      query: new GlobalQueryString(history),
      state: new GlobalState(state, setState),
    };
    return (
      <GlobalContext.Provider value={globalVariables}>
        <CPage title={page.title} description={page.description}>
          <Body />
        </CPage>
      </GlobalContext.Provider>
    );
  };
};
