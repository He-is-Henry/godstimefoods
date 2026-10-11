import { apiClient } from "./apiClient";

export const getImages = () => apiClient.get<Image[]>("/images");

export const getImage = (id: number) => apiClient.get<Image>(`/images/${id}`);

export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post<Image>("/images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateImage = (id: number, data: { name?: string }) =>
  apiClient.patch<Image>(`/images/${id}`, data);

export const deleteImage = (id: number) => apiClient.delete(`/images/${id}`);
