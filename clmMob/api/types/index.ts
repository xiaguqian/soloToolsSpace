
export interface Tenant {
  id: number;
  name: string;
  logo: string;
  tel: string;
  business_hours: string;
  enable_takeout: number;
  min_delivery_amount: number;
  delivery_fee: number;
}

export interface DiningTable {
  id: number;
  tenant_id: number;
  table_name: string;
  qrcode_url: string;
  status: string;
}

export interface Category {
  id: number;
  tenant_id: number;
  name: string;
  sort_order: number;
}

export interface Product {
  id: number;
  tenant_id: number;
  category_id: number;
  name: string;
  price: number;
  image: string;
  stock: number;
  status: number;
  description: string;
}

export interface ProductSku {
  id: number;
  product_id: number;
  spec_name: string;
  price_extra: number;
}

export interface Order {
  id: number;
  tenant_id: number;
  order_no: string;
  type: string;
  table_id: number | null;
  address_id: number | null;
  total_amount: number;
  pay_status: string;
  order_status: string;
  pay_time: Date | null;
  create_time: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_name: string;
  price: number;
  quantity: number;
}

export interface UserAddress {
  id: number;
  tenant_id: number;
  user_phone: string;
  receiver: string;
  phone: string;
  address_detail: string;
  is_default: number;
}

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  spec_name?: string;
  price_extra?: number;
}
