
import axios from 'axios';
import { Tenant, Category, Product, Order, UserAddress, CartItem } from '../types';

const API_BASE_URL = 'http://localhost:8011/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const tenantApi = {
  getAll: async (): Promise<Tenant[]> => {
    const response = await api.get('/tenants');
    return response.data;
  },

  getById: async (id: number): Promise<Tenant> => {
    const response = await api.get(`/tenants/${id}`);
    return response.data;
  },
};

export const productApi = {
  getCategories: async (tenantId: number): Promise<Category[]> => {
    const response = await api.get(`/${tenantId}/categories`);
    return response.data;
  },

  getProducts: async (tenantId: number, categoryId?: number, keyword?: string): Promise<Product[]> => {
    const params: Record<string, string | number> = {};
    if (categoryId) params.categoryId = categoryId;
    if (keyword) params.keyword = keyword;
    
    const response = await api.get(`/${tenantId}/products`, { params });
    return response.data;
  },

  getProductById: async (tenantId: number, productId: number): Promise<Product> => {
    const response = await api.get(`/${tenantId}/products/${productId}`);
    return response.data;
  },
};

export const orderApi = {
  create: async (
    tenantId: number,
    type: string,
    tableId: number | null,
    addressId: number | null,
    items: CartItem[],
    totalAmount: number
  ): Promise<{ order_id: number; order_no: string }> => {
    const response = await api.post('/orders', {
      tenant_id: tenantId,
      type,
      table_id: tableId,
      address_id: addressId,
      items,
      total_amount: totalAmount,
    });
    return response.data;
  },

  getAll: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data;
  },

  getById: async (orderId: number): Promise<Order> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  pay: async (orderId: number): Promise<{ success: boolean }> => {
    const response = await api.post(`/orders/${orderId}/pay`);
    return response.data;
  },

  cancel: async (orderId: number): Promise<{ success: boolean }> => {
    const response = await api.post(`/orders/${orderId}/cancel`);
    return response.data;
  },
};

export const addressApi = {
  getAll: async (phone?: string): Promise<UserAddress[]> => {
    const params: Record<string, string> = {};
    if (phone) params.phone = phone;
    const response = await api.get('/addresses', { params });
    return response.data;
  },

  create: async (
    tenantId: number,
    userPhone: string,
    receiver: string,
    phone: string,
    addressDetail: string,
    isDefault: boolean
  ): Promise<{ id: number }> => {
    const response = await api.post('/addresses', {
      tenant_id: tenantId,
      user_phone: userPhone,
      receiver,
      phone,
      address_detail: addressDetail,
      is_default: isDefault,
    });
    return response.data;
  },

  update: async (
    id: number,
    receiver: string,
    phone: string,
    addressDetail: string,
    isDefault: boolean
  ): Promise<{ success: boolean }> => {
    const response = await api.put(`/addresses/${id}`, {
      receiver,
      phone,
      address_detail: addressDetail,
      is_default: isDefault,
    });
    return response.data;
  },

  delete: async (id: number): Promise<{ success: boolean }> => {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },
};
