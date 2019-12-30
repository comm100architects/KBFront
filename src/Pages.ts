import { CIconName } from "./components/Icons";

// TODO: generate this file from source code files
// such as, go through tsx files in src/LiveChat/ folder and generate pages
//

export interface PageRef {
  relatviePath: string;
  pageId: string;
  redirectTo?: string;
}

export interface RawMenuItem {
  name: string; // for url
  label: string; //
  icon?: CIconName;
  pages?: PageRef[];
}

export interface RawSubMenu {
  label: string;
  icon: CIconName;
  items: Array<RawMenuItem>;
  pages?: PageRef[];
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

export function getMenuPages(menuName: string, menu: RawMenu): PageRef[] {
  for (var item of menu) {
    if ((item as RawMenuItem).name === menuName) {
      return item.pages || [];
    }
    const menuItem = (item as RawSubMenu).items?.find(
      ({ name }) => name === menuName,
    );
    if (menuItem !== undefined) {
      return menuItem.pages || [];
    }
  }
  return [];
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

