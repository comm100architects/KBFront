import React from "react";
import moxios from "moxios";
import { normalizeRawUIPage, RawUIPage } from "../DSL/types";
import { makePageComponent2 } from "../DSL";
import { shallow, mount, render } from "enzyme";
import { MemoryRouter as Router } from "react-router";
import { Formik } from "formik";

const rawUIPage: RawUIPage = {
  title: "hello",
  entities: [
    {
      name: "KnowledgeBase",
      type: "object",
      data: "http://localhost:3000/knowledgeBases",
      fields: [
        { name: "id", type: { name: "guid" } },
        {
          name: "name",
          type: { name: "string", minLength: 0, maxLength: 64 },
          isRequired: true,
          title: "Name",
        },
        {
          name: "homePageType",
          type: {
            name: "reference",
            entityName: "KbHomePageType",
          },
          isRequired: true,
          title: "Home",
        },
        {
          name: "homeCustomPageId",
          type: {
            name: "reference",
            entityName: "KbCustomPage",
            labelFieldName: "title",
          },
          isRequired: true,
          title: "",
        },
        {
          name: "visibility",
          type: { name: "reference", entityName: "KbVisibility" },
          isRequired: true,
          title: "Visibility",
        },
        {
          name: "allowFeedback",
          type: { name: "bool" },
          isRequired: false,
          title: "Feedback",
        },
        {
          name: "status",
          type: { name: "reference", entityName: "KbStatus" },
          isRequired: true,
          title: "Status",
        },
      ],
    },
    {
      name: "KbHomePageType",
      type: "enum",
      data: [
        { id: "rootCategory", label: "Display the root category" },
        { id: "cutomPage", label: "Display a custom page" },
      ],
    },
    {
      name: "KbVisibility",
      type: "enum",
      data: [
        { id: "public", label: "Public" },
        { id: "private", label: "Private" },
      ],
    },
    {
      name: "KbStatus",
      type: "enum",
      data: [
        { id: "close", label: "Close" },
        { id: "open", label: "Open" },
      ],
    },
    {
      name: "KbCustomPage",
      type: "object",
      data: "http://localhost:3000/customPages",
      fields: [
        {
          name: "id",
          type: { name: "guid" },
          isRequired: true,
        },
        {
          name: "title",
          type: { name: "string", minLength: 0, maxLength: 1024 },
          isRequired: true,
        },
      ],
    },
  ],
  entity: "KnowledgeBase",
  groups: [
    {
      indent: 0,
      rows: [
        {
          fieldName: "name",
          componentType: "input",
        },
        {
          fieldName: "homePageType",
          componentType: "radioGroup",
        },
      ],
    },
    {
      indent: 1,
      conditionsToHide: ["homePageType==rootCategory"],
      rows: [
        {
          fieldName: "homeCustomPageId",
          componentType: "select",
          nullOptionLabel: "--Choose a Custom Page--",
        },
      ],
    },
    {
      indent: 0,
      rows: [
        {
          fieldName: "visibility",
          componentType: "radioGroup",
        },
        {
          fieldName: "allowFeedback",
          componentType: "checkbox",
          label: "Allow visitors to rate Helpful or Not Helpful on articles",
        },
        {
          fieldName: "status",
          componentType: "radioGroup",
        },
      ],
    },
  ],
};
describe("convert RawUIPage to UIPage", () => {
  it("should set title", () => {
    const page = normalizeRawUIPage(rawUIPage);
    expect(page.title).toBe(rawUIPage.title);
  });
  it("should set entity", () => {
    const page = normalizeRawUIPage(rawUIPage);
    expect(page.entity).toBe(rawUIPage.entity);
  });
  it("should create repositories", () => {
    const page = normalizeRawUIPage(rawUIPage);
    rawUIPage.entities.forEach(({ name }) =>
      expect(page.repositories[name]).toBeTruthy(),
    );
  });
  it("should convert enum entity to local repository", async () => {
    const page = normalizeRawUIPage(rawUIPage);

    for (const { type, name, data } of rawUIPage.entities) {
      if (type === "enum") {
        const list = await page.repositories[name].getList();
        expect(list).toStrictEqual(data);
      }
    }
  });

  it("should convert object entity to remote repository", async () => {
    const page = normalizeRawUIPage(rawUIPage);

    for (const { type, name, data } of rawUIPage.entities) {
      if (type === "object") {
        moxios.install();

        const response = [{ id: "abc" }];
        moxios.stubRequest(data as string, { response });

        const list = await page.repositories[name].getList();
        expect(list).toStrictEqual(response);

        moxios.uninstall();
      }
    }
  });
  it("should set fields", () => {
    const page = normalizeRawUIPage(rawUIPage);
    for (const { name, fields } of rawUIPage.entities) {
      if (name === page.entity) {
        expect(fields).toStrictEqual(page.fields);
      }
    }
  });
  it("should set groups", () => {
    const page = normalizeRawUIPage(rawUIPage);
    expect(page.groups).toEqual([
      {
        indent: 0,
        rows: [
          {
            field: {
              name: "name",
              type: { name: "string", minLength: 0, maxLength: 64 },
              isRequired: true,
              title: "Name",
            },
            componentType: "input",
          },
          {
            field: {
              name: "homePageType",
              type: {
                name: "reference",
                entityName: "KbHomePageType",
              },
              isRequired: true,
              title: "Home",
            },
            componentType: "radioGroup",
            optionsEntity: "KbHomePageType",
          },
        ],
      },
      {
        indent: 1,
        conditionsToHide: ["homePageType==rootCategory"],
        rows: [
          {
            field: {
              name: "homeCustomPageId",
              type: {
                name: "reference",
                entityName: "KbCustomPage",
                labelFieldName: "title",
              },
              isRequired: true,
              title: "",
            },
            componentType: "select",
            nullOptionLabel: "--Choose a Custom Page--",
            optionsEntity: "KbCustomPage",
            optionsLabelField: "title",
          },
        ],
      },
      {
        indent: 0,
        rows: [
          {
            field: {
              name: "visibility",
              type: { name: "reference", entityName: "KbVisibility" },
              isRequired: true,
              title: "Visibility",
            },
            componentType: "radioGroup",
            optionsEntity: "KbVisibility",
          },
          {
            field: {
              name: "allowFeedback",
              type: { name: "bool" },
              isRequired: false,
              title: "Feedback",
            },
            componentType: "checkbox",
            label: "Allow visitors to rate Helpful or Not Helpful on articles",
          },
          {
            field: {
              name: "status",
              type: { name: "reference", entityName: "KbStatus" },
              isRequired: true,
              title: "Status",
            },
            componentType: "radioGroup",
            optionsEntity: "KbStatus",
          },
        ],
      },
    ]);
  });
});

describe("render UIPage", () => {
  const configUrl = "/kbSettings.json";
  beforeEach(() => {
    moxios.install();
    mockRequests();
    document.body.innerHTML = "";
  });
  afterEach(() => moxios.uninstall());

  const mockRequests = () => {
    moxios.stubRequest(
      rawUIPage.entities.find(({ name }) => name === "KnowledgeBase")!
        .data as string,
      {
        response: [
          {
            id: "d8b2a806-6b14-59bb-8220-eee3a96ba292",
            name: "bireniw uzealu eni",
            allowFeedback: true,
            visibility: "public",
            status: "close",
            homePageType: "customPage",
            homeCustomPageId: "61e1e91a-7a25-5342-88a0-47fb9735c458",
          },
          {
            id: "d8b2a806-6b14-59bb-8220-eee3a96ba292",
            name: "bireniw uzealu eni",
            allowFeedback: true,
            visibility: "private",
            status: "close",
            homePageType: "rootCategory",
          },
        ],
      },
    );
    moxios.stubRequest(
      rawUIPage.entities.find(({ name }) => name === "KbCustomPage")!
        .data as string,
      {
        response: [
          {
            id: "61e1e91a-7a25-5342-88a0-47fb9735c458",
            title: "custom page1",
            modified: "2093-12-27T09:15:04.882Z",
            status: "open",
          },
          {
            id: "7e76e2e8-cd2b-5bdb-8535-cef09ff4717a",
            title: "custom page2",
            modified: "2079-05-02T10:29:13.180Z",
            status: "open",
          },
          {
            id: "e8e2fbbc-1083-59fb-bac1-01d174a7c2d8",
            title: "custom page 3",
            modified: "2054-10-15T08:22:54.280Z",
            status: "open",
          },
        ],
      },
    );
  };

  const renderPageComonent = async (
    page: RawUIPage,
  ): Promise<React.ReactElement> => {
    moxios.stubRequest(configUrl, { response: page });
    const Page = await makePageComponent2(configUrl);
    return (
      <Router>
        <Page />
      </Router>
    );
  };

  it("should render UIPage.title", async () => {
    const title = "Test title";
    const page = await renderPageComonent({
      ...rawUIPage,
      title,
      groups: [],
    });
    const wrapper = mount(page);
    expect(wrapper.find('h4[data-test-id="page-title"]').text()).toEqual(title);
  });

  it("should render kb name input in form", async () => {
    const page = await renderPageComonent({
      ...rawUIPage,
      groups: [
        {
          indent: 0,
          rows: [
            {
              fieldName: "name",
              componentType: "input",
            },
          ],
        },
      ],
    });
    const wrapper = mount(page);
    console.log(
      wrapper
        .find('[data-test-id="form-KnowledgeBase"]')
        .debug({ verbose: true }),
    );
    expect(wrapper.find('label[data-test-id="input-label"]').text()).toEqual(
      "Name",
    );
    expect(wrapper.find("form").length).toEqual(1);
    expect(wrapper.find('[data-test-id="form-field-0-0"]').length).toEqual(1);
  });
  it("should render kb home radio group", async () => {
    const page = await renderPageComonent({
      ...rawUIPage,
      groups: [
        {
          indent: 0,
          rows: [
            {
              fieldName: "homePageType",
              componentType: "radioGroup",
            },
          ],
        },
      ],
    });
    const wrapper = render(page);
    expect(
      wrapper.find('[data-test-id="form-radio-group-item-0"]'),
    ).toBeTruthy();
  });
});
