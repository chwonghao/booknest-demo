import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Grid, Link, Divider, Typography, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <Box sx={{ bgcolor: 'background.paper', p: 6, borderTop: '1px solid #e0e0e0' }} component="footer">
            <Container maxWidth="lg">
                <Grid container spacing={5}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            {t('footer.brand')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('footer.tagline')}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}><Typography variant="subtitle1" color="text.primary" gutterBottom>{t('footer.customerService')}</Typography><Link component={RouterLink} to="#" variant="body2" display="block" color="text.secondary">{t('footer.contactUs')}</Link><Link component={RouterLink} to="#" variant="body2" display="block" color="text.secondary">{t('footer.returnPolicy')}</Link></Grid>
                    <Grid item xs={12} sm={2}><Typography variant="subtitle1" color="text.primary" gutterBottom>{t('footer.aboutUs')}</Typography><Link component={RouterLink} to="#" variant="body2" display="block" color="text.secondary">{t('footer.ourStory')}</Link><Link component={RouterLink} to="#" variant="body2" display="block" color="text.secondary">{t('footer.careers')}</Link></Grid>
                    <Grid item xs={12} sm={4}><Typography variant="subtitle1" color="text.primary" gutterBottom>{t('footer.followUs')}</Typography><IconButton aria-label="Facebook" color="inherit" component="a" href="https://facebook.com"><FacebookIcon /></IconButton><IconButton aria-label="Twitter" color="inherit" component="a" href="https://twitter.com"><TwitterIcon /></IconButton><IconButton aria-label="Instagram" color="inherit" component="a" href="https://instagram.com"><InstagramIcon /></IconButton></Grid>
                </Grid>
                <Divider sx={{ my: 4 }} />
                <Typography variant="body2" color="text.secondary" align="center">
                    {t('footer.copyright', { year: new Date().getFullYear() })}
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;