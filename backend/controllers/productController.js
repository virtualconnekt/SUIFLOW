import Product from '../models/Product.js';
import dotenv from 'dotenv';
dotenv.config();

export const createProduct = async (req, res) => {
  try {
    const { name, description, priceInSui, merchantAddress, redirectURL } = req.body;
    
    // Validate and convert price
    const price = parseFloat(priceInSui);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ message: 'Invalid price. Price must be a positive number.' });
    }
    
    // Use a placeholder for paymentLink initially
    const product = new Product({
      name,
      description,
      priceInSui: price, // Use the validated number
      merchantAddress,
      redirectURL,
      paymentLink: 'placeholder'
    });
    
    await product.save();
    
    const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'https://suiflow.virtualconnekt.com.ng';
    product.paymentLink = `${frontendBaseUrl}/pay/${product._id}`;
    await product.save();
    
    console.log('Product created:', { name, priceInSui: price, merchantAddress });
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    // Get products only for the authenticated merchant
    const merchantId = req.merchant._id;
    const merchantWalletAddress = req.merchant.walletAddress;
    
    // Filter by both merchantAddress (wallet) and potentially merchantId for flexibility
    const products = await Product.find({ 
      $or: [
        { merchantAddress: merchantWalletAddress },
        { merchantId: merchantId }
      ]
    });
    
    console.log(`Fetching products for merchant ${merchantId} (${merchantWalletAddress}):`, products.length, 'products found');
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const merchantId = req.merchant._id;
    const merchantWalletAddress = req.merchant.walletAddress;
    
    // Find product and verify it belongs to the authenticated merchant
    const product = await Product.findOne({ 
      _id: req.params.id, 
      $or: [
        { merchantAddress: merchantWalletAddress },
        { merchantId: merchantId }
      ]
    });
    
    if (!product) {
      return res.status(404).json({ 
        message: 'Product not found or you do not have permission to delete it' 
      });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    console.log(`Product ${req.params.id} deleted by merchant ${merchantId}`);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
}; 