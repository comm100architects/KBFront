import * as React from "react";

export function withProps<Props, PartialProps>(
  component: React.ComponentType<Props>,
  props: PartialProps,
) {
  return (restProps: Exclude<Props, PartialProps>) =>
    React.createElement(component, { ...props, ...restProps });
}
