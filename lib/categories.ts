import { apiClient } from "./apiClient";
export type CreateCategoryData = {
  name: string;
};

export type UpdateCategoryData = Partial<CreateCategoryData>;

export const getCategories = () => apiClient.get<Category[]>("categories");

export const getCategory = (id: number) =>
  apiClient.get<Category>(`/categories/${id}`);

export const createCategory = (data: CreateCategoryData) =>
  apiClient.post<Category>("/categories", data);

export const updateCategory = (id: number, data: UpdateCategoryData) =>
  apiClient.patch<Category>(`/categories/${id}`, data);

export const deleteCategory = (id: number) =>
  apiClient.delete(`/categories/${id}`);
