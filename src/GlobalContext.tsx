import React from "react";
import { GlobalSettings, parseRawGlobalSettings } from "./gen/types";
import { RawGlobalSettings } from "./gen/rawTypes";
import { fetchJson } from "./framework/network";

export const GlobalContext = React.createContext({} as GlobalSettings);

export const getGlobalSettings = async () =>
  parseRawGlobalSettings(
    (await fetchJson("/globalSettings", "GET")) as RawGlobalSettings,
  );
