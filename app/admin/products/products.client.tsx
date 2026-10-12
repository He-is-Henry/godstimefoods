"use client";

import CategoryManager from "@/components/admin/catalog/CategoryManager";
import JunctionModal from "@/components/admin/catalog/JunctionModal";
import MediaLibrary from "@/components/admin/catalog/MediaLibrary";
import ProductCard from "@/components/admin/catalog/ProductCard";
import ProductModal from "@/components/admin/catalog/ProductModal";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/lib/categories";
import { deleteImage, getImages, updateImage, uploadImage } from "@/lib/images";
import {
  addProductCategory,
  addProductImage,
  createProduct,
  deleteProduct,
  getProducts,
  removeProductCategory,
  removeProductImage,
  updateProduct,
  type CreateProductData,
} from "@/lib/products";
import { Filter, FolderTree, Image as ImageIcon, Package, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type ActiveTab = "products" | "categories" | "images";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export default function ProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL search parameter syncing for active tab (?tab=products|categories|images)
  const queryTab = searchParams.get("tab") as ActiveTab | null;
  const activeTab: ActiveTab = queryTab && ["products", "categories", "images"].includes(queryTab)
    ? queryTab
    : "products";

  const handleTabChange = (tab: ActiveTab) => {
    router.push(`/admin/products?tab=${tab}`);
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Category Filter State for Products
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | "ALL">("ALL");

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [junctionProduct, setJunctionProduct] = useState<Product | null>(null);

  const reloadAllData = async () => {
    try {
      const [prods, cats, imgs] = await Promise.all([
        getProducts(),
        getCategories(),
        getImages(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setImages(imgs);
      return { prods, cats, imgs };
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    let isMounted = true;

    Promise.all([getProducts(), getCategories(), getImages()])
      .then(([prods, cats, imgs]) => {
        if (isMounted) {
          setProducts(prods);
          setCategories(cats);
          setImages(imgs);
        }
      })
      .catch((error: unknown) => {
        toast.error(getErrorMessage(error));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveProduct = async (data: CreateProductData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        toast.success("Product updated successfully");
        await reloadAllData();
      } else {
        const newProduct = await createProduct(data);
        toast.success("Product created! Now attach media & categories");
        const reloaded = await reloadAllData();

        const freshProduct = reloaded?.prods.find((p) => p.id === newProduct.id) || newProduct;
        setJunctionProduct(freshProduct);
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully");
      await reloadAllData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleToggleCategory = async (productId: number, categoryId: number, isAttached: boolean) => {
    let updated: Product;
    if (isAttached) {
      updated = await removeProductCategory(productId, categoryId);
    } else {
      updated = await addProductCategory(productId, categoryId);
    }
    setJunctionProduct(updated);
    await reloadAllData();
  };

  const handleToggleImage = async (productId: number, imageId: number, isAttached: boolean) => {
    let updated: Product;
    if (isAttached) {
      updated = await removeProductImage(productId, imageId);
    } else {
      updated = await addProductImage(productId, imageId);
    }
    setJunctionProduct(updated);
    await reloadAllData();
  };

  const handleUploadAndAttachImage = async (productId: number, file: File) => {
    const newImage = await uploadImage(file);
    const updatedProduct = await addProductImage(productId, newImage.id);
    setJunctionProduct(updatedProduct);
    await reloadAllData();
  };

  const handleCreateAndAttachCategory = async (productId: number, name: string) => {
    const newCategory = await createCategory({ name });
    const updatedProduct = await addProductCategory(productId, newCategory.id);
    setJunctionProduct(updatedProduct);
    await reloadAllData();
  };

  // Filtered product list based on selected category filter
  const filteredProducts = selectedCategoryFilter === "ALL"
    ? products
    : products.filter((p) => p.categories?.some((c) => c.id === selectedCategoryFilter));

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl font-bold text-white tracking-tight">Catalog Management</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage products, structure categories, and upload media assets
        </p>

        <div className="flex items-center gap-2 mt-6">
          <button
            onClick={() => handleTabChange("products")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "products"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
              : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
              }`}
          >
            <Package className="h-4 w-4" /> Products ({products.length})
          </button>

          <button
            onClick={() => handleTabChange("categories")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "categories"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
              : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
              }`}
          >
            <FolderTree className="h-4 w-4" /> Categories ({categories.length})
          </button>

          <button
            onClick={() => handleTabChange("images")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "images"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
              : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
              }`}
          >
            <ImageIcon className="h-4 w-4" /> Media Library ({images.length})
          </button>
        </div>
      </div>

      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Category Filter Select */}
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                <Filter className="h-4 w-4" />
              </div>
              <select
                value={selectedCategoryFilter}
                onChange={(e) =>
                  setSelectedCategoryFilter(
                    e.target.value === "ALL" ? "ALL" : Number(e.target.value)
                  )
                }
                className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="ALL">All Categories ({products.length})</option>
                {categories.map((cat) => {
                  const count = products.filter((p) =>
                    p.categories?.some((c) => c.id === cat.id)
                  ).length;
                  return (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-all cursor-pointer shadow-md shadow-purple-900/20"
            >
              <Plus className="h-4 w-4" /> Add Product
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-300">No products found</p>
              <p className="text-xs text-slate-500">
                {selectedCategoryFilter !== "ALL"
                  ? "No products are assigned to this category."
                  : "Click 'Add Product' to create your first item."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onEdit={(product) => {
                    setEditingProduct(product);
                    setIsProductModalOpen(true);
                  }}
                  onDelete={handleDeleteProduct}
                  onManageJunctions={(product) => setJunctionProduct(product)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "categories" && (
        <CategoryManager
          categories={categories}
          onCreateCategory={async (name) => {
            try {
              await createCategory({ name });
              toast.success("Category created");
              await reloadAllData();
            } catch (error: unknown) {
              toast.error(getErrorMessage(error));
            }
          }}
          onUpdateCategory={async (id, name) => {
            try {
              await updateCategory(id, { name });
              toast.success("Category updated");
              await reloadAllData();
            } catch (error: unknown) {
              toast.error(getErrorMessage(error));
            }
          }}
          onDeleteCategory={async (id) => {
            try {
              await deleteCategory(id);
              toast.success("Category deleted");
              await reloadAllData();
            } catch (error: unknown) {
              toast.error(getErrorMessage(error));
            }
          }}
        />
      )}

      {activeTab === "images" && (
        <MediaLibrary
          images={images}
          onUploadImage={async (file, name) => {
            try {
              const uploaded = await uploadImage(file);
              if (name) {
                await updateImage(uploaded.id, { name });
              }
              toast.success("Image uploaded successfully");
              await reloadAllData();
            } catch (error: unknown) {
              toast.error(getErrorMessage(error));
            }
          }}
          onUpdateImageName={async (id, name) => {
            try {
              await updateImage(id, { name });
              toast.success("Image label updated");
              await reloadAllData();
            } catch (error: unknown) {
              toast.error(getErrorMessage(error));
            }
          }}
          onDeleteImage={async (id) => {
            try {
              await deleteImage(id);
              toast.success("Image deleted");
              await reloadAllData();
            } catch (error: unknown) {
              toast.error(getErrorMessage(error));
            }
          }}
        />
      )}

      <ProductModal
        isOpen={isProductModalOpen}
        editingProduct={editingProduct}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
      />

      <JunctionModal
        product={junctionProduct}
        categories={categories}
        images={images}
        onClose={() => setJunctionProduct(null)}
        onToggleCategory={handleToggleCategory}
        onToggleImage={handleToggleImage}
        onUploadAndAttachImage={handleUploadAndAttachImage}
        onCreateAndAttachCategory={handleCreateAndAttachCategory}
      />
    </div>
  );
}
