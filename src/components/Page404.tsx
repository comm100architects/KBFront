import React from "react";
import { GlobalContext } from "../GlobalContext";
import { makeHeader } from "../Header";

export const Page404 = () => {
  const { topMenus } = React.useContext(GlobalContext);
  const Header = makeHeader(topMenus);
  React.useEffect(() => {
    document.title = "Page Not Found";
  }, []);
  return (
    <>
      <Header selected="" />
      <h1> Page Not Found</h1>
    </>
  );
};
