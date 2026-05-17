const API_BASE = 'http://localhost:8021/api';

export interface Tenant {
  id: number;
  name: string;
  logo: string;
  status: number;
  config_json: string;
  created_at: string;
}

export interface Product {
  id: number;
  tenant_id: number;
  name: string;
  price: number;
  stock: number;
  status: number;
  image_url: string;
  description: string;
  category: string;
  created_at: string;
}

export interface Banner {
  id: number;
  tenant_id: number;
  image_url: string;
  link_url: string;
  sort_order: number;
  status: number;
  created_at: string;
}

export interface Category {
  id: number;
  tenant_id: number;
  name: string;
  icon: string;
  sort_order: number;
  status: number;
  created_at: string;
}

export interface Order {
  id: number;
  tenant_id: number;
  end_user_id: number;
  total_amount: number;
  status: string;
  order_no: string;
  address: string;
  items: string;
  created_at: string;
  updated_at: string;
}

export interface EndUser {
  id: number;
  tenant_id: number;
  openid: string;
  phone: string;
  nickname: string;
  address_list: string;
  created_at: string;
}

export async function getTenants(): Promise<Tenant[]> {
  const response = await fetch(`${API_BASE}/tenant`);
  const data = await response.json();
  return data.data;
}

export async function getTenantById(id: number): Promise<Tenant> {
  const response = await fetch(`${API_BASE}/tenant/${id}`);
  const data = await response.json();
  return data.data;
}

export async function getProducts(tenantId: number, category?: string, keyword?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (keyword) params.append('keyword', keyword);
  const response = await fetch(`${API_BASE}/product/tenant/${tenantId}?${params}`);
  const data = await response.json();
  return data.data;
}

export async function getProductById(id: number): Promise<Product> {
  const response = await fetch(`${API_BASE}/product/${id}`);
  const data = await response.json();
  return data.data;
}

export async function getCategories(tenantId: number): Promise<Category[]> {
  const response = await fetch(`${API_BASE}/product/tenant/${tenantId}/categories`);
  const data = await response.json();
  return data.data;
}

export async function getBanners(tenantId: number): Promise<Banner[]> {
  const response = await fetch(`${API_BASE}/banner/tenant/${tenantId}`);
  const data = await response.json();
  return data.data;
}

export async function loginEndUser(tenantId: number, phone: string): Promise<EndUser> {
  const response = await fetch(`${API_BASE}/end-user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, phone }),
  });
  const data = await response.json();
  return data.data;
}

export async function updateEndUser(id: number, data: { nickname?: string; address_list?: string }): Promise<EndUser> {
  const response = await fetch(`${API_BASE}/end-user/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result.data;
}

export async function getEndUser(id: number): Promise<EndUser> {
  const response = await fetch(`${API_BASE}/end-user/${id}`);
  const data = await response.json();
  return data.data;
}

export async function createOrder(
  tenantId: number,
  endUserId: number,
  items: { productId: number; name: string; price: number; quantity: number }[],
  totalAmount: number,
  address: any
): Promise<Order> {
  const response = await fetch(`${API_BASE}/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, endUserId, items, totalAmount, address }),
  });
  const data = await response.json();
  return data.data;
}

export async function getOrdersByUser(userId: number): Promise<Order[]> {
  const response = await fetch(`${API_BASE}/order/user/${userId}`);
  const data = await response.json();
  return data.data;
}

export async function getOrderById(id: number): Promise<Order> {
  const response = await fetch(`${API_BASE}/order/${id}`);
  const data = await response.json();
  return data.data;
}

export async function cancelOrder(id: number): Promise<void> {
  await fetch(`${API_BASE}/order/${id}/cancel`, { method: 'PUT' });
}

export async function payOrder(id: number): Promise<void> {
  await fetch(`${API_BASE}/order/${id}/pay`, { method: 'PUT' });
}

export async function staffLogin(phone: string, password: string): Promise<{ id: number; tenant_id: number; phone: string; role: string }> {
  const response = await fetch(`${API_BASE}/staff/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  const data = await response.json();
  return data.data;
}