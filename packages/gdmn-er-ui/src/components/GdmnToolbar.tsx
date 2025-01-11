import Tooltip from '@mui/material/Tooltip/Tooltip';
import React from 'react';

export type GdmnToolbarItem = {
  type: 'button';
  id: string;
  label: string;
  tooltip?: string;
  icon?: string | React.ReactNode;
  group?: string;
  disabled?: boolean;
  attention?: boolean;
  loading?: boolean;
  onClick: () => void;
} | {
  type: 'separator';
};

export type GdmnToolbarItems = GdmnToolbarItem[];

type GdmnToolbarProps = {
  items: GdmnToolbarItems;
};

export function GdmnToolbar({ items }: GdmnToolbarProps) {
  return (
    <div className='flex flex-row items-center gap-2 p-2'>
      {
        items.map((item, index) => {
          if (item.type === 'button') {
            return (
              item.tooltip
                ?
                <Tooltip key={index} title={item.tooltip}>
                  <button key={index} onClick={item.onClick}>
                    {item.icon}
                    {item.label}
                  </button>
                </Tooltip>
                :
                <button key={index} onClick={item.onClick}>
                  {item.icon}
                  {item.label}
                </button>
            );
          } else if (item.type === 'separator') {
            return (
              <div key={index} style={{ borderLeft: '1px solid black', height: '100%' }} />
            );
          }
        })
      }
    </div>
  );
};