import React from "react";
import { RawProduct } from "./gen/types";
import { GlobalSettings } from "./gen/types";

export interface GlobalContextValue {
  readonly product: RawProduct;
  readonly settings: GlobalSettings;
}

export const GlobalContext = React.createContext(
  null as GlobalContextValue | null,
);
