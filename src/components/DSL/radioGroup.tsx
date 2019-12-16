import { RepositoryMap, RawRadioGroup } from "./types";
import { CRadioGroupProps, CRadioGroup } from "../RadioGroup";
import { withProps } from "../../framework/hoc";
export const makeRadioGroup = async (
  repositories: RepositoryMap,
  { title, data }: RawRadioGroup,
): Promise<React.ComponentType<CRadioGroupProps>> => {
  const props = await repositories[data.entity].getList().then(options => ({
    options: options.map(option => ({
      value: option[data.value],
      label: option[data.label],
    })),
    title,
  }));

  return withProps(CRadioGroup, props);
};
