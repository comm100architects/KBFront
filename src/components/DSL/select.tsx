import { RepositoryMap, RawSelect } from "./types";
import { CSelectProps, CSelect } from "../Select";
import { withProps } from "../../framework/hoc";

export const makeSelect = async (
  repositories: RepositoryMap,
  { title, data }: RawSelect,
): Promise<React.ComponentType<CSelectProps>> => {
  const props = await repositories[data.entity].getList().then(options => ({
    options: options.map(option => ({
      value: option[data.value],
      label: option[data.label],
      icon: option[data.icon],
    })),
    title,
  }));
  return withProps(CSelect, props);
};
