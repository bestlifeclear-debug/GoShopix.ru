export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  imageUrl?: string | null;
}
