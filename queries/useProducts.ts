import { useQuery } from "@/hooks/useQuery";
import { getProducts } from "@/lib/products";

export const useProductQuery = {
  products(categoryId?: number) {
    return useQuery<Product[]>({
      key: `/products/category:${categoryId ?? "all"}`,
      fetcher: () => getProducts(categoryId),
    });
  },
};
