"use client";

import ChangePasswordModal from "@/components/auth/ChangePasswordModal";
import NotificationStatus from "@/components/NotificationStatus";
import SessionManager from "@/components/SessionManager";
import { useAuth } from "@/context/AuthContext";
import { updateProfile, uploadAvatar, UpdateUserData } from "@/lib/auth";
import {
  Camera,
  Check,
  Download,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useEffect, useRef, useState } from "react";

export default function ProfileClient() {
  const { user, logout, loading, setAuth } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (user?.firstName) {
      document.title = `${user.firstName}'s Profile - Godstime Foods`;
    }
  }, [user?.firstName]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl border border-slate-800 bg-slate-900/40 text-center">
        <p className="text-slate-300">Please log in to view your profile.</p>
      </div>
    );
  }

  const paddedId = String(user.id).padStart(4, "0");
  const isStaff = user.role === "ADMIN" || user.role === "MANAGER";

  const handleStartEdit = () => {
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setIsEditing(true);
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const updatedUser = await uploadAvatar(file);
      setAuth({ user: updatedUser });
    } catch (error) {
      console.error("Failed to upload avatar", error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    const payload: Partial<UpdateUserData> = {};

    if (firstName.trim() !== (user.firstName || "")) {
      payload.firstName = firstName.trim();
    }
    if (lastName.trim() !== (user.lastName || "")) {
      payload.lastName = lastName.trim();
    }
    if (email.trim() !== (user.email || "")) {
      payload.email = email.trim();
    }
    if (phone.trim() !== (user.phone || "")) {
      payload.phone = phone.trim();
    }

    // If nothing changed, exit edit mode without network call
    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }

    setSavingProfile(true);
    try {
      const updatedUser = await updateProfile(payload);
      setAuth({ user: updatedUser });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        isForced={false}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      <div className="rounded-2xl border border-purple-500/20 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-linear-to-tr from-purple-600 to-pink-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-pink-950/30">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={`${user.firstName}'s avatar`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span>
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </span>
                )}

                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-purple-600 text-white shadow-md hover:bg-purple-500 transition-all cursor-pointer"
                title="Upload Avatar"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-xs text-purple-300 font-mono">Member ID: {paddedId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={handleStartEdit}
                className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950/60 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
              >
                Edit Info
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-400 text-xs hover:text-white transition-all cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Info Items */}
        <div className="mt-6 space-y-4">
          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Phone Number <span className="text-slate-500 text-[10px]">(e.g. +234...)</span>
                </label>
                <input
                  type="tel"
                  placeholder="+234 801 234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          ) : (
            <>
              {isStaff && (
                <Link
                  href="/admin"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-purple-500/30 bg-purple-950/20 text-sm text-purple-200 hover:border-purple-500/60 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="h-4 w-4 text-purple-400 shrink-0" />
                    <span className="font-semibold">Management Console</span>
                  </div>
                  <span className="text-xs text-purple-400 font-bold">Open Console →</span>
                </Link>
              )}

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 text-sm text-slate-300">
                <Mail className="h-4 w-4 text-purple-400 shrink-0" />
                <span>{user.email}</span>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 text-sm text-slate-300">
                <Phone className="h-4 w-4 text-purple-400 shrink-0" />
                <span>{user.phone || "No phone number linked"}</span>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 text-sm text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="capitalize">{user.role || "Customer"} Account</span>
              </div>

              <Link
                href="/addresses"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 text-sm text-slate-300 hover:border-slate-700 hover:text-white transition-all"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-purple-400 shrink-0" />
                  <span>Saved Delivery Addresses</span>
                </div>
                <span className="text-xs text-purple-400 font-semibold">Manage →</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 text-sm text-slate-300 hover:border-purple-500/50 hover:text-white transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <KeyRound className="h-4 w-4 text-purple-400 shrink-0" />
                  <span>Security & Password</span>
                </div>
                <span className="text-xs text-purple-400 font-semibold">Change Password →</span>
              </button>

              <NotificationStatus />

              <Link
                href="/install"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 text-sm text-slate-300 hover:border-purple-500/50 hover:text-white transition-all"
              >
                <div className="flex items-center gap-3">
                  <Download className="h-4 w-4 text-purple-400 shrink-0" />
                  <span>App Installation</span>
                </div>
                <span className="text-xs text-purple-400 font-semibold">Install App →</span>
              </Link>
            </>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      <SessionManager />
    </div>
  );
}