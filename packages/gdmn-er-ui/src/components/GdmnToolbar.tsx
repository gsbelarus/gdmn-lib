import { Box } from '@mui/material';
import Tooltip from '@mui/material/Tooltip/Tooltip';
import React, { CSSProperties, useEffect, useState } from 'react';
import GdmnSwitcher from './GdmnSwitcher';

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
    type: "switcher";
    id: string;
    label: string;
    tooltip?: string;
    icon?: string | React.ReactNode;
    checked: boolean;
    disabled?: boolean;
    onChange?: (checked: boolean) => void;
  }
  | {
    type: "separator";
  }
  | {
    type: "custom";
    id: string;
    tooltip?: string;
    disabled?: boolean;
    component: React.ReactNode;
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
  className?: string,
  style?: CSSProperties;
};

export function GdmnToolbar({ items, showLabels, theme: propsTheme, className, style }: Readonly<GdmnToolbarProps>) {

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
    <div aria-label="toolbar" className={`flex flex-row items-center gap-2 p-2 ${className ?? ''}`} style={style}>
      {items.map((item, index) => {
        const component =
          item.type === "button" ? (
            <div
              className="w-full h-full flex flex-col justify-center items-center gap-1 cursor-pointer"
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
          ) : item.type === "switcher" ? (
            <div
              className="w-full h-full flex flex-col justify-center items-center gap-1"
            >
              <div className="flex flex-col justify-center items-center">
                {item.icon}
                <GdmnSwitcher
                  checked={item.checked ?? false}
                  disabled={item.disabled}
                  onChange={e => item.onChange?.(e.target.checked)}
                  size="small"
                  primaryColor={theme.toggled?.background}
                />
              </div>
              {showLabels && item.label}
            </div>
          ) : item.type === "custom" ? (
            <div className="w-full h-full flex flex-col justify-center items-center gap-1">
              {item.component}
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

        let toggled = false;
        let disabled = false;
        if (item.type === 'button') {
          toggled = !!item.toggled;
          disabled = !!item.disabled;
        } else if (item.type === 'switcher') {
          disabled = !!item.disabled;
        }

        switch (item.type) {
          case "button": {
            return (
              <Box
                key={item.id}
                sx={getStyles(toggled, disabled)}
                className={`w-8 h-8 flex justify-center items-center border
                  border-solid rounded ${index === pressed ? 'relative top-[1px] left-[1px]' : 'shadow'}`}
                onClick={
                  item.type === "button"
                    ? (item.disabled || item.loading || !item.onClick
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
                      })
                    : undefined
                }
              >
                {item.tooltip && index !== pressed && component ? (
                  <Tooltip
                    title={item.tooltip}
                    enterDelay={700}
                  >
                    {component}
                  </Tooltip>
                ) : (
                  component
                )}
              </Box>
            );
          }

          case "switcher": {
            return (
              <Box
                key={item.id}
                sx={getStyles(toggled, disabled)}
                className="h-8 w-14 flex justify-center items-center rounded-2xl"
              >
                {item.tooltip && index !== pressed && component ? (
                  <Tooltip
                    title={item.tooltip}
                    enterDelay={700}
                  >
                    {component}
                  </Tooltip>
                ) : (
                  component
                )}
              </Box>
            );
          }

          case "custom": {
            return (
              <Box
                key={item.id}
                sx={getStyles(toggled, disabled)}
                className="h-8 flex justify-center items-center"
              >
                {item.tooltip && index !== pressed && component ? (
                  <Tooltip
                    title={item.tooltip}
                    enterDelay={700}
                  >
                    {component}
                  </Tooltip>
                ) : (
                  component
                )}
              </Box>
            );
          }

          default:
            return (
              <div
                key={`separator-${index}`}
                className="h-full border-0 border-l border-solid border-zinc-500"
              />
            );
        }
      })}
    </div>
  );
};
