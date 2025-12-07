import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button, Menu, MenuItem, ListItemText, Typography, Box } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const VnFlag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="24" height="16">
    <rect fill="#da251d" width="900" height="600"/>
    <path fill="#ff0" d="m450 150 100 300-262-185h324L350 450z"/>
  </svg>
);

const EnFlag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="24" height="16">
    <clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath>
    <path d="M0 0v30h60V0z" fill="#00247d"/>
    <path d="M0 0L60 30M0 30L60 0" stroke="#fff" strokeWidth="6" clipPath="url(#a)"/>
    <path d="M0 0L60 30M0 30L60 0" stroke="#cf142b" strokeWidth="4" clipPath="url(#a)"/>
    <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/>
    <path d="M30 0v30M0 15h60" stroke="#cf142b" strokeWidth="6"/>
  </svg>
);

const languages = {
  en: { name: 'English', flag: <EnFlag /> },
  vi: { name: 'Tiếng Việt', flag: <VnFlag /> }
};

const LanguageSwitcher = () => { 
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    handleClose();
  };

  const currentLanguage = i18n.language.split('-')[0];

  return (
    <div>
      <Button
        id="language-button"
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        sx={{ color: 'white', textTransform: 'none', mr: 1 }}
        endIcon={<KeyboardArrowDownIcon />}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
          {languages[currentLanguage]?.flag}
        </Box>
        <Typography component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          {currentLanguage.toUpperCase()}
        </Typography>
      </Button>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'language-button' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableScrollLock={true}
      >
        {Object.keys(languages).map((lng) => (
          <MenuItem key={lng} onClick={() => handleLanguageChange(lng)} selected={lng === currentLanguage}>
            <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
              {languages[lng].flag}
            </Box>
            <ListItemText>{languages[lng].name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default LanguageSwitcher;
