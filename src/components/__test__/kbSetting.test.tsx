import React from "react";
import moxios from "moxios";
import {
  normalizeRawUIPage,
  RawUIPage,
  GlobalSettings,
  UIEntity,
} from "../DSL/types";
import { makePageComponent } from "../DSL";
import { mount } from "enzyme";
import { MemoryRouter as Router } from "react-router";
import { act } from "react-dom/test-utils";

const flushPromises = () => act(() => new Promise(setImmediate));

const globalSettings: GlobalSettings = {
  endPointPrefix: "//localhost:3000",
  dateTimeFormat: "MM/dd/yyyy HH:mm:ss",
  menu: [],
};
const entities: UIEntity[] = [
  {
    name: "knowledgeBases",
    fields: [
      { name: "id", type: "guid" },
      {
        name: "name",
        type: "string",
        minLength: 0,
        maxLength: 64,
        isRequired: true,
        title: "Name",
      },
      {
        name: "homePageType",
        type: "enum",
        labelsForValue: [
          { key: 0, label: "Display the root category" },
          { key: 1, label: "Display a custom page" },
        ],
        isRequired: true,
        title: "Home",
      },
      {
        name: "homeCustomPageId",
        type: "reference",
        referenceEntityName: "customPages",
        referenceEntityFieldNameForLabel: "title",
        isRequired: true,
        title: "",
      },
      {
        name: "visibility",
        type: "enum",
        labelsForValue: [
          { key: 0, label: "Public" },
          { key: 1, label: "Private" },
        ],
        isRequired: true,
        title: "Visibility",
      },
      {
        name: "allowFeedback",
        type: "bool",
        labelsForValue: [
          {
            key: true,
            label: "Allow visitors to rate Helpful or Not Helpful on articles",
          },
          {
            key: false,
            label:
              "Do not allow visitors to rate Helpful or Not Helpful on articles",
          },
        ],
        isRequired: false,
        title: "Feedback",
      },
      {
        name: "status",
        type: "bool",
        labelsForValue: [
          { key: 0, label: "Close" },
          { key: 1, label: "Open" },
        ],
        isRequired: true,
        title: "Status",
      },
    ],
  },
  {
    fields: [
      {
        name: "id",
        type: "guid",
      },
      {
        name: "title",
        type: "string",
        minLength: 0,
        maxLength: 1024,
        isRequired: true,
      },
    ],
    name: "customPages",
  },
];
const rawUIPage: RawUIPage = {
  title: "Settings",
  entity: entities[0],
  parentEntities: [],
  rows: [
    {
      fieldName: "name",
      componentType: "input",
    },
    {
      fieldName: "homePageType",
      componentType: "radioGroup",
    },
    {
      fieldName: "homeCustomPageId",
      componentType: "select",
      indent: 1,
      conditionsToHide: ["homePageType==0"],
    },
    {
      fieldName: "visibility",
      componentType: "radioGroup",
    },
    {
      fieldName: "allowFeedback",
      componentType: "checkbox",
    },
    {
      fieldName: "status",
      componentType: "radioGroup",
    },
  ],
};
describe("convert RawUIPage to UIPage", () => {
  it("should set title", async () => {
    const page = normalizeRawUIPage(globalSettings, rawUIPage);
    expect(page.title).toBe(rawUIPage.title);
  });
  it("should set entity", async () => {
    const page = normalizeRawUIPage(globalSettings, rawUIPage);
    expect(page.entity).toBe(rawUIPage.entity);
  });
  it("should set rows", async () => {
    const page = normalizeRawUIPage(globalSettings, rawUIPage);
    expect(page.rows).toEqual([
      {
        indent: 0,
        field: {
          name: "name",
          type: "string",
          minLength: 0,
          maxLength: 64,
          isRequired: true,
          title: "Name",
        },
        componentType: "input",
      },
      {
        indent: 0,
        field: {
          name: "homePageType",
          type: "enum",
          labelsForValue: [
            { key: 0, label: "Display the root category" },
            { key: 1, label: "Display a custom page" },
          ],
          isRequired: true,
          title: "Home",
        },
        componentType: "radioGroup",
      },
      {
        conditionsToHide: ["homePageType==0"],
        indent: 1,
        field: {
          name: "homeCustomPageId",
          type: "reference",
          referenceEntityName: "customPages",
          referenceEntityFieldNameForLabel: "title",
          isRequired: true,
          title: "",
        },
        componentType: "select",
      },
      {
        indent: 0,
        field: {
          name: "visibility",
          type: "enum",
          labelsForValue: [
            { key: 0, label: "Public" },
            { key: 1, label: "Private" },
          ],
          isRequired: true,
          title: "Visibility",
        },
        componentType: "radioGroup",
      },
      {
        indent: 0,
        field: {
          name: "allowFeedback",
          type: "bool",
          labelsForValue: [
            {
              key: true,
              label:
                "Allow visitors to rate Helpful or Not Helpful on articles",
            },
            {
              key: false,
              label:
                "Do not allow visitors to rate Helpful or Not Helpful on articles",
            },
          ],
          isRequired: false,
          title: "Feedback",
        },
        componentType: "checkbox",
      },
      {
        indent: 0,
        field: {
          name: "status",
          type: "bool",
          labelsForValue: [
            { key: 0, label: "Close" },
            { key: 1, label: "Open" },
          ],
          isRequired: true,
          title: "Status",
        },
        componentType: "radioGroup",
      },
    ]);
  });
});

describe("render UIPage", () => {
  const configUrl = "/kbSettings.json";
  beforeEach(() => {
    moxios.install();
    mockRequests(globalSettings.endPointPrefix);
    document.body.innerHTML = "";
  });
  afterEach(() => moxios.uninstall());

  const mockRequests = (endPointPrefix: string) => {
    moxios.stubRequest(endPointPrefix + "/knowledgeBases", {
      response: [
        {
          id: "d8b2a806-6b14-59bb-8220-eee3a96ba292",
          name: "bireniw uzealu eni",
          allowFeedback: true,
          visibility: 1,
          status: 0,
          homePageType: 1,
          homeCustomPageId: "61e1e91a-7a25-5342-88a0-47fb9735c458",
        },
        {
          id: "a8b2a806-6b14-59bb-8220-eee3a96ba292",
          name: "bireniw uzealu eni",
          allowFeedback: true,
          visibility: 0,
          status: 0,
          homePageType: 0,
        },
      ],
    });
    moxios.stubRequest(endPointPrefix + "/customPages", {
      response: [
        {
          id: "61e1e91a-7a25-5342-88a0-47fb9735c458",
          title: "custom page1",
          modified: "2093-12-27T09:15:04.882Z",
          status: 1,
        },
        {
          id: "7e76e2e8-cd2b-5bdb-8535-cef09ff4717a",
          title: "custom page2",
          modified: "2079-05-02T10:29:13.180Z",
          status: 1,
        },
        {
          id: "e8e2fbbc-1083-59fb-bac1-01d174a7c2d8",
          title: "custom page 3",
          modified: "2054-10-15T08:22:54.280Z",
          status: 1,
        },
      ],
    });
  };

  const mountPage = async (settings: GlobalSettings, page: RawUIPage) => {
    document.body.innerHTML = "";

    moxios.stubRequest(configUrl, { response: page });

    const Page = await makePageComponent(settings, configUrl);
    const wrapper = mount(
      <Router>
        <Page />
      </Router>,
    );
    await flushPromises();
    wrapper.update();
    return wrapper;
  };

  it("should render UIPage.title", async () => {
    const title = "Test title";
    const wrapper = await mountPage(globalSettings, {
      ...rawUIPage,
      title,
      rows: [],
    });
    expect(wrapper.find('h4[data-test-id="page-title"]').text()).toEqual(title);
  });

  it("should render kb name input in form", async () => {
    const wrapper = await mountPage(globalSettings, {
      ...rawUIPage,
      rows: [
        {
          indent: 0,
          fieldName: "name",
          componentType: "input",
        },
      ],
    });

    expect(wrapper.find('div[data-test-id="input-label"]').text()).toEqual(
      "Name *",
    );
    expect(wrapper.find("form").length).toEqual(1);
    expect(wrapper.find('CInput[data-test-id="form-field-0"]').length).toEqual(
      1,
    );
  });
  it("should render kb home radio group", async () => {
    const wrapper = await mountPage(globalSettings, {
      ...rawUIPage,
      rows: [
        {
          indent: 0,
          fieldName: "homePageType",
          componentType: "radioGroup",
        },
      ],
    });
    expect(
      wrapper.find('[data-test-id="form-radio-group-item-1"]').length,
    ).toBeGreaterThan(0);
    const radios = wrapper.find('input[type="radio"]');
    expect(radios.find({ value: 0 }).length).toEqual(1);
    expect(radios.find({ value: 1 }).length).toEqual(1);
  });
  it("should render customPage select", async () => {
    const wrapper = await mountPage(globalSettings, {
      ...rawUIPage,
      rows: [
        {
          indent: 1,
          fieldName: "homeCustomPageId",
          componentType: "select",
        },
      ],
    });
    const select = wrapper.find("CSelect");
    expect(select.props().value).toEqual(
      "61e1e91a-7a25-5342-88a0-47fb9735c458",
    );
  });
  it("should display control base on conditionsToHide", async () => {
    moxios.stubRequest("http://1.1.1.1/knowledgeBases", {
      response: [
        {
          id: "d8b2a806-6b14-59bb-8220-eee3a96ba292",
          name: "bireniw uzealu eni",
          allowFeedback: true,
          visibility: 1,
          status: 0,
          homePageType: 0,
          homeCustomPageId: "61e1e91a-7a25-5342-88a0-47fb9735c458",
        },
      ],
    });

    const wrapper = await mountPage(
      { ...globalSettings, endPointPrefix: "http://1.1.1.1" },
      {
        ...rawUIPage,
        rows: [
          {
            fieldName: "status",
            componentType: "select",
            conditionsToHide: ["homePageType==1"],
          },
        ],
      },
    );
    await flushPromises();
    expect(wrapper.find("CSelect").length).toEqual(1);
  });

  it("should hide control base on conditionsToHide", async () => {
    moxios.stubRequest("http://1.1.1.1/knowledgeBases", {
      response: [
        {
          id: "d8b2a806-6b14-59bb-8220-eee3a96ba292",
          name: "bireniw uzealu eni",
          allowFeedback: true,
          visibility: 1,
          status: 0,
          homePageType: 0,
          homeCustomPageId: "61e1e91a-7a25-5342-88a0-47fb9735c458",
        },
      ],
    });
    const wrapper = await mountPage(
      { ...globalSettings, endPointPrefix: "http://1.1.1.1" },
      {
        ...rawUIPage,
        rows: [
          {
            fieldName: "status",
            componentType: "select",
            conditionsToHide: ["homePageType==0"],
          },
        ],
      },
    );
    expect(wrapper.find("CSelect").length).toEqual(0);
  });
});
