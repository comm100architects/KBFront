import { EntityField } from "./types";
import { CSelect } from "../components/Select";
import { withProps } from "../framework/hoc";

export const makeSelect = async (
  field: EntityField,
  nullOptionLabel?: string,
): Promise<React.ComponentType<any>> => {
  if (field.type === "reference") {
    const entity = await field.referenceEntity!();
    const options = await entity.repo.getList();
    return withProps(CSelect, {
      options: [
        { value: "", label: nullOptionLabel || "\u3000" },
        ...options.map(option => ({
          value: option.id as string,
          label: option[entity.fieldToBeDisplayedWhenReferenced],
        })),
      ],
    });
  }

  if (field.labelsForValue) {
    const options = [
      ...(nullOptionLabel ? [{ value: "", label: nullOptionLabel }] : []),
      ...field.labelsForValue.map(({ key, label, icon }) => ({
        value: key,
        label,
        icon,
      })),
    ];
    return withProps(CSelect, { options: options });
  }

  throw new Error(
    `componentType is radioGroup but field.type is ${field.type} and doesn't have labelsForValue`,
  );
};
