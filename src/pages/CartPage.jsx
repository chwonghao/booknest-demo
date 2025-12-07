import React, { useContext, useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Button, Divider, Grid, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import CartItem from '../components/CartItem';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import BreadcrumbsComponent from '../components/BreadcrumbsComponent';
import { fetchProduct } from '../api/productApi';

const CartPage = () => {
  const { t, i18n } = useTranslation();
  const { items, total, cartCount } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isStockLoading, setIsStockLoading] = useState(true);
  const [inStockItems, setInStockItems] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [isCheckoutDisabled, setIsCheckoutDisabled] = useState(false);

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '';
    const currentLang = i18n.language.split('-')[0];
    if (currentLang === 'vi') {
      // Tạm thời giả định tỉ giá 1 USD = 25,000 VND.
      const vndPrice = price * 25000;
      return `${vndPrice.toLocaleString('vi-VN')} ₫`;
    }
    return `$${price.toFixed(2)}`;
  };

  useEffect(() => {
    const fetchItemDetails = async () => {
      if (items.length === 0) {
        setInStockItems([]);
        setOutOfStockItems([]);
        setIsStockLoading(false);
        setIsCheckoutDisabled(true);
        return;
      }

      setIsStockLoading(true);
      try {
        const itemPromises = items.map(item => fetchProduct(item.id));
        const productsDetails = await Promise.all(itemPromises);

        const newInStockItems = [];
        const newOutOfStockItems = [];
        let checkoutShouldBeDisabled = false;

        items.forEach((cartItem, index) => {
          const productDetail = productsDetails[index];
          const detailedItem = { ...cartItem, ...productDetail };

          if (productDetail.stockQuantity === 0) {
            newOutOfStockItems.push(detailedItem);
          } else {
            newInStockItems.push(detailedItem);
            if (cartItem.qty > productDetail.stockQuantity) {
              checkoutShouldBeDisabled = true;
            }
          }
        });

        setInStockItems(newInStockItems);
        setOutOfStockItems(newOutOfStockItems);
        setIsCheckoutDisabled(checkoutShouldBeDisabled || newInStockItems.length === 0);
      } catch (error) {
        console.error("Failed to fetch product details for cart:", error);
        toast.error("Could not verify item stock. Please try again.");
        setIsCheckoutDisabled(true); // Disable checkout on error
      } finally {
        setIsStockLoading(false);
      }
    };

    fetchItemDetails();
  }, [items]);
  
  const handleCheckout = () => {
    setIsCheckingOut(true);
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/checkout', message: t('cart.summary.loginPrompt') } });
    }
    // Không cần setIsCheckingOut(false) vì trang sẽ được chuyển hướng
  };

  return (
    <Container maxWidth="lg">
      <BreadcrumbsComponent links={[{ label: t('breadcrumbs.cart') }]} sx={{ my: 3 }} />
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
            <Typography variant="h5" component="h1" gutterBottom display="flex" alignItems="center" fontWeight="bold">
              <ShoppingCartIcon sx={{ mr: 2 }} /> {t('cart.title')} ({t('cart.itemCount', { count: cartCount })})
            </Typography>
            <Divider sx={{ my: 3 }} />
            {isStockLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : items.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" gutterBottom>
                  {t('cart.empty.title')}
                </Typography>
                <Typography color="text.secondary" mb={3}>
                  {t('cart.empty.subtitle')}
                </Typography>
                <Button component={Link} to="/" variant="contained" color="primary">
                  {t('cart.continueShopping')}
                </Button>
              </Box>
            ) : (
              <Box>
                {inStockItems.map(item => (
                  <CartItem key={item.id} item={item} isStockIssue={item.qty > item.stockQuantity} />
                ))}
                {outOfStockItems.length > 0 && (
                  <>
                    <Divider sx={{ my: 4 }}>
                      <Typography variant="h6" color="text.secondary">{t('cart.unavailableItems')}</Typography>
                    </Divider>
                    {outOfStockItems.map(item => (
                      <CartItem key={item.id} item={item} isOutOfStock={true} />
                    ))}
                  </>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} variant="outlined" sx={{ p: 3, position: 'sticky', top: 88, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">{t('cart.summary.title')}</Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">{t('cart.summary.subtotal', { count: cartCount })}</Typography>
              <Typography fontWeight="bold">{formatPrice(total)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="text.secondary">{t('cart.summary.shipping')}</Typography>
              <Typography fontWeight="bold">{t('cart.summary.free')}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold">{t('cart.summary.total')}</Typography>
              <Typography variant="h5" fontWeight="bold">{formatPrice(total)}</Typography>
            </Box>
            <Button 
              fullWidth 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={handleCheckout}
              disabled={isCheckoutDisabled || isCheckingOut || isStockLoading}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              {isCheckingOut ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('cart.proceedToCheckout')
              )}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;
