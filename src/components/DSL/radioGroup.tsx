import { RepositoryMap, RawRadioGroup, UIRowRadioGroup } from "./types";
import { CRadioGroupProps, CRadioGroup } from "../RadioGroup";
import { withProps } from "../../framework/hoc";
export const makeRadioGroup = async (
  repositories: RepositoryMap,
  { title, data }: RawRadioGroup,
): Promise<React.ComponentType<CRadioGroupProps>> => {
  const options = await repositories[data.entity].getList();

  return withProps(CRadioGroup, {
    options: options.map(option => ({
      value: option[data.value],
      label: option[data.label],
    })),
    title,
  });
};

export const makeRadioGroup2 = async (
  repositories: RepositoryMap,
  { field, optionsEntity, optionsLabelField }: UIRowRadioGroup,
): Promise<React.ComponentType<CRadioGroupProps>> => {
  const options = await repositories[optionsEntity].getList();
  return withProps(CRadioGroup, {
    options: options.map(option => ({
      value: option.id,
      label: option[optionsLabelField || "label"],
    })),
    title: field.title,
  });
};
