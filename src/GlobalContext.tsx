import * as React from "react";
import { RawApp } from "./Pages";

export interface RawGlobalContext {
  readonly currentApp: RawApp;
}

const emptyGlobalContext: RawGlobalContext = {
  currentApp: { name: "", label: "", defaultPage: "", menu: [] }
};

export default React.createContext(emptyGlobalContext);
