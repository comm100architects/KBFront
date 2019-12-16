import React from "react";
import _ from "lodash";
import {
  IRepository,
  ReadonlyLocalRepository,
  RESTfulRepository,
} from "../../framework/repository";
import CPage from "../Page";
import { fetchJson } from "../../framework/network";
import { useHistory } from "react-router";
import LoadError from "../../components/LoadError";
import { GlobalContext, GlobalQueryString, GlobalState } from "./context";
import { makeInput, RawInput } from "./input";
import {
  RepositoryMap,
  RawRadioGroup,
  RawSelect,
  RawCheckbox,
  RawControl,
  CustomComponent,
  RawDiv,
  EntityInfo,
  RawPage,
  Entity,
  RawForm,
} from "./types";
import { makeForm } from "./form";
import { makeDiv } from "./div";
import { makeRadioGroup } from "./radioGroup";
import { makeSelect } from "./select";
import { makeCheckbox } from "./checkbox";

const toRepositoryMap = (entities: EntityInfo[]): RepositoryMap => {
  const list = entities.map(info => {
    if (typeof info.source === "string") {
      return {
        name: info.name,
        repository: new RESTfulRepository(
          info.source,
          info.name,
        ) as IRepository<Entity>,
      };
    }
    if (_.isArray(info.source)) {
      return {
        name: info.name,
        repository: new ReadonlyLocalRepository(
          info.source as Entity[],
        ) as IRepository<Entity>,
      };
    }
    return {
      name: info.name,
      repository: new ReadonlyLocalRepository([
        info.source as Entity,
      ]) as IRepository<Entity>,
    };
  });

  return list.reduce((res, { name, repository }) => {
    res[name] = repository;
    return res;
  }, {} as RepositoryMap);
};

const makeComponent = (
  repositories: RepositoryMap,
  ctrl: RawControl | CustomComponent,
): Promise<React.ComponentType<any>> => {
  if (typeof ctrl === "function") {
    return (ctrl as CustomComponent)(repositories);
  }

  const control = (ctrl as RawControl).control;

  switch (control) {
    case "div":
      return makeDiv(repositories, ctrl as RawDiv, makeComponent);
    case "form":
      return makeForm(repositories, ctrl as RawForm, makeComponent);
    case "input":
      return makeInput(ctrl as RawInput);
    case "radioGroup":
      return makeRadioGroup(repositories, ctrl as RawRadioGroup);
    case "checkbox":
      return makeCheckbox(ctrl as RawCheckbox);
    case "select":
      return makeSelect(repositories, ctrl as RawSelect);
    default:
      throw new Error(`Unsupport control: ${control}`);
  }
};

const makePageComponentHelper = async (
  configUrl: string,
  injecter: (ui: RawControl) => RawControl,
): Promise<React.ComponentType> => {
  //  1. get config file
  //  2. create react component according to the config file
  //    - Get initial values from remote server in this step
  //  3. return the component, the caller decide when to render the component
  const { entities, ui, title }: RawPage = await fetchJson(configUrl, "GET");
  const repositories = toRepositoryMap(entities);
  const Body = await makeComponent(repositories, injecter(ui));
  return () => {
    const history = useHistory();
    const [state, setState] = React.useState();
    const globalVariables = {
      query: new GlobalQueryString(history),
      state: new GlobalState(state, setState),
    };
    return (
      <GlobalContext.Provider value={globalVariables}>
        <CPage title={title}>
          <Body />
        </CPage>
      </GlobalContext.Provider>
    );
  };
};

export const makePageComponent = async (
  configUrl: string,
  injecter: (ui: RawControl) => RawControl = a => a,
): Promise<React.ComponentType> => {
  try {
    return await makePageComponentHelper(configUrl, injecter);
  } catch (error) {
    // initialize error, show error message and reload button
    return () => {
      const handleReload = async () => {
        const component = await makePageComponentHelper(configUrl, injecter);
        setEle(React.createElement(component));
      };

      const [ele, setEle] = React.useState(() => (
        <LoadError error={error} onReload={handleReload} />
      ));

      return ele;
    };
  }
};
