import SendIcon from "@material-ui/icons/Send";
import { SvgIconProps } from "@material-ui/core/SvgIcon";

// TODO: generate this file from source code files
// such as, go through tsx files in src/LiveChat/ folder and generate pages

export interface RawMenuItem {
  name: string; // for url
  label: string; //
  icon: React.SFC<SvgIconProps>;
}

export interface RawSubMenu {
  label: string;
  icon: React.SFC<SvgIconProps>;
  items: Array<RawMenuItem>;
}

export type RawMenu = Array<RawMenuItem | RawSubMenu>;

export interface RawApp {
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
  { name: "dashboard", label: "Dashboard", icon: SendIcon },
  { name: "install", label: "Install", icon: SendIcon },
  {
    label: "Campaign",
    icon: SendIcon,
    items: [
      { name: "chatbutton", label: "Chat Button", icon: SendIcon },
      { name: "chatwindow", label: "Chat Window", icon: SendIcon }
    ]
  },
  {
    label: "Settings",
    icon: SendIcon,
    items: [
      { name: "cannedMessages", label: "Canned Messages", icon: SendIcon },
      { name: "department", label: "Department", icon: SendIcon }
    ]
  }
];

const kbAppMenu: Array<RawMenuItem | RawSubMenu> = [
  { name: "articles", label: "Articles", icon: SendIcon },
  { name: "images", label: "Images", icon: SendIcon },
  { name: "design", label: "Design", icon: SendIcon },
  { name: "settings", label: "Settings", icon: SendIcon },
  { name: "advanced", label: "Advanced", icon: SendIcon }
];

const botAppMenu: Array<RawMenuItem | RawSubMenu> = [
  { name: "dashboard", label: "Dashboard", icon: SendIcon }
];

const ticketAppMenu: Array<RawMenuItem | RawSubMenu> = [
  { name: "dashboard", label: "Dashboard", icon: SendIcon }
];

const accountAppMenu: Array<RawMenuItem | RawSubMenu> = [
  { name: "dashboard", label: "Dashboard", icon: SendIcon }
];

export const rawApps: Array<RawApp> = [
  {
    name: "livechat",
    label: "Live Chat",
    menu: livechatAppMenu,
    defaultPage: "dashboard"
  },
  {
    name: "ticket",
    label: "Ticket",
    menu: ticketAppMenu,
    defaultPage: "dashboard"
  },
  { name: "bot", label: "Bot", menu: botAppMenu, defaultPage: "dashboard" },
  { name: "kb", label: "KB", menu: kbAppMenu, defaultPage: "articles" },
  {
    name: "account",
    label: "Account",
    menu: accountAppMenu,
    defaultPage: "dashboard"
  }
];
