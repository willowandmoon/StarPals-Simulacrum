export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  extendedDescription: string;
  specs: Record<string, string>;
  stock: number;
  category: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id: string;
  userId: string;
  items: SaleItem[];
  total: number;
  createdAt: string;
}
