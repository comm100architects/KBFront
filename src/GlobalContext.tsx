import React from "react";
import { RawProduct } from "./Pages";
import { GlobalSettings } from "./DSL/types";

export interface GlobalContextValue {
  readonly product: RawProduct;
  readonly settings: GlobalSettings;
}

export const GlobalContext = React.createContext(
  null as GlobalContextValue | null,
);
