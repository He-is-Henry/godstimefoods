import type { Metadata } from "next";
import AddressesClient from "./addresses.client";

export const metadata: Metadata = {
  title: "Delivery Addresses - Godstime Foods",
  description: "Manage your saved delivery locations.",
};

export default function AddressesPage() {
  return <AddressesClient />;
}
