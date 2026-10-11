"use client";

import {
  createAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  updateAddress,
  type CreateAddressData,
} from "@/lib/addresses";
import { ArrowLeft, CheckCircle2, MapPin, Plus, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AddressesClient() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<CreateAddressData>({
    address: "",
    city: "",
    state: "",
    label: "Home",
  });

  const reloadAddresses = async () => {
    try {
      const res = await getAddresses();
      setAddresses(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let ignore = false;

    getAddresses()
      .then((res) => {
        if (!ignore) setAddresses(res);
      })
      .catch(console.error)
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const resetForm = () => {
    setForm({ address: "", city: "", state: "", label: "Home" });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.address.trim()) return;

    try {
      if (editingId) {
        await updateAddress(editingId, form);
      } else {
        await createAddress(form);
      }
      await reloadAddresses();
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item: Address) => {
    setEditingId(item.id);
    setForm({
      address: item.address,
      city: item.city || "",
      state: item.state || "",
      label: item.label || "Home",
    });
    setIsAdding(true);
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id);
      await reloadAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAddress(id);
      await reloadAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/profile"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>

        {!isAdding && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add New Address
          </button>
        )}
      </div>

      {isAdding && (
        <form
          onSubmit={handleSave}
          className="mb-8 rounded-2xl border border-purple-500/30 bg-slate-900/80 p-6 backdrop-blur-xl"
        >
          <h2 className="text-lg font-bold text-white mb-4">
            {editingId ? "Edit Delivery Address" : "Add New Delivery Address"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Street Address
              </label>
              <input
                type="text"
                required
                placeholder="123 Food Street, Suite 4"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Lagos"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  State
                </label>
                <input
                  type="text"
                  placeholder="Lagos State"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  placeholder="Home, Office, Work"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-950/60 text-xs text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-all cursor-pointer"
            >
              {editingId ? "Update Address" : "Save Address"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {addresses.length === 0 && !isAdding ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
            <MapPin className="h-8 w-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No saved addresses yet.</p>
          </div>
        ) : (
          addresses.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                item.isDefault
                  ? "border-purple-500/40 bg-purple-950/20"
                  : "border-slate-800 bg-slate-900/50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 mt-0.5">
                    <MapPin className="h-5 w-5 text-purple-400" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {item.label || "Address"}
                      </span>
                      {item.isDefault && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Default
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-300 mt-1">{item.address}</p>
                    {(item.city || item.state) && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {[item.city, item.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!item.isDefault && (
                    <button
                      onClick={() => handleSetDefault(item.id)}
                      className="p-2 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-amber-400 transition-all cursor-pointer"
                      title="Set as Default"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950/60 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                    title="Delete Address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
