import { Box, IconButton, Menu } from '@mui/material';
import Tooltip from '@mui/material/Tooltip/Tooltip';
import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  size?: 'small' | 'medium' | 'large';
  container?: {
    className?: string,
    style?: CSSProperties;
  }
};

const MoreVertIcon = ({ size, className, color }: any) => (
  <svg
    className={className}
    width={size ?? 24}
    height={size ?? 24}
    viewBox="0 0 24 24"
    fill={color ?? "currentColor"}
  >
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2" />
  </svg>
);

const itemsGap = 8;
const moreButtonWidth = 34;

export function GdmnToolbar({ items, showLabels, theme: propsTheme, className, style, size, container }: Readonly<GdmnToolbarProps>) {

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

  const containerRef = useRef<any>();
  const contentRef = useRef<any>();

  const [sortedItems, setSortedItems] = useState<{ visible: GdmnToolbarItems, hidden: GdmnToolbarItems; }>({ visible: items, hidden: [] });
  const [cacheSizes, setCacheSizes] = useState<number[]>([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoCacheSizes = useMemo(() => cacheSizes, [JSON.stringify(cacheSizes)]);

  useEffect(() => {
    if (!contentRef.current || !containerRef.current) return;

    const observer = new ResizeObserver(entries => {
      const moreButtonIndent = moreButtonWidth + itemsGap;

      if (!contentRef.current || !containerRef.current) return;
      const visible: GdmnToolbarItems = [];
      const hidden: GdmnToolbarItems = [];
      const sizes: number[] = [];
      let currentWidth = 0;

      items.forEach((item, index) => {
        const moreButtonIndent = items.length - 1 === index ? 0 : moreButtonWidth + itemsGap;
        const el = contentRef.current.children[index];

        const width = (el?.id === 'moreButton' ? undefined : el?.offsetWidth) ?? memoCacheSizes[index] ?? 32;
        sizes.push(width);
        if ((width + currentWidth + itemsGap + moreButtonIndent) <= containerRef.current.offsetWidth) {
          visible.push(item);
        } else {
          hidden.push(item);
        }
        currentWidth += (width + itemsGap);
      });

      setCacheSizes(sizes);
      setSortedItems({ visible: visible, hidden: hidden });
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [memoCacheSizes, items]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  useEffect(() => {
    setMenuOpen(Boolean(anchorEl));
  }, [anchorEl]);

  const handleClose = useCallback(() => {
    setMenuOpen(false);
    setAnchorEl(null);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex-1 relative h-full min-h-[48px] min-w-[50px] ${container?.className ?? ''}`}
      style={{ ...container?.style }}
    >
      <div
        ref={contentRef}
        aria-label="toolbar"
        className={`flex flex-row items-center p-2 min-w-max absolute inset-0 ${className ?? ''}`}
        style={{ ...style }}
      >
        {sortedItems.visible.map((item, index) => (
          <ToolbarItem
            key={index}
            item={item}
            index={index}
            showLabels={showLabels}
            theme={theme}
            size={size}
          />
        ))}
        <div
          id='moreButton'
          style={{
            display: sortedItems.hidden && sortedItems.hidden.length > 0 ? undefined : 'none',
            marginLeft: sortedItems.visible.length > 0 ? `${itemsGap}px` : undefined
          }}>
          <IconButton
            id="basic-button"
            aria-controls={menuOpen ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? 'true' : undefined}
            onClick={handleMenuClick}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>
          {sortedItems.hidden && sortedItems.hidden.length && <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            MenuListProps={{
              disablePadding: true,
              'aria-labelledby': 'basic-button',
            }}
          >
            <div
              aria-label="toolbar"
              className={`flex flex-row items-center p-2 flex-wrap inset-0 ${className ?? ''}`}
              style={{ ...style }}
            >
              {sortedItems.hidden.map((item, index) => (
                <ToolbarItem
                  key={index}
                  item={item}
                  index={index}
                  showLabels={showLabels}
                  theme={theme}
                  size={size}
                />
              ))}
            </div>
          </Menu>}
        </div>
      </div>
    </div>
  );
};

interface IToolbarItemProps {
  item: GdmnToolbarItem;
  index: number;
  showLabels?: boolean;
  theme: GdmnToolbarThemeProps;
  size?: 'small' | 'medium' | 'large';
};

const ToolbarItem = ({ item, index, showLabels, theme, size }: IToolbarItemProps) => {
  const [internalLoading, setInternalLoading] = useState<string | number | undefined>();
  const [animated, setAnimated] = useState<string | number | undefined>();

  useEffect(() => {
    if (animated || animated === 0) {
      const timeout = setTimeout(() => setAnimated(undefined), 400);
      return () => clearTimeout(timeout);
    }
  }, [animated]);

  const [pressed, setPressed] = useState<string | number | undefined>();

  useEffect(() => {
    if (pressed || pressed === 0) {
      const timeout = setTimeout(() => setPressed(undefined), 400);
      return () => clearTimeout(timeout);
    }
  }, [pressed]);

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

  const commonStyles = { marginLeft: index !== 0 ? `${itemsGap}px` : undefined };

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

  const height = size === 'small' ? 'h-6' : size === 'large' ? 'h-10' : 'h-8';
  const width = size === 'small' ? 'w-6' : size === 'large' ? 'w-10' : 'w-8';

  switch (item.type) {
    case "button": {
      return (
        <Box
          key={item.id}
          sx={{ ...commonStyles, ...getStyles(toggled, disabled) }}
          className={`${width} ${height} flex justify-center items-center border
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
          sx={{ ...commonStyles, ...getStyles(toggled, disabled) }}
          className={`${height} w-14 flex justify-center items-center rounded-2xl`}
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
          sx={{ ...commonStyles, ...getStyles(toggled, disabled) }}
          className={`${height} flex justify-center items-center`}
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
          style={{ ...commonStyles, minHeight: size === 'small' ? 24 : size === 'large' ? 40 : 32 }}
          className={`h-full border-0 border-l border-solid border-zinc-500`}
        />
      );
  }
};
