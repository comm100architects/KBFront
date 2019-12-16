import { CFormField } from "../Form";
import { IRepository } from "../../framework/repository";
import { CIconName } from "../Icons";

export type RepositoryMap = { [name: string]: IRepository<Entity> };

export type Entity = { id: string; [key: string]: any };

export interface EntityInfo {
  name: string;
  source: string | Entity | Entity[];
}

export type CustomComponent = (
  repositories: RepositoryMap,
) => Promise<React.ComponentType>;

export type CustomFormFieldComponent = (
  repositories: RepositoryMap,
) => Promise<CFormField<Entity>>;

export interface RawControl {
  control: "div" | "form" | "input" | "radioGroup" | "checkbox" | "select";
  className?: string;
}

export interface RawDiv extends RawControl {
  // allow inject custom component
  children: (RawControl | CustomComponent) | (RawControl | CustomComponent)[];
}

export interface RawFieldInputControl extends RawControl {
  bind: string;
}

export interface RawSelect extends RawFieldInputControl {
  title: string;
  data: { entity: string; label: string; value: string; icon: CIconName };
}

export interface RawRadioGroup extends RawFieldInputControl {
  title: string;
  data: { entity: string; label: string; value: string };
}

export interface RawCheckbox extends RawFieldInputControl {
  label: string;
  title: string;
}

export interface RawFormControl extends RawControl {
  name: string;
  title: string;
  required?: boolean;
}

export interface RawForm extends RawControl {
  children: (RawFormControl | CustomFormFieldComponent)[];
  data: { entity: string; id: string };
}

export interface RawPage {
  title: string;
  entities: EntityInfo[];
  ui: RawControl;
}
