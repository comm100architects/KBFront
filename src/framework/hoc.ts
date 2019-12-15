import * as React from "react";
export function withProps<Props, PartialProps>(
  component: React.ComponentType<Props>,
  props: PartialProps,
) {
  return (restProps: Exclude<Props, PartialProps>) =>
    React.createElement(component, { ...props, ...restProps });
}

export function withLazyProps<Props>(
  component: React.ComponentType<Props>,
  lazyProps: Promise<Partial<Props>>,
) {
  return (props: Props) => {
    const [partialProps, setPartialProps] = React.useState(
      undefined as Partial<Props> | undefined,
    );

    React.useEffect(() => {
      lazyProps.then(setPartialProps);
    }, []);

    if (partialProps) {
      return React.createElement(component, { ...props, ...partialProps });
    } else {
      return React.createElement(React.Fragment);
    }
  };
}
