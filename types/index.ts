export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  original_price?: number;
  images: string[];
  dimensions?: string;
  materials?: string;
  is_featured: boolean;
  in_stock: boolean;
  category_id: number;
  category?: Category;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  order_number: string;
  full_name: string;
  phone: string;
  email?: string;
  county: string;
  town: string;
  address: string;
  notes?: string;
  payment_method: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Testimonial {
  id: number;
  customer_name: string;
  rating: number;
  review: string;
  location?: string;
  is_approved: boolean;
  created_at: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
}

export interface CustomOrder {
  customer_name: string;
  phone: string;
  email?: string;
  furniture_type: string;
  dimensions?: string;
  materials?: string;
  description: string;
  reference_images?: string[];
  budget?: string;
}

export interface ContactMessage {
  name: string;
  phone: string;
  email?: string;
  message: string;
}
