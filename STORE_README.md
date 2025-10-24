# متجر التعلم - Learning Store

## Overview
A curated educational products dropshipping section integrated into the Taallam learning platform.

## Features

### Current Implementation
- ✅ Separate store page (`/store`)
- ✅ Category-based filtering (Math, Arabic, Science, Arts)
- ✅ Shopping cart with quantity management
- ✅ Educational product catalog
- ✅ Optional - doesn't interfere with core learning
- ✅ Clear messaging that it's not required

### Product Categories
1. **اللغة العربية (Arabic Language)**
   - Magnetic Arabic letters
   - Writing workbooks
   - Flashcards

2. **الرياضيات (Mathematics)**
   - Math operation boards
   - Fraction blocks
   - Number manipulatives

3. **الفنون (Arts)**
   - Watercolor sets
   - Drawing supplies
   - Creative kits

4. **العلوم (Science)**
   - Science experiment kits
   - Educational models
   - STEM toys

## Next Steps for Full Implementation

### 1. Product Images
Add actual product images to `/public/store/`:
- arabic-magnets.jpg
- math-board.jpg
- watercolors.jpg
- science-kit.jpg
- writing-book.jpg
- fraction-blocks.jpg

### 2. Backend Integration
Choose a dropshipping provider:
- **Option A: Printful** - Good for custom educational materials
- **Option B: Spocket** - Middle East suppliers
- **Option C: AliExpress** - Wide product range

### 3. Payment Gateway
Integrate payment processing:
```javascript
// Recommended for Saudi Arabia
- Moyasar (local, supports Mada/Visa/Mastercard)
- Stripe (international)
- PayTabs (regional)
```

### 4. Order Management
Create order tracking system:
- Order history page
- Email notifications
- Order status tracking
- Admin dashboard

### 5. Shipping Configuration
Set up shipping rules:
- Free shipping threshold (currently 200 SAR)
- Delivery time estimates
- Multiple shipping options
- International shipping if needed

## File Structure
```
app/
  store/
    page.js          # Main store page
components/
  Header.js          # Updated with store link
public/
  store/             # Product images (to be added)
```

## Usage

Users can access the store by:
1. Clicking "متجر التعلم" in the header
2. Browsing products by category
3. Adding items to cart
4. Proceeding to checkout

The store is completely optional and clearly marked as such, ensuring it doesn't disrupt the core learning experience.

## Customization

To add new products, edit the `PRODUCTS` array in `/app/store/page.js`:

```javascript
{
  id: 7,
  name: 'Product Name',
  category: 'math', // or 'language', 'arts', 'science'
  categoryName: 'Category Display Name',
  price: 99.99,
  image: '/store/product-image.jpg',
  description: 'Product description',
  inStock: true,
  icon: <IconComponent />,
}
```

## Design Principles

1. **Non-intrusive**: Store is separate from learning paths
2. **Educational focus**: Only sell products that enhance learning
3. **Clear messaging**: Users know it's optional
4. **Quality curation**: Few, carefully selected products
5. **Seamless integration**: Matches platform design language
