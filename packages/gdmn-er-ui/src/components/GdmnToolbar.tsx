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
  onClick?: () => void;
} | {
  type: 'separator';
};

type GdmnToolbarItems = GdmnToolbarItem[];

type GdmnToolbarProps = {
  items: GdmnToolbarItems;
  showLabels?: boolean;
};

export function GdmnToolbar({ items, showLabels }: GdmnToolbarProps) {
  return (
    <div className='flex flex-row items-center gap-2 p-2'>
      {
        items.map((item, index) => {
          const B = item.type === 'button'
            ?
            <button
              key={index}
              onClick={item.disabled ? undefined : item.onClick}
            >
              <div className={item.loading ? 'animate-spin' : ''}>
                {item.icon}
              </div>
              {showLabels && item.label}
            </button>
            :
            undefined;

          return (
            B && item.type === 'button'
              ?
              <div
                key={index}
                className={`w-8 h-8 p-1 flex justify-center items-center border border-solid border-zinc-600 rounded fill-zinc-600 text-zinc-600
                        hover:bg-primaryHover/20 hover:fill-primary hover:text-primary ${item.disabled ? 'opacity-50' : ''}`}
              >
                {item.tooltip ? <Tooltip key={index} title={item.tooltip}>{B}</Tooltip> : B}
              </div>
              :
              <div key={index} className='h-full border-0 border-l border-solid border-zinc-500' />
          );
        }
        )
      }
    </div>
  );
};
