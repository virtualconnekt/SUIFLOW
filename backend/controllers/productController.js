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
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
}; 