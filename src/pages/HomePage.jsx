import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination'; 
import { fetchProducts } from '../api/productApi';
import { fetchCategories } from '../api/categoryApi';

// Refactored Components
import PromotionalBanners from '../components/PromotionalBanners';
import CategoryBar from '../components/CategoryBar';
import ProductCard from '../components/ProductCard';
import CategoryProductSection from '../components/CategoryProductSection';

const HomePage = () => {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // Chỉ dùng cho featured products
  const [error, setError] = useState(null); // Chỉ dùng cho featured products

  useEffect(() => {
    // Lấy sản phẩm nổi bật
    const getProducts = async () => {
      try {
        setLoading(true);
        // Mock originalPrice for discount calculation demonstration
        const data = (await fetchProducts({ type: 'featured' }))
          .filter(p => p.stockQuantity > 0) // Lọc bỏ sản phẩm đã hết hàng
          .map(p => ({
            ...p, 
            originalPrice: p.price && p.price > 0 ? Math.round(p.price * 1.25) : 0
          }));
        setFeaturedProducts(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    getProducts();

    // Lấy danh sách các danh mục
    const getCategories = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (error) {
        console.error("Failed to fetch categories on HomePage:", error);
      }
    };
    getCategories();
  }, []);

  return (
    <Container maxWidth="lg">
        <PromotionalBanners />
        <CategoryBar />
      
        <Box component="section" sx={{ mb: 5 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                {t('home.featuredBooks')}
            </Typography>
            {loading && <CircularProgress />}
            {error && <Typography color="error" align="center">{error}</Typography>}
            <Box sx={{ 
              '& .swiper': { overflow: 'visible' }, // Cho phép pagination hiển thị bên ngoài container
              '& .swiper-pagination': {
                bottom: '-25px', // Di chuyển các chấm tròn xuống dưới
              },
              '& .swiper-pagination-bullet-active': { // Tùy chỉnh màu cho bullet đang active
                backgroundColor: 'primary.main'
              }
            }}>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={24}
                slidesPerView={4}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                loop={true}
                breakpoints={{
                  320: { slidesPerView: 1, spaceBetween: 10 },
                  600: { slidesPerView: 2, spaceBetween: 15 },
                  900: { slidesPerView: 3, spaceBetween: 20 },
                  1200: { slidesPerView: 4, spaceBetween: 24 },
                }}
              >
                {featuredProducts.map((product) => (
                  <SwiperSlide key={product.id} style={{ height: 'auto' }}>
                    <ProductCard product={product} showAddToCartButton={false} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </Box>
        </Box>

        {/* Render các section sản phẩm theo từng danh mục */}
        {categories.map(category => (
          <CategoryProductSection key={category.id} category={category} showAddToCartButton={false} />
        ))}
    </Container>
  );
};

export default HomePage;
