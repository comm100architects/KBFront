import { EntityField } from "./types";
import { CRadioGroupProps, CRadioGroup } from "../components/RadioGroup";
import { withProps } from "../framework/hoc";

export const makeRadioGroup = async (
  field: EntityField,
): Promise<React.ComponentType<CRadioGroupProps>> => {
  if (field.type === "reference") {
    const entity = await field.referenceEntity!();
    const options = await entity.repo.getList();
    return withProps(CRadioGroup, {
      options: options.map(option => ({
        value: option.id,
        label: option[entity.fieldToBeDisplayedWhenReferenced],
      })),
      title: field.label,
    });
  }

  if (field.labelsForValue) {
    return withProps(CRadioGroup, {
      options: field.labelsForValue.map(({ key, label }) => ({
        value: key,
        label,
      })),
      title: field.label,
    });
  }

  throw new Error(
    `componentType is radioGroup but field.type is ${field.type} and doesn't have labelsForValue`,
  );
};
