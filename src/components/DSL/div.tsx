import React from "react";
import {
  RawFieldInputControl,
  RepositoryMap,
  RawDiv,
  RawControl,
  CustomComponent,
} from "./types";
import { changeHandler } from "../../framework/utils";
import { FieldInputProps } from "formik";
import { useGlobal } from "./context";
import _ from "lodash";

const isFieldInputControl = (ctrl: RawControl | CustomComponent) => {
  if ((ctrl as RawControl).control) {
    return (
      ["input", "select", "radioGroup", "checkbox"].indexOf(
        (ctrl as RawControl).control,
      ) !== -1
    );
  }
  return false;
};

const withBindValue = (
  { value }: RawFieldInputControl,
  component: React.ComponentType<FieldInputProps<any>>,
): React.ComponentType => {
  return () => {
    const [val, setVal] = useGlobal(value);
    return React.createElement(component, {
      value: val,
      onChange: changeHandler(setVal),
      name: "",
      onBlur: () => {},
    });
  };
};

export const makeDiv = async (
  repositories: RepositoryMap,
  { children }: RawDiv,
  makeComponent: (
    repositories: RepositoryMap,
    ctrl: RawControl | CustomComponent,
  ) => Promise<React.ComponentType<any>>,
): Promise<React.ComponentType> => {
  const list = _.isArray(children)
    ? (children as (RawControl | CustomComponent)[])
    : [children as RawControl | CustomComponent];

  const makeChild = async (child: RawControl | CustomComponent) => {
    let component = await makeComponent(repositories, child);
    if (isFieldInputControl(child)) {
      component = withBindValue(
        child as RawFieldInputControl,
        component as React.ComponentType<FieldInputProps<any>>,
      );
    }
    return component;
  };
  const childrenComponents = await Promise.all(list.map(makeChild));
  return () => <div>{childrenComponents.map(React.createElement)}</div>;
};
