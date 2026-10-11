interface Category {
  id: number;
  name: string;
  productCategories: {
    productId: number;
  }[];
}
