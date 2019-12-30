import * as React from "react";
import { RawProduct } from "./Pages";

export interface RawGlobalContext {
  readonly currentProduct: RawProduct;
}

const emptyGlobalContext: RawGlobalContext = {
  currentProduct: { name: "", label: "", defaultPage: "", menu: [] },
};

export default React.createContext(emptyGlobalContext);
