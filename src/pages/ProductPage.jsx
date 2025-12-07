import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Grid, Button, Chip, CircularProgress, Alert, Paper, Divider, Rating, TextField, IconButton, LinearProgress, Stack } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useTranslation } from 'react-i18next';
import { fetchProduct } from '../api/productApi';
import BreadcrumbsComponent from '../components/BreadcrumbsComponent';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';

const ProductPage = () => {
  // --- Component con để hiển thị chi tiết đánh giá ---
  const RatingSummary = ({ product }) => {
    const { t } = useTranslation();
    const ratingData = [
      { star: 5, value: product.ratingDist5 },
      { star: 4, value: product.ratingDist4 },
      { star: 3, value: product.ratingDist3 },
      { star: 2, value: product.ratingDist2 },
      { star: 1, value: product.ratingDist1 },
    ];

    const getCount = (dist) => parseInt(dist?.split(':')[1] || 0, 10);

    const totalRatings = getCount(product.ratingDistTotal);

    if (totalRatings === 0) return null;

    return (
      <Box>
        {ratingData.map(item => {
          const count = getCount(item.value);
          const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
          return (
            <Box key={item.star} sx={{ display: 'flex', alignItems: 'center', mb: 0.5, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, p: 0.5 }}>
              <Typography variant="body2" sx={{ width: '55px', color: 'text.secondary' }}>{t('productPage.stars', { count: item.star })}</Typography>
              <Box sx={{ flexGrow: 1, mx: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ width: '90px', textAlign: 'right' }}>
                {count.toLocaleString()}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  };

  const { id: productId } = useParams();
  const { t, i18n } = useTranslation();
  const { addItem } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);
        const data = await fetchProduct(productId);
        setProduct(data);
        setError(null);
      } catch (err) {
        setError(t('productPage.fetchError'));
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    getProduct();
  }, [productId, t]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast.success(t('product.addedToCart', { name: product.name }));
    }
  };
  const formatPrice = (price) => {
    const currentLang = i18n.language.split('-')[0];
    if (currentLang === 'vi') {
      // Tạm thời giả định tỉ giá 1 USD = 25,000 VND.
      // Bạn nên thay thế bằng một giải pháp lấy tỉ giá thực tế.
      const vndPrice = price * 25000;
      return `${vndPrice.toLocaleString('vi-VN')} ₫`;
    }
    return `$${price?.toFixed(2)}`;
  };
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= product.stockQuantity) {
      setQuantity(value);
    } else if (e.target.value === '') {
      setQuantity('');
    }
  };

  const adjustQuantity = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity > 0 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  }

  if (!product) {
    return <Alert severity="info" sx={{ mt: 4 }}>{t('productPage.notFound')}</Alert>;
  }

  const stockStatus = product.stockQuantity > 0
    ? { label: t('productPage.inStock'), color: 'success' }
    : { label: t('productPage.outOfStock'), color: 'error' };

  return (
    <>
      <BreadcrumbsComponent
        links={[
          { to: `/products?category=${product.categoryId}`, label: product.categoryName },
          { label: product.name }
        ]}
      />
      <Paper sx={{ p: { xs: 2, md: 4 }, mt: 0 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Box
            component="img"
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: { xs: 400, md: 500 },
              objectFit: 'contain',
              border: '1px solid #ddd',
              borderRadius: 2
            }}
            alt={product.name}
            src={product.imageUrl || `https://via.placeholder.com/400x600.png?text=${encodeURIComponent(product.name)}`}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            {product.name}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {/* FIX: Pass a string of author names to the translation function, not an array of objects. */}
            {t('productPage.byAuthor', { 
              authors: (Array.isArray(product.authors) && product.authors.length > 0)
                ? product.authors.map(author => author.name).join(', ')
                : ''
            })}
          </Typography>

          <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
            {product.description}
          </Typography>

          <Grid container spacing={2} sx={{ my: 1 }}>
            <Grid item xs="auto">
              <Stack alignItems="center">
                <Typography variant="h3" fontWeight="bold">{product.rating?.toFixed(2)}</Typography>
                <Rating name="read-only" value={product.rating || 0} precision={0.1} readOnly size="large" />
                <Typography variant="body2" color="text.secondary">
                  {parseInt(product.ratingDistTotal?.split(':')[1] || 0, 10).toLocaleString()} {t('productPage.ratings')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.countsOfReview?.toLocaleString()} {t('productPage.reviews')}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs>
              <Typography variant="h6" gutterBottom>{t('productPage.ratingDistribution')}</Typography>
              <RatingSummary product={product} />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />

          <Typography variant="h4" color="primary.main" fontWeight="bold" gutterBottom>
            {formatPrice(product.price)}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip label={stockStatus.label} color={stockStatus.color} />
            {product.stockQuantity > 0 && (
              <Typography variant="body2" color="text.secondary">{t('productPage.stockRemaining', { count: product.stockQuantity })}</Typography>
            )}
          </Box>

          {product.stockQuantity > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
              <Typography sx={{ mr: 2 }}>{t('productPage.quantity')}:</Typography>
              <IconButton onClick={() => adjustQuantity(-1)} disabled={quantity <= 1} size="small"><Typography variant="h6">-</Typography></IconButton>
              <TextField
                value={quantity}
                onChange={handleQuantityChange}
                size="small"
                sx={{ width: '60px', mx: 1, '& input': { textAlign: 'center' } }}
                inputProps={{ min: 1, max: product.stockQuantity }}
              />
              <IconButton onClick={() => adjustQuantity(1)} disabled={quantity >= product.stockQuantity} size="small"><Typography variant="h6">+</Typography></IconButton>
            </Box>
          )}

          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<AddShoppingCartIcon />}
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0 || !quantity}
            sx={{ mt: 2, px: 5, py: 1.5 }}
          >
            {t('productPage.addToCart')}
          </Button>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="subtitle2" color="text.secondary">{t('productPage.publisher')}: {product.publisher}</Typography>
            <Typography variant="subtitle2" color="text.secondary">{t('productPage.published')}: {product.publishDay}/{product.publishMonth}/{product.publishYear}</Typography>
            <Typography variant="subtitle2" color="text.secondary">{t('productPage.pages')}: {product.pagesNumber}</Typography>
            <Typography variant="subtitle2" color="text.secondary">{t('productPage.language')}: {product.language}</Typography>
            <Typography variant="subtitle2" color="text.secondary">{t('productPage.isbn')}: {product.isbn || 'N/A'}</Typography>
          </Box>
        </Grid>
      </Grid>
      </Paper>
    </>
  );
};

export default ProductPage;
