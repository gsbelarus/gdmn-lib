import React, { useState } from 'react';
import { GdmnToolbar, GdmnToolbarProps, GdmnToolbarThemeProps } from './GdmnToolbar';

const GdmnToolbarWithTheme = (props: GdmnToolbarProps) => {
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

export const Toolbar = () => {

  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');

  return (
    <div>
      <div className="inline-block text-left">
        <div className="flex items-center gap-3 mb-2">
            <div className="form-control">
              <label className="cursor-pointer flex gap-1">
                <input type="radio" name="size" className="radio radio-primary" value="small" checked={size === 'small'} onChange={() => setSize('small')} />
                <span className="label-text">Small</span>                
              </label>
            </div>
            <div className="form-control">
              <label className="cursor-pointer flex gap-1">
                <input type="radio" name="size" className="radio radio-primary" value="medium" checked={size === 'medium'} onChange={() => setSize('medium')} />
                <span className="label-text">Medium</span>                
              </label>
            </div>
            <div className="form-control">
              <label className="cursor-pointer flex gap-1">
                <input type="radio" name="size" className="radio radio-primary" value="large" checked={size === 'large'} onChange={() => setSize('large')} />
                <span className="label-text">Large</span>
              </label>
            </div>
        </div>
      </div>
      
      <div className="border">
        <GdmnToolbarWithTheme
          size={size}
          items={[
            { 
              type: 'button', 
              id: 'btn1', 
              label: 'Button', 
              tooltip: 'Click me!',
              icon: <SaveIcon />,
              onClick: () => alert('Clicked!') 
            },
            { type: 'separator' },
            { type: 'button', id: 'btn2', label: 'Button 2', }
          ]}
        />
      </div>
    </div>
  );
};