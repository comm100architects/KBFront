import React from "react";
import {
  GlobalSettings,
  TopMenu,
  SideMenu,
  parseRawGlobalSettings,
} from "./gen/types";
import { RawGlobalSettings } from "./gen/rawTypes";
import { fetchJson } from "./framework/network";
import { isLocalHost } from "./framework/utils";

export interface GlobalContextValue {
  selectedTopMenu: TopMenu;
  selectedSideMenu: SideMenu;
}

export const GlobalContext = React.createContext({} as GlobalContextValue);

export const getGlobalSettings = async (): Promise<GlobalSettings> => {
  const settings = await fetchJson<RawGlobalSettings>("/globalSettings", "GET");
  if (isLocalHost) {
    settings.endPointPrefix = "/api";
  }
  return parseRawGlobalSettings(settings);
};
