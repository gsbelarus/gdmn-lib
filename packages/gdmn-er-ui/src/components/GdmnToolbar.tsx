import { Box } from '@mui/material';
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

export interface GdmnToolbarThemeOptions {
  border?: string,
  color?: string;
  background?: string;
}

export interface GdmnToolbarThemeProps extends GdmnToolbarThemeOptions {
  hover?: GdmnToolbarThemeOptions,
  disabled?: GdmnToolbarThemeOptions;
  toggled?: GdmnToolbarThemeOptions & {
    hover?: GdmnToolbarThemeOptions,
    disabled?: GdmnToolbarThemeOptions;
  };
}

export type GdmnToolbarProps = {
  items: GdmnToolbarItems;
  showLabels?: boolean;
  theme?: GdmnToolbarThemeProps;
};

export function GdmnToolbar({ items, showLabels, theme: propsTheme }: Readonly<GdmnToolbarProps>) {

  const theme: GdmnToolbarThemeProps = {
    border: propsTheme?.border ?? 'rgb(82 82 91)',
    color: propsTheme?.color ?? 'rgb(82 82 91)',
    hover: {
      border: propsTheme?.hover?.border ?? 'rgb(82 82 91)',
      color: propsTheme?.hover?.color ?? 'white',
      background: propsTheme?.hover?.background ?? 'rgb(0 0 0 / 10%)'
    },
    disabled: {
      border: propsTheme?.disabled?.border ?? 'rgb(82 82 91 / 40%)',
      color: propsTheme?.disabled?.color ?? 'rgb(82 82 91 / 40%)',
      background: propsTheme?.disabled?.background ?? 'none'
    },
    toggled: {
      border: propsTheme?.toggled?.border ?? 'rgb(82 82 91)',
      color: propsTheme?.toggled?.color ?? 'white',
      background: propsTheme?.toggled?.background ?? 'rgb(82 82 91)',
      hover: {
        border: propsTheme?.toggled?.hover?.border ?? 'rgb(136 136 143)',
        color: propsTheme?.toggled?.hover?.color ?? 'white',
        background: propsTheme?.toggled?.hover?.background ?? 'rgb(136 136 143)',
      },
      disabled: {
        border: propsTheme?.toggled?.disabled?.border ?? 'rgb(63 63 70)',
        color: propsTheme?.toggled?.disabled?.color ?? 'white',
        background: propsTheme?.toggled?.disabled?.background ?? 'rgb(63 63 70)'
      }
    }
  };

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

        const getStyles = (toggled: boolean, disabled: boolean) => {
          const stylesFromObject = (options: GdmnToolbarThemeOptions | undefined) => {
            return {
              borderColor: options?.border,
              fill: options?.color,
              color: options?.color,
              background: options?.background,
            };
          };

          if (toggled) {
            if (disabled) {
              return stylesFromObject(theme.toggled?.disabled);
            }
            return {
              ...stylesFromObject(theme.toggled),
              '&:hover': {
                ...stylesFromObject(theme.toggled?.hover)
              }
            };
          }
          if (disabled) {
            return stylesFromObject(theme.disabled);
          }
          return {
            ...stylesFromObject(theme),
            '&:hover': {
              ...stylesFromObject(theme.hover)
            }
          };
        };

        return B && item.type === "button" ? (
          <Box
            key={index}
            sx={getStyles(!!item.toggled, !!item.disabled)}
            className={`w-8 h-8 flex justify-center items-center border
              border-solid rounded ${index === pressed ? 'relative top-[1px] left-[1px]' : 'shadow'}`}
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
          </Box>
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
