import React from 'react';

export type GdmnToolbarItem = {
  type: 'button';
  id: string;
  title: string;
  icon: string | React.ReactNode;
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
              <button key={index} onClick={item.onClick}>
                {item.icon}
                {item.title}
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