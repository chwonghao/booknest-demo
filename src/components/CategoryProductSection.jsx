import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, CircularProgress, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { fetchProducts } from '../api/productApi';
import ProductCard from './ProductCard';

const CategoryProductSection = ({ category, showAddToCartButton = true }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts({ categoryId: category.id, limit: 4 });
        const sortedData = (data || []).sort((a, b) => {
          if (a.stockQuantity > 0 && b.stockQuantity === 0) {
            return -1;
          }
          if (a.stockQuantity === 0 && b.stockQuantity > 0) {
            return 1;
          }
          return 0;
        });
        setProducts(sortedData);
      } catch (err) {
        console.error(`Failed to fetch products for category ${category.name}:`, err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, [category]);

  if (loading) {
    return <CircularProgress sx={{ display: 'block', margin: 'auto', my: 4 }} />;
  }

  if (products.length === 0) {
    return null; // Không hiển thị gì nếu danh mục không có sản phẩm
  }

  return (
    <Box component="section" sx={{ mb: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          {category.name}
        </Typography>
        <Button component={RouterLink} to={`/products?category=${category.id}`}>Xem thêm</Button>
      </Box>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <ProductCard product={product} showAddToCartButton={showAddToCartButton} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CategoryProductSection;