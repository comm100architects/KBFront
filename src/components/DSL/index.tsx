import React from "react";
import _ from "lodash";
import CPage from "../Page";
import { fetchJson } from "../../framework/network";
import { useHistory } from "react-router";
import { GlobalContext, GlobalQueryString, GlobalState } from "./context";
import { normalizeRawUIPage, RawUIPage, UIPage } from "./types";
import { makeFormComponent } from "./form";
import { makeGridComponent } from "./grid";

const makePageBody = async (
  page: UIPage,
): Promise<React.ComponentType<any>> => {
  if (page.rows) {
    const body = await makeFormComponent(page);
    return body;
  }

  if (page.grid) {
    return await makeGridComponent(page);
  }

  return Promise.resolve(() => <></>);
};

export const makePageComponent = async (
  configUrl: string,
): Promise<React.ComponentType<any>> => {
  const page = normalizeRawUIPage(
    (await fetchJson(configUrl, "GET")) as RawUIPage,
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
