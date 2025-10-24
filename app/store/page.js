"use client";
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Alert,
} from '@mui/material';
import {
  ShoppingCart,
  School,
  ArrowBack,
  Delete,
  LocalShipping,
  Palette,
  Calculate,
  Science,
  MenuBook,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

// Sample curated educational products
const PRODUCTS = [
  {
    id: 1,
    name: 'مجموعة الحروف العربية المغناطيسية',
    category: 'language',
    categoryName: 'اللغة العربية',
    price: 89.99,
    image: '/store/arabic-magnets.jpg', // You'll need to add images
    description: 'حروف مغناطيسية ملونة لتعليم الأبجدية العربية بطريقة تفاعلية وممتعة',
    inStock: true,
    icon: <MenuBook />,
  },
  {
    id: 2,
    name: 'لوحة العمليات الحسابية',
    category: 'math',
    categoryName: 'الرياضيات',
    price: 129.99,
    image: '/store/math-board.jpg',
    description: 'لوحة تعليمية للجمع والطرح والضرب مع قطع متحركة للتعلم العملي',
    inStock: true,
    icon: <Calculate />,
  },
  {
    id: 3,
    name: 'مجموعة ألوان مائية احترافية للأطفال',
    category: 'arts',
    categoryName: 'الفنون',
    price: 69.99,
    image: '/store/watercolors.jpg',
    description: '24 لون مائي آمن للأطفال مع فرش وورق خاص للرسم',
    inStock: true,
    icon: <Palette />,
  },
  {
    id: 4,
    name: 'مجموعة التجارب العلمية المنزلية',
    category: 'science',
    categoryName: 'العلوم',
    price: 149.99,
    image: '/store/science-kit.jpg',
    description: 'أكثر من 15 تجربة علمية آمنة وممتعة لاكتشاف عجائب العلوم',
    inStock: true,
    icon: <Science />,
  },
  {
    id: 5,
    name: 'دفتر كتابة الحروف العربية',
    category: 'language',
    categoryName: 'اللغة العربية',
    price: 39.99,
    image: '/store/writing-book.jpg',
    description: 'دفتر تدريب على كتابة الحروف مع خطوط إرشادية ورسومات توضيحية',
    inStock: true,
    icon: <MenuBook />,
  },
  {
    id: 6,
    name: 'مكعبات الكسور التعليمية',
    category: 'math',
    categoryName: 'الرياضيات',
    price: 99.99,
    image: '/store/fraction-blocks.jpg',
    description: 'مكعبات ملونة لتعليم مفاهيم الكسور والأعداد بطريقة بصرية',
    inStock: false,
    icon: <Calculate />,
  },
];

const CATEGORY_COLORS = {
  language: '#3b82f6',
  math: '#22c55e',
  arts: '#ec4899',
  science: '#f59e0b',
};

export default function StorePage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = selectedCategory === 'all' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === selectedCategory);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 6 }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e5e7eb', py: 2, mb: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => router.push('/')} color="primary">
                <ArrowBack />
              </IconButton>
              <School sx={{ fontSize: 32, color: '#667eea' }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                متجر التعلم
              </Typography>
            </Box>
            <IconButton onClick={() => setCartOpen(true)} color="primary">
              <Badge badgeContent={cartItemCount} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Info Banner */}
        <Alert 
          severity="info" 
          sx={{ mb: 4, borderRadius: 3 }}
          icon={<School />}
        >
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            منتجات تعليمية مختارة بعناية لتعزيز تجربة التعلم - اختيارية بالكامل ولا تؤثر على استخدام المنصة
          </Typography>
        </Alert>

        {/* Category Filter */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Chip
            label="الكل"
            onClick={() => setSelectedCategory('all')}
            color={selectedCategory === 'all' ? 'primary' : 'default'}
            sx={{ fontWeight: selectedCategory === 'all' ? 'bold' : 'normal' }}
          />
          <Chip
            label="اللغة العربية"
            icon={<MenuBook />}
            onClick={() => setSelectedCategory('language')}
            sx={{ 
              bgcolor: selectedCategory === 'language' ? CATEGORY_COLORS.language : 'white',
              color: selectedCategory === 'language' ? 'white' : 'inherit',
              fontWeight: selectedCategory === 'language' ? 'bold' : 'normal',
            }}
          />
          <Chip
            label="الرياضيات"
            icon={<Calculate />}
            onClick={() => setSelectedCategory('math')}
            sx={{ 
              bgcolor: selectedCategory === 'math' ? CATEGORY_COLORS.math : 'white',
              color: selectedCategory === 'math' ? 'white' : 'inherit',
              fontWeight: selectedCategory === 'math' ? 'bold' : 'normal',
            }}
          />
          <Chip
            label="الفنون"
            icon={<Palette />}
            onClick={() => setSelectedCategory('arts')}
            sx={{ 
              bgcolor: selectedCategory === 'arts' ? CATEGORY_COLORS.arts : 'white',
              color: selectedCategory === 'arts' ? 'white' : 'inherit',
              fontWeight: selectedCategory === 'arts' ? 'bold' : 'normal',
            }}
          />
          <Chip
            label="العلوم"
            icon={<Science />}
            onClick={() => setSelectedCategory('science')}
            sx={{ 
              bgcolor: selectedCategory === 'science' ? CATEGORY_COLORS.science : 'white',
              color: selectedCategory === 'science' ? 'white' : 'inherit',
              fontWeight: selectedCategory === 'science' ? 'bold' : 'normal',
            }}
          />
        </Box>

        {/* Products Grid */}
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 24px ${CATEGORY_COLORS[product.category]}40`,
                  }
                }}
              >
                {/* Product Image Placeholder */}
                <Box
                  sx={{
                    height: 200,
                    bgcolor: `${CATEGORY_COLORS[product.category]}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: `3px solid ${CATEGORY_COLORS[product.category]}`,
                  }}
                >
                  <Box sx={{ '& svg': { fontSize: 80, color: CATEGORY_COLORS[product.category] } }}>
                    {product.icon}
                  </Box>
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Chip 
                    label={product.categoryName} 
                    size="small" 
                    sx={{ 
                      mb: 1,
                      bgcolor: `${CATEGORY_COLORS[product.category]}20`,
                      color: CATEGORY_COLORS[product.category],
                      fontWeight: 'bold',
                    }} 
                  />
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', color: '#1e293b' }}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {product.description}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: CATEGORY_COLORS[product.category] }}>
                    {product.price.toFixed(2)} ر.س
                  </Typography>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={!product.inStock}
                    onClick={() => addToCart(product)}
                    sx={{
                      bgcolor: CATEGORY_COLORS[product.category],
                      '&:hover': {
                        bgcolor: CATEGORY_COLORS[product.category],
                        filter: 'brightness(0.9)',
                      },
                    }}
                  >
                    {product.inStock ? 'أضف للسلة' : 'غير متوفر حالياً'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredProducts.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              لا توجد منتجات في هذه الفئة حالياً
            </Typography>
          </Box>
        )}
      </Container>

      {/* Shopping Cart Drawer */}
      <Drawer
        anchor="left"
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 400 } } }}
      >
        <Box sx={{ p: 2, bgcolor: '#667eea', color: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            سلة التسوق ({cartItemCount} منتج)
          </Typography>
        </Box>

        {cart.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <ShoppingCart sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
            <Typography color="text.secondary">
              السلة فارغة
            </Typography>
          </Box>
        ) : (
          <>
            <List sx={{ flexGrow: 1, overflow: 'auto' }}>
              {cart.map((item) => (
                <React.Fragment key={item.id}>
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" onClick={() => removeFromCart(item.id)}>
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={item.name}
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {item.price.toFixed(2)} ر.س
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              -
                            </Button>
                            <Typography>{item.quantity}</Typography>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              +
                            </Button>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>

            <Box sx={{ p: 2, bgcolor: '#f8f9fa' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">المجموع:</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                  {cartTotal.toFixed(2)} ر.س
                </Typography>
              </Box>
              <Alert severity="info" icon={<LocalShipping />} sx={{ mb: 2 }}>
                شحن مجاني للطلبات فوق 200 ر.س
              </Alert>
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ 
                  bgcolor: '#667eea',
                  '&:hover': { bgcolor: '#5568d3' },
                  mb: 1,
                }}
              >
                إتمام الطلب
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setCartOpen(false)}
              >
                متابعة التسوق
              </Button>
            </Box>
          </>
        )}
      </Drawer>
    </Box>
  );
}
