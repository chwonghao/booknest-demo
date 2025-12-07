import React, { useContext } from 'react';
import { Box, Typography, Grid, IconButton, TextField, Paper, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { CartContext } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { t, i18n } = useTranslation();
  const { updateQty, deleteItem } = useContext(CartContext);

  const handleQuantityChange = (newQuantity) => {
    const quantity = parseInt(newQuantity, 10);
    if (!isNaN(quantity) && quantity > 0 && quantity <= item.stockQuantity) {
      updateQty(item.id, quantity);
    } else if (newQuantity === '') {
      // Allow clearing the field, but don't update context with empty value
    }
  };

  const adjustQuantity = (amount) => {
    const newQuantity = item.qty + amount;
    if (newQuantity > 0 && newQuantity <= item.stockQuantity) {
      updateQty(item.id, newQuantity);
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '';
    const currentLang = i18n.language.split('-')[0];
    if (currentLang === 'vi') {
      const vndPrice = price * 25000;
      return `${vndPrice.toLocaleString('vi-VN')} ₫`;
    }
    return `$${price.toFixed(2)}`;
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Product Image */}
        <Grid item xs={3} sm={2}>
          <Link component={RouterLink} to={`/products/${item.id}`}>
            <Box
              component="img"
              src={item.imageUrl}
              alt={item.name}
              sx={{
                width: '100%',
                height: 'auto',
                aspectRatio: '2/3',
                objectFit: 'cover',
                borderRadius: 1,
              }}
            />
          </Link>
        </Grid>

        {/* Product Details */}
        <Grid item xs={9} sm={5}>
          <Typography variant="h6" component="div" fontWeight="bold">
            <Link component={RouterLink} to={`/products/${item.id}`} color="inherit" sx={{ textDecoration: 'none' }}>
              {item.name}
            </Link>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {item.authors}
          </Typography>
          <Typography variant="h6" color="primary.main" sx={{ mt: 1 }}>
            {formatPrice(item.price)}
          </Typography>
        </Grid>

        {/* Quantity Controls */}
        <Grid item xs={9} sm={3} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton onClick={() => adjustQuantity(-1)} disabled={item.qty <= 1} size="small">
            <RemoveCircleOutlineIcon />
          </IconButton>
          <TextField
            value={item.qty}
            onChange={(e) => handleQuantityChange(e.target.value)}
            size="small"
            sx={{ width: '60px', mx: 1, '& input': { textAlign: 'center' } }}
            inputProps={{ min: 1, max: item.stockQuantity }}
          />
          <IconButton onClick={() => adjustQuantity(1)} disabled={item.qty >= item.stockQuantity} size="small">
            <AddCircleOutlineIcon />
          </IconButton>
        </Grid>

        {/* Remove Button & Total Price */}
        <Grid item xs={3} sm={2} sx={{ textAlign: 'right' }}>
          <Typography variant="h6" fontWeight="bold">{formatPrice(item.price * item.qty)}</Typography>
          <IconButton onClick={() => deleteItem(item.id)} color="error" size="small" sx={{ mt: 1 }} title={t('cart.removeItem')}>
            <DeleteForeverIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CartItem;