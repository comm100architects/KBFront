import React from "react";
import { EntityField } from "./types";
import { CCheckbox } from "../components/Checkbox";

export const makeCheckbox = async (
  field: EntityField,
): Promise<React.ComponentType<any>> => {
  return props => {
    return (
      <CCheckbox
        {...props}
        label={field.labelsForValue!.find(({ key }) => key)!.label}
      />
    );
  };
};
