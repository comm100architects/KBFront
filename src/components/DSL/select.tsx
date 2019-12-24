import { RepositoryMap, UIRow } from "./types";
import { CSelectProps, CSelect } from "../Select";
import { withProps } from "../../framework/hoc";

export const makeSelect = async (
  repositories: RepositoryMap,
  { field }: UIRow,
): Promise<React.ComponentType<CSelectProps>> => {
  if (field.type === "reference") {
    const nullOption = [{ value: "", label: "\u3000" }];
    const options = await repositories[field.referenceEntityName!].getList();
    return withProps(CSelect, {
      options: nullOption.concat(
        options.map(option => ({
          value: option.id as string,
          label: option[field.referenceEntityFieldNameForLabel!],
        })),
      ),
      title: field.title,
    });
  }

  if (field.labelsForValue) {
    return withProps(CSelect, {
      options: field.labelsForValue.map(({ key, label }) => ({
        value: key,
        label,
      })),
      title: field.title,
    });
  }

  throw new Error(
    `componentType is radioGroup but field.type is ${field.type} and doesn't have labelsForValue`,
  );
};

