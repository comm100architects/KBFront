import * as React from "react";
import { RawProduct } from "./Pages";

export interface RawGlobalContext {
  readonly currentApp: RawProduct;
}

const emptyGlobalContext: RawGlobalContext = {
  currentApp: { name: "", label: "", defaultPage: "", menu: [] },
};

export default React.createContext(emptyGlobalContext);
