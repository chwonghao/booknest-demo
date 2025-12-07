import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomeIcon from '@mui/icons-material/Home';

/**
 * A reusable breadcrumbs component.
 * @param {Object} props
 * @param {Array<Object>} props.links - An array of link objects. Each object should have `to` (optional) and `label`.
 * e.g. [{ to: '/products', label: 'Products' }, { label: 'Product Name' }]
 */
const BreadcrumbsComponent = ({ links = [] }) => {
  const { t } = useTranslation();

  const allLinks = [
    { to: '/', label: t('breadcrumbs.home'), icon: <HomeIcon sx={{ mr: 2, fontSize: 'inherit' }} /> },
    ...links,
  ];

  return (
    <Container maxWidth="lg" sx={{ pt: 0, pb: { xs: 1, md: 2 } }}>
      <MuiBreadcrumbs aria-label="breadcrumb">
        {allLinks.map((link, index) => {
          const isLast = index === allLinks.length - 1;
          if (isLast) {
            return (
              <Typography
                key={index}
                color="text.primary"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                {link.icon}
                {link.label}
              </Typography>
            );
          }
          return (
            <Link
              component={RouterLink}
              to={link.to}
              key={index}
              underline="hover"
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Container>
  );
};

export default BreadcrumbsComponent;
