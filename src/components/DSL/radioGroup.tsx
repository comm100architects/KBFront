import { UIRow, Entity } from "./types";
import { CRadioGroupProps, CRadioGroup } from "../RadioGroup";
import { withProps } from "../../framework/hoc";
import { RESTfulRepository } from "../../framework/repository";

export const makeRadioGroup = async (
  endPointPrefix: string,
  { field }: UIRow,
): Promise<React.ComponentType<CRadioGroupProps>> => {
  if (field.type === "reference") {
    const repo = new RESTfulRepository<Entity>(
      endPointPrefix,
      field.referenceEntityName!,
    );
    const options = await repo.getList();
    return withProps(CRadioGroup, {
      options: options.map(option => ({
        value: option.id,
        label: option[field.referenceEntityFieldNameForLabel!],
      })),
      title: field.title,
    });
  }

  if (field.labelsForValue) {
    return withProps(CRadioGroup, {
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
