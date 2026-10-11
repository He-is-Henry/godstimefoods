import { apiClient } from "./apiClient";

export type CreateAddressData = {
  address: string;
  city?: string;
  state?: string;
  label?: string;
};

export type UpdateAddressData = Partial<CreateAddressData>;

export const getAddresses = () =>
  apiClient.get<Address[]>("/users/me/addresses");

export const createAddress = (data: CreateAddressData) =>
  apiClient.post<Address>("/users/me/addresses", data);

export const updateAddress = (id: number, data: UpdateAddressData) =>
  apiClient.patch<Address>(`/users/me/addresses/${id}`, data);

export const setDefaultAddress = (id: number) =>
  apiClient.patch<Address>(`/users/me/addresses/${id}/default`);

export const deleteAddress = (id: number) =>
  apiClient.delete(`/users/me/addresses/${id}`);
