import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const PromotionalBanners = () => {
  const { t } = useTranslation();
  return (
  <Box mb={4}>
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={30}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3500 }}
      loop={true}
    >
      {[...Array(3)].map((_, index) => (
        <SwiperSlide key={index}>
          <Paper 
            elevation={3}
            sx={{ 
              height: 350, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: 2,
              background: 'linear-gradient(45deg, #0D7EBE 30%, #65A9D7 90%)',
              color: 'white'
            }}
          >
            <Typography variant="h3" component="h2" fontWeight="bold">
                {t('home.promotionBanner')} {index + 1}
            </Typography>
          </Paper>
        </SwiperSlide>
      ))}
    </Swiper>
  </Box>
  );
};

export default PromotionalBanners;
