import React, { useContext } from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Button, Chip, CardActionArea } from '@mui/material';
import { useTranslation } from 'react-i18next';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Link as RouterLink } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';

const ProductCard = ({ product, showAddToCartButton = true }) => {
    const { t, i18n } = useTranslation();
    const { addItem } = useContext(CartContext);
    // Mock discount calculation if originalPrice is available
    const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    const isOutOfStock = product.stockQuantity === 0;

    const handleAddToCart = (e) => {
        e.preventDefault(); // Stop the card's navigation event
        e.stopPropagation(); // Stop event bubbling
        addItem(product);
        toast.success(t('product.addedToCart', { name: product.name }));
    };

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

    return (
        <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            opacity: isOutOfStock ? 0.6 : 1,
            position: 'relative'
        }}>
            <CardActionArea component={RouterLink} to={`/products/${product.id}`} sx={{ flexGrow: 1 }}>
                <Box sx={{ position: 'relative' }}>
                    <CardMedia
                        component="img"
                        height="240"
                        image={product.imageUrl} // Placeholder image
                        alt={product.name}
                    />
                    {discount > 0 && (
                        <Chip 
                            label={`-${discount}%`} 
                            color="secondary" 
                            size="small"
                            sx={{ position: 'absolute', top: 8, right: 8, fontWeight: 'bold' }} 
                        />
                    )}
                    {isOutOfStock && (
                        <Chip 
                            label={t('product.outOfStock')}
                            color="error" 
                            size="small"
                            sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 'bold' }} 
                        />
                    )}
                </Box>
                <CardContent>
                    <Typography gutterBottom variant="h6" component="div" noWrap title={product.name}>
                        {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                        {/* FIX: product.authors is an array of objects. We need to map over it to get the names. */}
                        {(Array.isArray(product.authors) && product.authors.length > 0)
                            ? product.authors.map(author => author.name).join(', ')
                            : t('product.unknownAuthor')
                        }
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h5" color="primary.main" fontWeight="bold">
                            {formatPrice(product.price)}
                        </Typography>
                        {discount > 0 && (
                            <Typography variant="body2" sx={{ textDecoration: 'line-through' }} color="text.secondary">
                                {formatPrice(product.originalPrice)}
                            </Typography>
                        )}
                    </Box>
                </CardContent>
            </CardActionArea>
            {showAddToCartButton && (
                <Box sx={{ p: 2, pt: 0 }}>
                    <Button 
                        fullWidth 
                        variant="contained" 
                        color="primary" 
                        startIcon={isOutOfStock ? <RemoveShoppingCartIcon /> : <AddShoppingCartIcon />}
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        sx={{ bgcolor: isOutOfStock ? 'grey.400' : 'primary.main' }}
                    >
                        {isOutOfStock ? t('product.outOfStock') : t('product.addToCart')}
                    </Button>
                </Box>
            )}
        </Card>
    );
}

export default ProductCard;
