import React from "react";
import { makePageComponent, findForm } from "../../../components/DSL";
import {
  CustomFormFieldComponent,
  RepositoryMap,
  RawControl,
  Entity,
} from "../../../components/DSL/types";
import { withProps } from "../../../framework/hoc";
import { CSelect } from "../../../components/Select";
import { RESTfulRepository } from "../../../framework/repository";
import { FieldInputProps, useFormikContext } from "formik";

interface CustomPage {
  id: string;
  title: string;
}

const HomeCustomPages: CustomFormFieldComponent = async (_: RepositoryMap) => {
  const repo = new RESTfulRepository<CustomPage>(
    "//localhost:3000",
    "customPages",
  );
  const customPages = await repo.getList([{ key: "status", value: "1" }]);
  const component = withProps(CSelect, {
    options: [{ label: "--Choose a Custom Page--" }].concat(
      customPages.map(({ id, title }) => ({
        value: id,
        label: title,
      })),
    ),
  }) as React.ComponentType<FieldInputProps<string>>;

  return {
    name: "homeCustomPageId",
    title: "Custom Page",
    as: (props: FieldInputProps<string>) => {
      const homePageType = useFormikContext<Entity>().values
        .homePageType as string;
      if (homePageType === "rootCategory") {
        return <></>;
      }
      return React.createElement(component, props);
    },
    required: false,
  };
};

export default makePageComponent("/dev/kbSetting.json", (ui: RawControl) => {
  const form = findForm(ui);
  if (form) {
    form.children.splice(2, 0, HomeCustomPages);
  }
  return ui;
});
