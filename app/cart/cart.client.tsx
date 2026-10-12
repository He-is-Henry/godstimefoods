"use client";

import { useCart } from "@/context/CartContext";
import {
  ArrowRight,
  Loader2,
  Minus,
  Phone,
  Plus,
  RefreshCw,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// Delivery configuration constants
const BASE_DELIVERY_FEE = 500;
const PER_ITEM_DELIVERY_FEE = 100;

function CartLineItem({ item }: { item: CartItem }) {
  const { updateCartItem, removeItemFromCart } = useCart();
  const [isBusy, setIsBusy] = useState(false);
  const [inputVal, setInputVal] = useState<string>(String(item.quantity));

  useEffect(() => {
    (() => setInputVal(String(item.quantity)))();
  }, [item.quantity]);

  const commitQty = async () => {
    const parsed = parseInt(inputVal, 10);
    if (isNaN(parsed) || parsed < 1) {
      setInputVal(String(item.quantity));
      return;
    }
    if (parsed === item.quantity) return;

    setIsBusy(true);
    try {
      await updateCartItem(item.id, parsed);
    } finally {
      setIsBusy(false);
    }
  };

  const handleStepper = async (delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;

    setIsBusy(true);
    try {
      await updateCartItem(item.id, newQty);
    } finally {
      setIsBusy(false);
    }
  };

  const handleRemove = async () => {
    setIsBusy(true);
    try {
      await removeItemFromCart(item.id);
    } finally {
      setIsBusy(false);
    }
  };

  const lineTotal = item.product.price * item.quantity;
  const imageUrl = item.product.images?.[0]?.url;

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl transition-all duration-200 hover:border-purple-500/30 hover:bg-slate-900/90 shadow-lg shadow-black/20">
      {/* Product Image & Info */}
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.product.name}
              fill
              sizes="80px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <ShoppingBag className="h-8 w-8 text-slate-700" />
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-bold text-white leading-snug group-hover:text-purple-300 transition-colors">
            {item.product.name}
          </h3>
          {item.product.description && (
            <p className="text-xs text-slate-400 line-clamp-1 max-w-sm">
              {item.product.description}
            </p>
          )}
          <p className="text-xs font-semibold text-purple-400">
            ₦{item.product.price.toLocaleString()} <span className="text-slate-500 font-normal">/ unit</span>
          </p>
        </div>
      </div>

      {/* Item Controls & Total */}
      <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 border-slate-800/60 pt-3 sm:pt-0">
        {/* Quantity Switcher */}
        <div className="flex items-center border border-purple-500/30 rounded-xl bg-slate-950 p-1 shadow-inner">
          <button
            type="button"
            disabled={isBusy || item.quantity <= 1}
            onClick={() => handleStepper(-1)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-purple-900/40 disabled:opacity-30 transition-all cursor-pointer"
            title="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          {isBusy ? (
            <span className="w-12 text-center">
              <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto text-purple-400" />
            </span>
          ) : (
            <input
              type="number"
              min={1}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                  commitQty();
                }
              }}
              onBlur={commitQty}
              className="w-12 text-center text-xs font-bold text-white bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          )}

          <button
            type="button"
            disabled={isBusy}
            onClick={() => handleStepper(1)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-purple-900/40 disabled:opacity-30 transition-all cursor-pointer"
            title="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Line Price Total */}
        <div className="text-right min-w-20">
          <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500">Subtotal</span>
          <p className="text-sm font-extrabold text-white">₦{lineTotal.toLocaleString()}</p>
        </div>

        {/* Delete Item */}
        <button
          type="button"
          disabled={isBusy}
          onClick={handleRemove}
          className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          title="Remove Item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function CartClient() {
  const { cart, count, loading, syncing } = useCart();

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const deliveryFee = totalQuantity > 0 ? BASE_DELIVERY_FEE + totalQuantity * PER_ITEM_DELIVERY_FEE : 0;
  const grandTotal = subtotal + deliveryFee;

  if (loading && cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <p className="text-xs text-slate-400 font-medium">Loading your shopping cart...</p>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-950/30 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 shadow-xl shadow-purple-950/40">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Your cart is empty</h1>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Looks like you haven&apos;t added any food items to your order yet.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-500 transition-all shadow-lg shadow-purple-900/30"
          >
            Explore Menu <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="tel:09034830924"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-purple-500/30 bg-purple-950/30 text-purple-200 hover:text-white hover:bg-purple-900/40 font-semibold text-sm transition-all"
          >
            <Phone className="h-4 w-4 text-purple-400" /> Call to Order
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {syncing && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs animate-pulse">
          <RefreshCw className="h-4 w-4 animate-spin text-purple-400 shrink-0" />
          <span>Syncing guest cart items with your account...</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-slate-400 mt-1">
            {count} {count === 1 ? "dish" : "dishes"} selected ({totalQuantity} total items)
          </p>
        </div>
        <Link
          href="/"
          className="text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors"
        >
          ← Continue Browsing
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Line Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <CartLineItem key={item.id} item={item} />
          ))}
        </div>

        {/* Order Summary Side Card */}
        <div className="rounded-2xl border border-purple-500/20 bg-slate-900/80 p-6 space-y-6 backdrop-blur-xl sticky top-24 shadow-xl shadow-purple-950/20">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Order Summary</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-500/30 text-purple-300">
              {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
            </span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Items Subtotal</span>
              <span className="font-semibold text-white">₦{subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-purple-400" /> Estimated Delivery Fee
              </span>
              <span className="font-semibold text-white">₦{deliveryFee.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-slate-500 pl-5">
              Base fee (₦{BASE_DELIVERY_FEE.toLocaleString()}) + ₦{PER_ITEM_DELIVERY_FEE} per item packaging
            </p>
          </div>

          <div className="border-t border-slate-800 pt-4 flex justify-between items-baseline">
            <span className="text-sm font-bold text-white">Total Amount</span>
            <span className="text-2xl font-extrabold text-purple-300">₦{grandTotal.toLocaleString()}</span>
          </div>

          <div className="space-y-2.5">
            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-900/40 cursor-pointer active:scale-98"
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="tel:09034830924"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/40 text-purple-200 font-semibold text-xs transition-all cursor-pointer"
            >
              <Phone className="h-3.5 w-3.5 text-purple-400" />
              Call to Order / Event Enquiries
            </a>
          </div>

          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            Delivery location & contact phone number will be confirmed on the checkout screen.
          </p>
        </div>
      </div>
    </div>
  );
}
