import React from "react";
import { Header } from "../Header";
import { TopMenu } from "../gen/types";

export const Page404 = ({ topMenus }: { topMenus: TopMenu[] }) => {
  React.useEffect(() => {
    document.title = "Page Not Found";
  }, []);
  return (
    <>
      <Header topMenus={topMenus} selected="" />
      <h1> Page Not Found</h1>
    </>
  );
};
