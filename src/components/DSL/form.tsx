import React from "react";
import {
  Entity,
  RepositoryMap,
  RawForm,
  RawFormControl,
  RawControl,
  CustomFormFieldComponent,
  CustomComponent,
} from "./types";
import { useGlobal } from "./context";
import _ from "lodash";
import { CForm } from "../Form";

export const makeForm = async (
  repositories: RepositoryMap,
  { data, children }: RawForm,
  makeComponent: (
    repositories: RepositoryMap,
    ctrl: RawControl | CustomComponent,
  ) => Promise<React.ComponentType<any>>,
): Promise<React.ComponentType> => {
  const repo = repositories[data.entity];
  const fields = await Promise.all(
    children.map(async child => {
      const c = child as RawFormControl;
      if (c.control) {
        if (c.control === "form") {
          throw new Error("Nested form not allowed");
        }
        return {
          title: c.title,
          required: c.required,
          as: await makeComponent(repositories, c),
          name: c.name,
        };
      }
      return await (child as CustomFormFieldComponent)(repositories);
    }),
  );

  return () => {
    const handleSave = async (values: Entity) => {
      setValues(await repo.update(values.id, values));
      return;
    };

    const [values, setValues] = React.useState(null as Entity | null);

    const [kbId] = useGlobal(data.id);

    React.useEffect(() => {
      repo.get(kbId).then(setValues);
    }, [kbId]);

    return (
      <>
        {values && (
          <CForm initialValues={values!} fields={fields} onSave={handleSave} />
        )}
      </>
    );
  };
};
