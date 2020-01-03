import { UIEntityField } from "./types";
import { CRadioGroupProps, CRadioGroup } from "../components/RadioGroup";
import { withProps } from "../framework/hoc";

export const makeRadioGroup = async (
  field: UIEntityField,
): Promise<React.ComponentType<CRadioGroupProps>> => {
  if (field.type === "reference") {
    const options = await field.referenceRepo!.getList();
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
