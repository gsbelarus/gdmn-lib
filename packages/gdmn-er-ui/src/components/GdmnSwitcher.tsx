import React from 'react';
import Switch, { SwitchProps } from '@mui/material/Switch';
import { useTheme } from '@mui/material';

interface GdmnSwitcherProps extends SwitchProps {
  primaryColor?: string;
}

const GdmnSwitcher: React.FC<GdmnSwitcherProps> = ({ sx, primaryColor, ...props }) => {
  const theme = useTheme();

  const defaultStyles: SwitchProps['sx'] = {
    width: 58,
    height: 38,
    padding: 1,
    '& .MuiSwitch-switchBase': {
      padding: '9px',
      '&.Mui-checked': {
        color: primaryColor,
        transform: 'translateX(20px) !important',
        '& + .MuiSwitch-track': {
          backgroundColor: primaryColor,
        },
      }
    },
    '& .MuiSwitch-track': {
      borderRadius: 22 / 2,
      '&::before, &::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 16,
        height: 16,
      },
      '&::before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16px" width="16px" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
          theme.palette.primary.contrastText ?? theme.palette.getContrastText(theme.palette.primary.main),
        )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
        left: 12,
      },
      '&::after': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16px" width="16px" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
          theme.palette.primary.contrastText ?? theme.palette.getContrastText(theme.palette.primary.main),
        )}" d="M19,13H5V11H19V13Z" /></svg>')`,
        right: 12,
      },
    },
    '& .MuiSwitch-thumb': {
      boxShadow: 'none',
      width: 16,
      height: 16,
      margin: '2px',
    },
  };

  return <Switch sx={{ ...defaultStyles }} {...props} />;
};

export default GdmnSwitcher;


