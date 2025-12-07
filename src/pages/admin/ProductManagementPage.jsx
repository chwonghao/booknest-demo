import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Button, IconButton, Avatar, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid, FormControl, InputLabel, Select, MenuItem, TableSortLabel, TablePagination } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchProducts, createProductApi, updateProductApi } from '../../api/productApi';
import { useTranslation } from 'react-i18next';
import { fetchCategories } from '../../api/categoryApi';

const initialProductState = {
  externalId: '',
  name: '',
  authors: '',
  publisher: '',
  language: '',
  isbn: '',
  categoryId: '',
  pagesNumber: '',
  publishYear: '',
  publishMonth: '',
  publishDay: '',
  description: '',
  imageUrl: '',
  stockQuantity: '',
  price: '',
};

const ProductManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productFormData, setProductFormData] = useState(initialProductState);
  const [editingProductId, setEditingProductId] = useState(null);
  const [filters, setFilters] = useState({ search: '', categoryId: '' });
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getProducts = useCallback(async () => {
    try {
      setLoading(true);
      // Gọi fetchProducts không có tham số để lấy tất cả sản phẩm
      const data = await fetchProducts({});
      setProducts(data || []);
      setError(null);
    } catch (err) {
      setError(t('admin.productManagementPage.fetchError'));
      setProducts([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    getProducts();
    const getCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    getCategories();
  }, [getProducts]);

  const handleOpenModal = () => {
    setEditingProductId(null);
    setProductFormData(initialProductState);
    setIsModalOpen(true);
  };

  const handleEditClick = (product) => {
    setEditingProductId(product.id);
    // Ensure all fields in the form are controlled, even if product data is missing some.
    const formData = { ...initialProductState, ...product };
    setProductFormData(formData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProductId(null);
    setProductFormData(initialProductState);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProduct = async () => {
    try {
      if (editingProductId) {
        // Update existing product
        await updateProductApi(editingProductId, productFormData);
        toast.success(t('admin.productManagementPage.updateSuccess'));
      } else {
        // Create new product
        await createProductApi(productFormData);
        toast.success(t('admin.productManagementPage.addSuccess'));
      }
      handleCloseModal();
      getProducts(); // Refresh the product list
    } catch (apiError) {
      console.error('Failed to save product:', apiError);
      toast.error(t('admin.productManagementPage.saveError'));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSortRequest = (property) => {
    const isAsc = sortConfig.key === property && sortConfig.direction === 'asc';
    setSortConfig({ key: property, direction: isAsc ? 'desc' : 'asc' });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredAndSortedProducts = useMemo(() => {
    let sortableItems = [...products];

    // Filtering
    if (filters.search) {
      sortableItems = sortableItems.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.categoryId) {
      sortableItems = sortableItems.filter(product => product.categoryId === filters.categoryId);
    }

    // Sorting
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [products, filters, sortConfig]);

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h4" gutterBottom>{t('admin.productManagementPage.title')}</Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={handleOpenModal}>
        {t('admin.productManagementPage.addNewProduct')}
      </Button>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          name="search"
          label={t('admin.productManagementPage.searchPlaceholder')}
          variant="outlined"
          size="small"
          value={filters.search}
          onChange={handleFilterChange}
          sx={{ flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>{t('home.categories')}</InputLabel>
          <Select
            name="categoryId"
            value={filters.categoryId}
            label={t('home.categories')}
            onChange={handleFilterChange}
            MenuProps={{ disableScrollLock: true }}
          >
            <MenuItem value=""><em>{t('admin.productManagementPage.allCategories')}</em></MenuItem>
            {categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {/* Product Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5}}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '10%' }}>{t('productPage.image')}</TableCell>
                  <TableCell sortDirection={sortConfig.key === 'name' ? sortConfig.direction : false}>
                    <TableSortLabel active={sortConfig.key === 'name'} direction={sortConfig.key === 'name' ? sortConfig.direction : 'asc'} onClick={() => handleSortRequest('name')}>
                      {t('productPage.name')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>{t('productPage.categories')}</TableCell>
                  <TableCell align="right" sortDirection={sortConfig.key === 'price' ? sortConfig.direction : false}>
                    <TableSortLabel active={sortConfig.key === 'price'} direction={sortConfig.key === 'price' ? sortConfig.direction : 'asc'} onClick={() => handleSortRequest('price')}>
                      {t('productPage.price')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sortDirection={sortConfig.key === 'stockQuantity' ? sortConfig.direction : false}>
                    <TableSortLabel active={sortConfig.key === 'stockQuantity'} direction={sortConfig.key === 'stockQuantity' ? sortConfig.direction : 'asc'} onClick={() => handleSortRequest('stockQuantity')}>
                      {t('productPage.stockRemaining', { count: '' }).replace('{{count}}', '').trim()}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">{t('profile.settings')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedProducts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((product) => (
                  <TableRow hover key={product.id}>
                    <TableCell>
                      <Avatar variant="square" src={product.imageUrl} alt={product.name} sx={{ width: 56, height: 56 }} />
                    </TableCell>
                    <TableCell onClick={() => handleEditClick(product)} sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                      {product.name}
                    </TableCell>
                    <TableCell>{product.categoryName || 'N/A'}</TableCell>
                    <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                    <TableCell align="right">{product.stockQuantity}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleEditClick(product)}><EditIcon /></IconButton>
                      <IconButton color="error"><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredAndSortedProducts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            SelectProps={{
              MenuProps: {
                disableScrollLock: true,
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'left',
                },
                transformOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left',
                },
              },
            }}
          />
        </>
      )}

      {/* Add/Edit Product Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth disableScrollLock={true}  >
        <DialogTitle>{editingProductId ? t('admin.userManagementPage.editUser') : t('admin.productManagementPage.addNewProduct')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t('register.fullName')} name="name" value={productFormData.name} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t('productPage.byAuthor', { authors: '' }).replace('by ', '')} name="authors" value={productFormData.authors} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t('productPage.publisher')} name="publisher" value={productFormData.publisher} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label={t('productPage.language')} name="language" value={productFormData.language} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label={t('productPage.isbn')} name="isbn" value={productFormData.isbn} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label={t('home.categories') + ' ID'} name="categoryId" type="number" value={productFormData.categoryId} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label={t('productPage.pages')} name="pagesNumber" type="number" value={productFormData.pagesNumber} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label={t('productPage.published') + ' Year'} name="publishYear" type="number" value={productFormData.publishYear} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label={t('productPage.published') + ' Month'} name="publishMonth" type="number" value={productFormData.publishMonth} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label={t('productPage.published') + ' Day'} name="publishDay" type="number" value={productFormData.publishDay} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label={t('productPage.quantity')} name="stockQuantity" type="number" value={productFormData.stockQuantity} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label={t('productPage.price')} name="price" type="number" value={productFormData.price} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="External ID" name="externalId" value={productFormData.externalId} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label={t('productPage.description')}
                name="description"
                value={productFormData.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('productPage.image') + ' URL'}
                name="imageUrl"
                value={productFormData.imageUrl}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>{t('action.cancel')}</Button>
          <Button onClick={handleSaveProduct} variant="contained">{t('action.saveChanges')}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ProductManagementPage;