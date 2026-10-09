interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  availableQuantity: number | null;

  createdAt: string;
  updatedAt: string;

  categories: Category[];
  images: Image[];
}
