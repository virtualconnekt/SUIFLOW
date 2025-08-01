# 🔧 Backend Environment Variable Fix

## Issue: Payment Links Using Localhost
**Problem:** Product checkout links were generated as `http://localhost:5173/pay/{productId}` instead of your custom domain.

## ✅ Fix Applied

### 1. Updated Backend Environment
Added `FRONTEND_BASE_URL=https://suiflow.app` to backend `.env` file and pushed to trigger redeployment.

### 2. Set Environment Variable on Render (REQUIRED)
**You need to manually add this environment variable on Render:**

1. **Go to Render Dashboard:** https://dashboard.render.com
2. **Select your SuiFlow backend service**
3. **Go to Environment tab**
4. **Add new environment variable:**
   - **Key:** `FRONTEND_BASE_URL`
   - **Value:** `https://suiflow.app` (or your actual custom domain)
5. **Save** - This will trigger an automatic redeployment

### 3. Verification
After the Render redeployment completes:
- New products will generate links like: `https://suiflow.app/pay/{productId}`
- Existing products may need to be recreated to get updated links

## 📝 Code Location
The payment link generation happens in:
`backend/controllers/productController.js` line 28:
```javascript
const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
product.paymentLink = `${frontendBaseUrl}/pay/${product._id}`;
```

## 🚀 Next Steps
1. **Set environment variable on Render** (critical step)
2. **Wait for automatic redeployment** (~2-3 minutes)
3. **Test creating a new product** to verify correct payment link generation
4. **Deploy updated frontend** to your custom domain

Once both frontend and backend are deployed with correct configurations, all payment links will use your production domain!
