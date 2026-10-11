import { apiClient } from "./apiClient";
export type CreateProductData = {
  name: string;
  description?: string;
  price: number;
  availableQuantity?: number;
  isAvailable?: boolean;
};

export type UpdateProductData = Partial<CreateProductData>;
export const getProducts = (categoryId?: number) =>
  apiClient.get<Product[]>("/products", {
    params: {
      categoryId,
    },
  });

export async function getProductById(id: number): Promise<Product | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
      {
        next: { revalidate: 60 },
      },
    );

    console.log(res);

    if (!res.ok) return null;
    const data: Product = await res.json();
    return data;
  } catch {
    return null;
  }
}

export const createProduct = (data: CreateProductData) =>
  apiClient.post<Product>("/products", data);

export const updateProduct = (id: number, data: UpdateProductData) =>
  apiClient.patch<Product>(`/products/${id}`, data);

export const deleteProduct = (id: number) =>
  apiClient.delete(`/products/${id}`);

// produc-category
export const addProductCategory = (productId: number, categoryId: number) =>
  apiClient.patch<Product>(`/products/${productId}/category`, { categoryId });

export const removeProductCategory = (productId: number, categoryId: number) =>
  apiClient.delete<Product>(`/products/${productId}/category/${categoryId}`);

// product image
export const addProductImage = (productId: number, imageId: number) =>
  apiClient.patch<Product>(`/products/${productId}/image`, { imageId });

export const removeProductImage = (productId: number, imageId: number) =>
  apiClient.delete<Product>(`/products/${productId}/image/${imageId}`);
