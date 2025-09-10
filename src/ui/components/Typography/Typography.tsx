import React, { FunctionComponent } from 'react';
import cx from 'classnames';

type VariantType = 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'caption' | 'label' | 'button';
type ThemeType = 'light' | 'dark' | 'inherit';

interface TypographyProps {
  variant?: VariantType;
  theme?: ThemeType;
  component?: keyof JSX.IntrinsicElements;
  className?: string;
  children: React.ReactNode;
}

const Typography: FunctionComponent<TypographyProps> = ({
  variant = 'body',
  theme = 'inherit',
  component,
  className,
  children
}) => {
  const Component = component || getDefaultComponent(variant);
  
  const classes = cx(
    'typography',
    `typography-${variant}`,
    theme !== 'inherit' && `typography-${theme}`,
    className
  );

  return <Component className={classes}>{children}</Component>;
};

function getDefaultComponent(variant: VariantType): keyof JSX.IntrinsicElements {
  switch (variant) {
    case 'h1':
      return 'h1';
    case 'h2':
      return 'h2';
    case 'h3':
      return 'h3';
    case 'small':
    case 'caption':
      return 'small';
    case 'label':
      return 'label';
    case 'button':
      return 'span';
    default:
      return 'p';
  }
}

export default Typography;