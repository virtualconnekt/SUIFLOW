import axios from 'axios';

// Centralized API base URL for frontend
const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || "https://suiflow-8zsg.onrender.com";

export const submitPayment = async (paymentData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/payments`, paymentData);
        return response.data;
    } catch (error) {
        throw new Error('Error submitting payment: ' + error.message);
    }
};

export const getPaymentStatus = async (paymentId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/payments/${paymentId}`);
        return response.data;
    } catch (error) {
        throw new Error('Error retrieving payment status: ' + error.message);
    }
};

export default API_BASE_URL;