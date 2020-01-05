import { UIEntityField } from "./types";
import { CSelect, CSelectProps } from "../components/Select";
import { withProps } from "../framework/hoc";

export const makeSelect = async (
  field: UIEntityField,
  nullOptionLabel?: string,
): Promise<React.ComponentType<any>> => {
  if (field.type === "reference") {
    const options = await field.referenceRepo!.getList();
    return withProps(CSelect, {
      options: [
        { value: "", label: nullOptionLabel || "\u3000" },
        ...options.map(option => ({
          value: option.id as string,
          label: option[field.referenceEntityFieldNameForLabel!],
        })),
      ],
    });
  }

  if (field.labelsForValue) {
    const hasIcon = !!field.labelsForValue[0].icon;
    const options = [
      ...(nullOptionLabel
        ? [
            {
              value: "",
              label: nullOptionLabel,
              icon: hasIcon ? "dummy" : undefined,
            },
          ]
        : []),
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
