import { CIconName } from "./components/Icons";

// TODO: generate this file from source code files
// such as, go through tsx files in src/LiveChat/ folder and generate pages

export interface RawMenuItem {
  name: string; // for url
  label: string; //
  icon?: CIconName;
  page?: string;
}

export interface RawSubMenu {
  label: string;
  icon: CIconName;
  items: Array<RawMenuItem>;
  page?: string;
}

export type RawMenu = Array<RawMenuItem | RawSubMenu>;

export interface RawProduct {
  name: string;
  label: string;
  defaultPage: string;
  menu: RawMenu;
}

export function isMenuExist(menuName: string, menu: RawMenu): boolean {
  for (var item of menu) {
    if ((item as RawMenuItem).name === menuName) return true;
    if ((item as RawSubMenu).items?.some(({ name }) => name === menuName))
      return true;
  }
  return false;
}

export function getMenuPage(
  menuName: string,
  menu: RawMenu,
): string | undefined {
  for (var item of menu) {
    if ((item as RawMenuItem).name === menuName) {
      return item.page;
    }
    const menuItem = (item as RawSubMenu).items?.find(
      ({ name }) => name === menuName,
    );
    if (menuItem !== undefined) {
      return menuItem.page;
    }
  }
}

export function getMenuLabel(menuName: string, menu: RawMenu): string | null {
  for (var item of menu) {
    if ((item as RawMenuItem).name === menuName)
      return (item as RawMenuItem).label;
    if ((item as RawSubMenu).items?.some(({ name }) => name === menuName))
      return (item as RawSubMenu).items!.find(({ name }) => name === menuName)!
        .label;
  }
  return null;
}

const livechatAppMenu: Array<RawMenuItem | RawSubMenu> = [
  { name: "dashboard", label: "Dashboard", icon: "dashboard" },
  { name: "agentConsole", label: "Get Online & Chat", icon: "chat" },
  { name: "install", label: "Install", icon: "code" },
  {
    label: "Campaign",
    icon: "create",
    items: [
      { name: "chatbutton", label: "Chat Button" },
      { name: "chatwindow", label: "Chat Window" },
    ],
  },
  {
    label: "Settings",
    icon: "settings",
    items: [
      { name: "cannedMessages", label: "Canned Messages" },
      { name: "department", label: "Department" },
    ],
  },
  {
    name: "history",
    label: "History",
    icon: "history",
  },
  {
    name: "reports",
    label: "Reports",
    icon: "assessment",
  },
  {
    name: "maxon",
    label: "MaximumOn",
    icon: "groupWork",
  },
];

const kbAppMenu: Array<RawMenuItem | RawSubMenu> = [
  { name: "articles", label: "Articles", icon: "description" },
  { name: "images", label: "Images", icon: "image" },
  { name: "designs", label: "Design", icon: "viewQuilt", page: "kb.designs" },
  {
    name: "settings",
    label: "Settings",
    icon: "settings",
    page: "kb.settings",
  },
  {
    label: "Advanced",
    icon: "widgets",
    items: [
      { name: "customPages", label: "Custom Pages", page: "kb.customPages" },
      {
        name: "knowledgeBases",
        label: "Multiple Knowledge Bases",
        page: "kb.multipleKbs",
      },
    ],
  },
];

const botAppMenu: Array<RawMenuItem | RawSubMenu> = [
  { name: "dashboard", label: "Dashboard", icon: "dashboard" },
];

const ticketAppMenu: Array<RawMenuItem | RawSubMenu> = [
  { name: "dashboard", label: "Dashboard", icon: "dashboard" },
];

const accountAppMenu: Array<RawMenuItem | RawSubMenu> = [
  { name: "dashboard", label: "Dashboard", icon: "dashboard" },
];

export const rawProducts: Array<RawProduct> = [
  {
    name: "livechat",
    label: "Live Chat",
    menu: livechatAppMenu,
    defaultPage: "dashboard",
  },
  {
    name: "ticket",
    label: "Ticket",
    menu: ticketAppMenu,
    defaultPage: "dashboard",
  },
  { name: "bot", label: "Bot", menu: botAppMenu, defaultPage: "dashboard" },
  { name: "kb", label: "KB", menu: kbAppMenu, defaultPage: "articles" },
  {
    name: "account",
    label: "Account",
    menu: accountAppMenu,
    defaultPage: "dashboard",
  },
];
