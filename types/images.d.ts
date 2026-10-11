interface Image {
  id: number;
  name: string;
  path: string;
  url: string;
  productImages: {
    productId: number;
  }[];
}
