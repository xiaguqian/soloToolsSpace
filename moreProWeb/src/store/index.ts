import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  tenantId: number;
}

export interface Address {
  id: number;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

export interface EndUser {
  id: number;
  tenantId: number;
  phone: string;
  nickname: string;
  addressList: Address[];
}

export interface Tenant {
  id: number;
  name: string;
  logo: string;
  configJson: string;
}

interface StoreState {
  tenant: Tenant | null;
  user: EndUser | null;
  cart: CartItem[];
  selectedAddress: Address | null;
  
  setTenant: (tenant: Tenant) => void;
  setUser: (user: EndUser) => void;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  setSelectedAddress: (address: Address | null) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (address: Address) => void;
  removeAddress: (addressId: number) => void;
  logout: () => void;
}

export const useStore = create(
  persist<StoreState>(
    (set, get) => ({
      tenant: null,
      user: null,
      cart: [],
      selectedAddress: null,

      setTenant: (tenant) => set({ tenant }),

      setUser: (user) => set({ user }),

      addToCart: (item) => {
        const cart = get().cart;
        const existingItem = cart.find((i) => i.productId === item.productId);
        if (existingItem) {
          set({
            cart: cart.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ cart: [...cart, { ...item, id: Date.now() }] });
        }
      },

      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((i) => i.productId !== productId) });
      },

      updateCartQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
        } else {
          set({
            cart: get().cart.map((i) =>
              i.productId === productId ? { ...i, quantity } : i
            ),
          });
        }
      },

      clearCart: () => set({ cart: [] }),

      setSelectedAddress: (address) => set({ selectedAddress: address }),

      addAddress: (address) => {
        const user = get().user;
        if (user) {
          const newAddress: Address = { ...address, id: Date.now() };
          const updatedAddresses = [...user.addressList, newAddress];
          set({
            user: { ...user, addressList: updatedAddresses },
          });
        }
      },

      updateAddress: (address) => {
        const user = get().user;
        if (user) {
          const updatedAddresses = user.addressList.map((a) =>
            a.id === address.id ? address : a
          );
          set({
            user: { ...user, addressList: updatedAddresses },
          });
        }
      },

      removeAddress: (addressId) => {
        const user = get().user;
        if (user) {
          const updatedAddresses = user.addressList.filter((a) => a.id !== addressId);
          set({
            user: { ...user, addressList: updatedAddresses },
          });
        }
      },

      logout: () => set({ user: null, cart: [], selectedAddress: null }),
    }),
    {
      name: 'merchant-app-storage',
    }
  )
);