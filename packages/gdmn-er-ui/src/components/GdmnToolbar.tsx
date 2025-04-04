import Tooltip from '@mui/material/Tooltip/Tooltip';
import React, { useEffect, useState } from 'react';

export type GdmnToolbarItem =
  | {
    type: "button";
    id: string;
    label: string;
    tooltip?: string;
    icon?: string | React.ReactNode;
    group?: string;
    toggled?: boolean;
    disabled?: boolean;
    attention?: boolean;
    loading?: boolean;
    animated?: boolean;
    /**
     * If true, the animation will be played until the onClick function is completed.
     */
    autoLoading?: boolean;
    onClick?: () => void | Promise<void>;
  }
  | {
    type: "separator";
  };

export type GdmnToolbarItems = GdmnToolbarItem[];

type GdmnToolbarProps = {
  items: GdmnToolbarItems;
  showLabels?: boolean;
};

export function GdmnToolbar({ items, showLabels }: GdmnToolbarProps) {
  const [pressed, setPressed] = useState<string | number | undefined>();
  const [animated, setAnimated] = useState<string | number | undefined>();
  const [internalLoading, setInternalLoading] = useState<string | number | undefined>();

  useEffect(() => {
    if (pressed || pressed === 0) {
      const timeout = setTimeout(() => setPressed(undefined), 400);
      return () => clearTimeout(timeout);
    }
  }, [pressed]);

  useEffect(() => {
    if (animated || animated === 0) {
      const timeout = setTimeout(() => setAnimated(undefined), 400);
      return () => clearTimeout(timeout);
    }
  }, [animated]);

  return (
    <div className="flex flex-row items-center gap-2 p-2">
      {items.map((item, index) => {
        const B =
          item.type === "button" ? (
            <div
              className="w-full h-full flex flex-col justify-center items-center gap-1 cursor-pointer"
              key={index}
            >
              <div
                className={
                  "flex flex-col justify-center items-center" +
                  ((item.loading || internalLoading === index) ? " animate-spin" : "") +
                  (item.animated && animated === index ? " animate-ping" : "")
                }
              >
                {item.icon}
              </div>
              {showLabels && item.label}
            </div>
          ) : undefined;

        let st =
          item.type === "separator"
            ? ""
            : item.toggled
              ? item.disabled
                ? "bg-zinc-700 fill-zinc-50 text-zinc-50"
                : "bg-primary fill-white text-white hover:bg-primary/80 hover:fill-white hover:text-white"
              : item.disabled
                ? "fill-zinc-600 text-zinc-600 opacity-40"
                : "fill-zinc-600 text-zinc-600 hover:bg-primaryHover/20 hover:fill-primary hover:text-primary";

        if (index === pressed) {
          st += " relative top-[1px] left-[1px]";
        } else {
          st += " shadow";
        }

        return B && item.type === "button" ? (
          <div
            key={index}
            className={`w-8 h-8 flex justify-center items-center border border-solid border-zinc-600 rounded ${st}`}
            onClick={
              item.disabled || item.loading || !item.onClick
                ? undefined
                : async () => {
                  setPressed(index);
                  if (item.animated) setAnimated(index);
                  if (item.autoLoading) setInternalLoading(index);
                  try {
                    await item.onClick?.();
                  } finally {
                    if (item.autoLoading) setInternalLoading(undefined);
                  }
                }
            }
          >
            {item.tooltip && index !== pressed ? (
              <Tooltip
                title={item.tooltip}
                enterDelay={700}
              >
                {B}
              </Tooltip>
            ) : (
              B
            )}
          </div>
        ) : (
          <div
            key={index}
            className="h-full border-0 border-l border-solid border-zinc-500"
          />
        );
      })}
    </div>
  );
};
