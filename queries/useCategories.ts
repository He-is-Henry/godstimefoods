import { useQuery } from "@/hooks/useQuery";
import { getCategories } from "@/lib/categories";

export const useCategoriesQuery = {
  categories: () =>
    useQuery<Category[]>({
      key: "categories",
      fetcher: getCategories,
    }),
};
