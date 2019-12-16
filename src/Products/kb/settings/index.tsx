import React from "react";
import { makePageComponent, findForm } from "../../../components/DSL";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import {
  CustomFormFieldComponent,
  RepositoryMap,
  RawControl,
  Entity,
} from "../../../components/DSL/types";
import { withProps } from "../../../framework/hoc";
import { RESTfulRepository } from "../../../framework/repository";
import { CSelect } from "../../../components/Select";
import { FieldInputProps, useFormikContext } from "formik";

const useStyles = makeStyles((_: Theme) =>
  createStyles({
    root: {
      "& .kbSelect": {
        position: "absolute",
        right: 24,
        top: 24,
      },
    },
  }),
);

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
    options: customPages.map(({ id, title }) => ({
      value: id,
      label: title,
    })),
  }) as React.ComponentType<FieldInputProps<string>>;

  return {
    name: "homeCustomPageId",
    title: "",
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
