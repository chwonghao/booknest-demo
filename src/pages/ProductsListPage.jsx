import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Typography, Grid, CircularProgress, Box, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { fetchProducts } from '../api/productApi';
import { fetchCategories, fetchProductsByCategory } from '../api/categoryApi';
import BreadcrumbsComponent from '../components/BreadcrumbsComponent';
import ProductCard from '../components/ProductCard';

const ProductsListPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageTitle, setPageTitle] = useState(t('productsListPage.title'));
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  const categoryId = searchParams.get('category');
  const searchQuery = searchParams.get('q');

  useEffect(() => {
    const getProductsAndTitle = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (categoryId) {
          // Lấy tên danh mục để làm tiêu đề trang
          const categories = await fetchCategories();
          const category = categories.find(cat => cat.id.toString() === categoryId);
          if (category) {
            setPageTitle(category.name);
            setBreadcrumbs([{ label: category.name }]);
          }
          // Sử dụng hàm mới để lấy sản phẩm theo danh mục
          data = await fetchProductsByCategory(categoryId);
        } else if (searchQuery) {
          const title = `${t('productsListPage.searchResultsFor')} "${searchQuery}"`;
          setPageTitle(title);
          setBreadcrumbs([{ label: title }]);
          // Giữ nguyên hàm fetchProducts cho chức năng tìm kiếm
          data = await fetchProducts({ search: searchQuery });
        } else {
          data = await fetchProducts({});
          setPageTitle(t('productsListPage.title'));
          setBreadcrumbs([{ label: t('breadcrumbs.products') }]);
        }
        setProducts(data || []);
      } catch (err) {
        setError(t('productsListPage.fetchError'));
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    getProductsAndTitle();
  }, [categoryId, searchQuery, t]);

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <BreadcrumbsComponent links={breadcrumbs} />
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        {pageTitle}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : products.length > 0 ? (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">{t('productsListPage.noResults')}</Typography>
          <Typography color="text.secondary">{t('productsListPage.noResultsSubtitle')}</Typography>
        </Paper>
      )}
    </Container>
  );
};

export default ProductsListPage;
