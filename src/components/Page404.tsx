import React from "react";

export const Page404 = () => {
  React.useEffect(() => {
    document.title = "404 Not Found";
  }, []);
  return <h1> 404 Not Found</h1>;
};
