import { RepositoryMap, RawSelect, UIRowSelect } from "./types";
import { CSelectProps, CSelect } from "../Select";
import { withProps } from "../../framework/hoc";

export const makeSelect = async (
  repositories: RepositoryMap,
  { title, data, className }: RawSelect,
): Promise<React.ComponentType<CSelectProps>> => {
  const props = await repositories[data.entity].getList().then(options => ({
    options: options.map(option => ({
      value: option[data.value],
      label: option[data.label],
      icon: option[data.icon],
    })),
    title,
    className,
  }));
  return withProps(CSelect, props);
};

export const makeSelect2 = async (
  repositories: RepositoryMap,
  { field, nullOptionLabel, optionsEntity, optionsLabelField }: UIRowSelect,
): Promise<React.ComponentType<CSelectProps>> => {
  const nullOption = nullOptionLabel
    ? [{ value: "", label: nullOptionLabel }]
    : [];
  const options = await repositories[optionsEntity].getList();
  return withProps(CSelect, {
    options: nullOption.concat(
      options.map(option => ({
        value: option.id as string,
        label: option[optionsLabelField || "label"],
      })),
    ),
    title: field.title,
  });
};
