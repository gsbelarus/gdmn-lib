import React, { useState } from 'react';
import { GdmnToolbar, GdmnToolbarThemeProps } from './GdmnToolbar';

const GdmnToolbarWithTheme = (props: any) => {
  /** Styles from king-pos project */
  const defaultTheme: GdmnToolbarThemeProps = {
    hover: {
      background: 'rgb(86 83 211 / 20%)', color: 'rgb(86 83 211)' 
    },
    toggled: {
      border: 'black',
      color: 'white', 
      background: 'rgb(86 83 211)',
      hover: {
        border: 'black', color: 'white', background: 'rgb(86 83 211)'
      }
    },
  };

  return (
    <GdmnToolbar
      {...props}
      theme={defaultTheme}
    />
  );
};

export default {
  title: 'GdmnToolbar',
  component: GdmnToolbarWithTheme,
};

const SaveIcon = ({ size, className, color }: any) => (
  <svg
    className={className}
    width={size ?? 18}
    height={size ?? 18}
    viewBox="0 0 24 24"
    fill={color ?? "currentColor"}
  >
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3m3-10H5V5h10z" />
  </svg>
);

export const Button = () => (
  <GdmnToolbarWithTheme
    items={[
      { 
        type: 'button', 
        id: 'btn1', 
        label: 'Button', 
        tooltip: 'Click me!',
        icon: <SaveIcon />,
        onClick: () => alert('Clicked!') 
      },
    ]}
  />
);

export const Switcher = () => {
  const [checked, setChecked] = useState(false);
  return (
    <GdmnToolbarWithTheme
      items={[
        {
          type: 'switcher',
          id: 'sw1',
          label: 'Switcher',
          checked,
          onChange: setChecked,
          tooltip: checked ? 'Turn Off' : 'Turn On'
        }
      ]}
    />
  );
};

export const Separator = () => {
  const [checked, setChecked] = useState(false);
  return (
    <GdmnToolbarWithTheme
      items={[
        { type: 'button', id: 'btn1', label: 'Button', icon: <SaveIcon />, },
        { type: 'separator' },
        {
          type: 'switcher',
          id: 'sw1',
          label: 'Switcher',
          checked,
          onChange: setChecked,
          tooltip: 'Toggle me!'
        },
        { type: 'button', id: 'btn2', label: 'Button 2', }
      ]}
    />
  );
}; 