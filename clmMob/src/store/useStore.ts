
import { create } from 'zustand';
import { Tenant, CartItem, UserAddress, DiningTable } from '../types';

interface AppState {
  currentTenant: Tenant | null;
  currentTable: DiningTable | null;
  orderMode: 'dine_in' | 'takeout';
  cart: CartItem[];
  takeoutCart: CartItem[];
  userPhone: string;
  addresses: UserAddress[];
  selectedAddress: UserAddress | null;

  setCurrentTenant: (tenant: Tenant | null) => void;
  setCurrentTable: (table: DiningTable | null) => void;
  setOrderMode: (mode: 'dine_in' | 'takeout') => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number, specName?: string) => void;
  updateCartItemQuantity: (productId: number, quantity: number, specName?: string) => void;
  clearCart: () => void;
  setUserPhone: (phone: string) => void;
  setAddresses: (addresses: UserAddress[]) => void;
  setSelectedAddress: (address: UserAddress | null) => void;
  getCurrentCart: () => CartItem[];
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useStore = create<AppState>((set, get) => ({
  currentTenant: null,
  currentTable: null,
  orderMode: 'dine_in',
  cart: [],
  takeoutCart: [],
  userPhone: '13800138000',
  addresses: [],
  selectedAddress: null,

  setCurrentTenant: (tenant) => set({ currentTenant: tenant }),
  setCurrentTable: (table) => set({ currentTable: table }),
  setOrderMode: (mode) => set({ orderMode: mode }),
  setUserPhone: (phone) => set({ userPhone: phone }),
  setAddresses: (addresses) => set({ addresses }),
  setSelectedAddress: (address) => set({ selectedAddress: address }),

  addToCart: (item) => {
    const { orderMode, cart, takeoutCart } = get();
    const targetCart = orderMode === 'dine_in' ? cart : takeoutCart;
    
    const existingIndex = targetCart.findIndex(
      (i) => i.product_id === item.product_id && i.spec_name === item.spec_name
    );

    if (existingIndex >= 0) {
      const newCart = [...targetCart];
      newCart[existingIndex] = {
        ...newCart[existingIndex],
        quantity: newCart[existingIndex].quantity + item.quantity,
      };
      if (orderMode === 'dine_in') {
        set({ cart: newCart });
      } else {
        set({ takeoutCart: newCart });
      }
    } else {
      if (orderMode === 'dine_in') {
        set({ cart: [...cart, item] });
      } else {
        set({ takeoutCart: [...takeoutCart, item] });
      }
    }
  },

  removeFromCart: (productId, specName) => {
    const { orderMode, cart, takeoutCart } = get();
    if (orderMode === 'dine_in') {
      set({
        cart: cart.filter((item) => !(item.product_id === productId && item.spec_name === specName)),
      });
    } else {
      set({
        takeoutCart: takeoutCart.filter((item) => !(item.product_id === productId && item.spec_name === specName)),
      });
    }
  },

  updateCartItemQuantity: (productId, quantity, specName) => {
    const { orderMode, cart, takeoutCart } = get();
    if (orderMode === 'dine_in') {
      if (quantity <= 0) {
        set({
          cart: cart.filter((item) => !(item.product_id === productId && item.spec_name === specName)),
        });
      } else {
        set({
          cart: cart.map((item) =>
            item.product_id === productId && item.spec_name === specName
              ? { ...item, quantity }
              : item
          ),
        });
      }
    } else {
      if (quantity <= 0) {
        set({
          takeoutCart: takeoutCart.filter((item) => !(item.product_id === productId && item.spec_name === specName)),
        });
      } else {
        set({
          takeoutCart: takeoutCart.map((item) =>
            item.product_id === productId && item.spec_name === specName
              ? { ...item, quantity }
              : item
          ),
        });
      }
    }
  },

  clearCart: () => {
    const { orderMode } = get();
    if (orderMode === 'dine_in') {
      set({ cart: [] });
    } else {
      set({ takeoutCart: [] });
    }
  },

  getCurrentCart: () => {
    const { orderMode, cart, takeoutCart } = get();
    return orderMode === 'dine_in' ? cart : takeoutCart;
  },

  getCartTotal: () => {
    const currentCart = get().getCurrentCart();
    return currentCart.reduce(
      (total, item) => total + (item.price + (item.price_extra || 0)) * item.quantity,
      0
    );
  },

  getCartCount: () => {
    const currentCart = get().getCurrentCart();
    return currentCart.reduce((total, item) => total + item.quantity, 0);
  },
}));
