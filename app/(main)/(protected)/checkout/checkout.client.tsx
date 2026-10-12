"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { createAddress, getAddresses, type CreateAddressData } from "@/lib/addresses";
import { apiClient } from "@/lib/apiClient";
import { updateProfile } from "@/lib/auth";
import { createOrder } from "@/lib/orders";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Edit2,
  Loader2,
  MapPin,
  Phone,
  Plus,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const BASE_DELIVERY_FEE = 500;
const PER_ITEM_DELIVERY_FEE = 100;

export default function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setAuth } = useAuth();
  const { cart, refreshCart } = useCart();

  // Support for instant single-item purchase via query parameters
  const productIdParam = searchParams.get("productId");
  const instantProductId = productIdParam ? parseInt(productIdParam, 10) : undefined;
  const quantityParam = searchParams.get("quantity");
  const instantQuantity = quantityParam ? parseInt(quantityParam, 10) : 1;

  const [instantProduct, setInstantProduct] = useState<Product | null>(null);
  const [loadingInstantProduct, setLoadingInstantProduct] = useState<boolean>(!!instantProductId);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(true);

  // Address creation state
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(false);
  const [savingAddress, setSavingAddress] = useState<boolean>(false);
  const [addressForm, setAddressForm] = useState<CreateAddressData>({
    address: "",
    city: "",
    state: "",
    label: "Home",
  });

  // Phone editing state
  const [phone, setPhone] = useState<string>(user?.phone || "");
  const [isEditingPhone, setIsEditingPhone] = useState<boolean>(!user?.phone);
  const [savingPhone, setSavingPhone] = useState<boolean>(false);

  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);

  // Load addresses & preselect default
  useEffect(() => {
    let ignore = false;
    getAddresses()
      .then((res) => {
        if (!ignore) {
          setAddresses(res);
          const defaultAddr = res.find((a) => a.isDefault) || res[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          }
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!ignore) setLoadingAddresses(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Fetch product info if this is an instant single-item order
  useEffect(() => {
    if (!instantProductId) return;

    let ignore = false;
    apiClient
      .get<Product>(`/products/${instantProductId}`)
      .then((product) => {
        if (!ignore) setInstantProduct(product);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load instant order item details");
      })
      .finally(() => {
        if (!ignore) setLoadingInstantProduct(false);
      });

    return () => {
      ignore = true;
    };
  }, [instantProductId]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.address.trim()) return;

    setSavingAddress(true);
    try {
      const newAddr = await createAddress(addressForm);
      const updatedList = await getAddresses();
      setAddresses(updatedList);
      setSelectedAddressId(newAddr.id);
      setIsAddingAddress(false);
      setAddressForm({ address: "", city: "", state: "", label: "Home" });
      toast.success("Delivery address added");
    } catch (err) {
      toast.error("Failed to save address");
      console.error(err);
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSavePhone = async () => {
    if (!phone.trim()) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setSavingPhone(true);
    try {
      const updatedUser = await updateProfile({ phone: phone.trim() });
      setAuth({ user: updatedUser });
      setIsEditingPhone(false);
      toast.success("Phone number updated");
    } catch (err) {
      toast.error("Failed to update phone number");
      console.error(err);
    } finally {
      setSavingPhone(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }
    if (!user?.phone && !phone.trim()) {
      toast.error("Contact phone number is required for delivery");
      return;
    }

    setSubmittingOrder(true);
    try {
      await createOrder({
        addressId: selectedAddressId,
        productId: instantProductId,
        quantity: instantProductId ? instantQuantity : undefined,
      });

      toast.success("Order placed successfully!");
      await refreshCart()
      router.push("/orders");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      toast.error(msg);
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Determine items and totals based on Instant vs Cart Checkout
  const isInstantOrder = !!instantProductId;

  const displayItems = isInstantOrder
    ? instantProduct
      ? [
        {
          id: instantProduct.id,
          quantity: instantQuantity,
          product: instantProduct,
        },
      ]
      : []
    : cart;

  const totalQuantity = displayItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = displayItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = totalQuantity > 0 ? BASE_DELIVERY_FEE + totalQuantity * PER_ITEM_DELIVERY_FEE : 0;
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Checkout</h1>
          <p className="text-xs text-slate-400 mt-1">Confirm address and contact details</p>
        </div>
        <Link
          href="/cart"
          className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Cart
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Delivery Address */}
          <div className="rounded-2xl border border-purple-500/20 bg-slate-900/60 p-6 space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-5 w-5 text-purple-400" />
                <h2 className="text-base font-bold text-white">1. Select Delivery Address</h2>
              </div>
              {!isAddingAddress && (
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(true)}
                  className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add New
                </button>
              )}
            </div>

            {isAddingAddress && (
              <form onSubmit={handleSaveAddress} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-purple-300 uppercase">New Address Details</h3>
                <input
                  type="text"
                  required
                  placeholder="Street Address (e.g. 12 Godstime Ave)"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Label (Home)"
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="px-4 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 disabled:opacity-50"
                  >
                    {savingAddress ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </form>
            )}

            {loadingAddresses ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-4">
                <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                <span>Loading saved addresses...</span>
              </div>
            ) : addresses.length === 0 && !isAddingAddress ? (
              <div className="text-center py-6 text-slate-400 text-xs space-y-2">
                <p>You have no saved delivery addresses.</p>
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 cursor-pointer"
                >
                  Add Address Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${isSelected
                        ? "border-purple-500 bg-purple-950/30 ring-1 ring-purple-500/50"
                        : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? "border-purple-400 bg-purple-600 text-white" : "border-slate-600"
                            }`}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              {addr.label || "Address"}
                            </span>
                            {addr.isDefault && (
                              <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{addr.address}</p>
                          {(addr.city || addr.state) && (
                            <p className="text-[11px] text-slate-400">
                              {[addr.city, addr.state].filter(Boolean).join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Contact Phone Verification */}
          <div className="rounded-2xl border border-purple-500/20 bg-slate-900/60 p-6 space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Phone className="h-5 w-5 text-purple-400" />
                <h2 className="text-base font-bold text-white">2. Delivery Phone Number</h2>
              </div>
              {!isEditingPhone && (
                <button
                  type="button"
                  onClick={() => setIsEditingPhone(true)}
                  className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Change
                </button>
              )}
            </div>

            {isEditingPhone ? (
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-400">
                  Phone Number for Driver Contact <span className="text-slate-500">(e.g. +234...)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="+234 801 234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSavePhone();
                      }
                    }}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    disabled={savingPhone}
                    onClick={handleSavePhone}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                  >
                    {savingPhone && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Save Phone
                  </button>
                  {user?.phone && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhone(user.phone || "");
                        setIsEditingPhone(false);
                      }}
                      className="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 text-sm text-slate-200">
                <span>{user?.phone}</span>
                <span className="text-xs text-emerald-400 font-semibold">Verified Contact</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary & Finalize */}
        <div className="rounded-2xl border border-purple-500/20 bg-slate-900/60 p-6 space-y-6 backdrop-blur-xl sticky top-24">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Order Items</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/30 text-purple-300">
              {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
            </span>
          </h2>

          {loadingInstantProduct ? (
            <div className="flex items-center justify-center py-8 text-xs text-slate-400 gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
              <span>Loading item details...</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {displayItems.map((item) => {
                const imgUrl = item.product.images?.[0]?.url;
                return (
                  <div key={item.id} className="flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative h-8 w-8 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                        {imgUrl ? (
                          <Image src={imgUrl} alt={item.product.name} fill sizes="32px" className="object-cover" />
                        ) : (
                          <ShoppingBag className="h-4 w-4 text-slate-600" />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="text-slate-200 truncate font-medium">{item.product.name}</p>
                        <p className="text-[10px] text-slate-400">x{item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-white font-semibold shrink-0">
                      ₦{(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Items Subtotal</span>
              <span className="font-semibold text-white">₦{subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-purple-400" /> Delivery Fee
              </span>
              <span className="font-semibold text-white">₦{deliveryFee.toLocaleString()}</span>
            </div>

            <p className="text-[10px] text-slate-500">
              Base (₦{BASE_DELIVERY_FEE.toLocaleString()}) + ₦{PER_ITEM_DELIVERY_FEE}/item packaging
            </p>

            <div className="border-t border-slate-800/80 pt-2 flex justify-between text-sm font-bold text-white">
              <span>Total Payable</span>
              <span className="text-purple-300">₦{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={submittingOrder || !selectedAddressId || (!user?.phone && !phone.trim()) || displayItems.length === 0}
            onClick={handlePlaceOrder}
            className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-900/30 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submittingOrder && <Loader2 className="h-4 w-4 animate-spin" />}
            {submittingOrder ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
