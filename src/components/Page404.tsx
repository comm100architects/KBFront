import React from "react";
import { GlobalContext } from "../GlobalContext";
import { makeHeader } from "../Header";

export const Page404 = () => {
  const context = React.useContext(GlobalContext);
  const settings = context.settings!;
  const Header = makeHeader(settings.menu);
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
