import { apiClient } from "./apiClient";

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

    if (!res.ok) return null;
    const data: Product = await res.json();
    return data;
  } catch {
    return null;
  }
}
