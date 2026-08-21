"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2, Lock, Package, PackagePlus, Save, Search, Sparkles, Star, Tag, ToggleLeft, Trash2, Upload, X } from "lucide-react";
import {
  AdminCategory,
  ProductAdminInput,
  createAdminProduct,
  deleteAllAdminProducts,
  getAdminCategories,
  getAdminProducts,
  updateAdminProduct,
  uploadAdminImage,
} from "@/lib/api/admin";
import { getCurrentAccount } from "@/lib/api/auth";
import { ProductDetail } from "@/lib/api/products";
import { ProductBadge } from "@/lib/types";
import { formatIDR } from "@/lib/format";
import ManageHeroSlidesView from "./ManageHeroSlidesView";
import ManagePromosView from "./ManagePromosView";

type FormState = {
  id: string | null;
  name: string;
  slug: string;
  categorySlug: string;
  collection: string;
  brand: string;
  price: string;
  compareAtPrice: string;
  rating: string;
  reviewCount: string;
  image: string;
  badge: "" | ProductBadge;
  featured: boolean;
  stock: string;
  onSale: boolean;
  unit: string;
  arrival: boolean;
  tags: string;
  description: string;
  gallery: string;
  specs: string;
};

const emptyForm: FormState = {
  id: null,
  name: "",
  slug: "",
  categorySlug: "hardscape",
  collection: "Dragon Stone",
  brand: "Aquaku Shop",
  price: "0",
  compareAtPrice: "",
  rating: "0",
  reviewCount: "0",
  image: "/images/products/product-placeholder.svg",
  badge: "",
  featured: false,
  stock: "1",
  onSale: false,
  unit: "",
  arrival: false,
  tags: "NatureAquarium, Iwagumi",
  description: "",
  gallery: "",
  specs: "Material: Aquascape grade\nCare Level: Beginner friendly",
};

function textToLines(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeTags(value: string) {
  return textToLines(value).map((tag) => tag.replace(/^#/, "").replace(/[^A-Za-z0-9_]/g, ""));
}

function parseSpecs(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => {
      const [label, ...rest] = line.split(":");
      return {
        label: label?.trim() ?? "",
        value: rest.join(":").trim(),
      };
    })
    .filter((spec) => spec.label && spec.value);
}

function formatSpecs(specs: ProductDetail["specs"]) {
  return specs.map((spec) => `${spec.label}: ${spec.value}`).join("\n");
}

function formFromProduct(product: ProductDetail): FormState {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    categorySlug: product.categorySlug,
    collection: product.collection,
    brand: product.brand,
    price: String(product.price),
    compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
    rating: String(product.rating),
    reviewCount: String(product.reviewCount),
    image: product.image,
    badge: product.badge ?? "",
    featured: product.featured,
    stock: String(product.stock),
    onSale: product.onSale,
    unit: product.unit ?? "",
    arrival: product.arrival,
    tags: product.tags.join(", "),
    description: product.description,
    gallery: product.gallery.join("\n"),
    specs: formatSpecs(product.specs),
  };
}

function inputFromForm(form: FormState): ProductAdminInput {
  const compareAtPrice = form.compareAtPrice.trim();

  return {
    name: form.name.trim(),
    slug: form.slug.trim() || undefined,
    categorySlug: form.categorySlug,
    collection: form.collection.trim(),
    brand: form.brand.trim(),
    price: Number(form.price || 0),
    compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
    rating: Number(form.rating || 0),
    reviewCount: Number(form.reviewCount || 0),
    image: form.image.trim(),
    badge: form.badge || null,
    featured: form.featured,
    stock: Number(form.stock || 0),
    onSale: form.onSale,
    unit: form.unit.trim() || null,
    arrival: form.arrival,
    tags: normalizeTags(form.tags),
    description: form.description.trim() || null,
    gallery: textToLines(form.gallery || form.image),
    specs: parseSpecs(form.specs),
  };
}

export default function ManageProductsView() {
  const router = useRouter();
  const [subTab, setSubTab] = useState<"products" | "slides" | "promos">("products");
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"main" | "gallery" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePasscode, setDeletePasscode] = useState("");
  const [deletingAll, setDeletingAll] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAllProducts = async (e: FormEvent) => {
    e.preventDefault();
    if (!deletePasscode) return;
    setDeletingAll(true);
    setDeleteError(null);

    try {
      const res = await deleteAllAdminProducts(deletePasscode);
      setMessage(res.message || "All products have been deleted successfully.");
      setError(null);
      setProducts([]);
      setForm(emptyForm);
      setShowDeleteModal(false);
      setDeletePasscode("");
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete products. Please check passcode.");
    } finally {
      setDeletingAll(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const account = await getCurrentAccount();

        if (!account.isAdmin) {
          router.replace("/account");
          return;
        }

        const [nextProducts, nextCategories] = await Promise.all([
          getAdminProducts(),
          getAdminCategories(),
        ]);

        if (!mounted) return;
        setProducts(nextProducts);
        setCategories(nextCategories);
        setForm((current) => ({
          ...current,
          categorySlug: nextCategories[0]?.slug ?? current.categorySlug,
        }));
      } catch {
        router.replace("/login?redirect=/manage");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [router]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return products;

    return products.filter((product) =>
      [product.name, product.slug, product.category, product.collection, product.brand, ...product.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [products, query]);

  const setField = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const startNewProduct = () => {
    setForm({
      ...emptyForm,
      categorySlug: categories[0]?.slug ?? emptyForm.categorySlug,
    });
    setMessage(null);
    setError(null);
  };

  const uploadMainImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading("main");
    setMessage(null);
    setError(null);

    try {
      const uploaded = await uploadAdminImage(file);
      setField("image", uploaded.url);
      setField("gallery", form.gallery.trim() ? form.gallery : uploaded.url);
      setMessage("Main image uploaded.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setUploading(null);
    }
  };

  const uploadGalleryImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading("gallery");
    setMessage(null);
    setError(null);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const uploaded = await uploadAdminImage(file);
        uploadedUrls.push(uploaded.url);
      }

      setField(
        "gallery",
        [...textToLines(form.gallery), ...uploadedUrls].join("\n"),
      );
      setMessage(`${uploadedUrls.length} gallery image${uploadedUrls.length === 1 ? "" : "s"} uploaded.`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Gallery upload failed.");
    } finally {
      setUploading(null);
    }
  };

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const payload = inputFromForm(form);
      const savedProduct = form.id
        ? await updateAdminProduct(form.id, payload)
        : await createAdminProduct(payload);

      setProducts((current) => {
        const exists = current.some((product) => product.id === savedProduct.id);
        return exists
          ? current.map((product) => (product.id === savedProduct.id ? savedProduct : product))
          : [savedProduct, ...current];
      });
      setForm(formFromProduct(savedProduct));
      setMessage(form.id ? "Product updated." : "Product created.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Product could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[460px] max-w-container items-center justify-center text-primary">
        <Loader2 size={28} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container space-y-6">
      {/* Sub-navigation Tabs */}
      <div className="flex border-b border-outline-variant/60">
        <button
          type="button"
          onClick={() => setSubTab("products")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-all ${
            subTab === "products"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <Package size={17} />
          Catalog Products
        </button>

        <button
          type="button"
          onClick={() => setSubTab("slides")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-all ${
            subTab === "slides"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <Sparkles size={17} />
          Hero Banners
        </button>

        <button
          type="button"
          onClick={() => setSubTab("promos")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-all ${
            subTab === "promos"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <Tag size={17} />
          Promos &amp; Vouchers
        </button>
      </div>

      {subTab === "slides" && <ManageHeroSlidesView />}
      {subTab === "promos" && <ManagePromosView />}
      {subTab === "products" && (
        <>
          <div className="mb-stack-lg flex flex-col gap-stack-md lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-label-md uppercase text-tertiary">Admin</p>
              <h1 className="mt-2 font-display text-headline-lg text-primary">Manage Products</h1>
              <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
                Add products, edit catalog details, mark stock status, and choose featured items.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeletePasscode("");
                  setDeleteError(null);
                  setShowDeleteModal(true);
                }}
                className="flex items-center justify-center gap-2 rounded border border-red-200 bg-red-50 px-4 py-3 text-label-md font-bold text-red-700 transition-colors hover:bg-red-600 hover:text-white"
              >
                <Trash2 size={18} />
                Delete All Products
              </button>
              <button
                type="button"
                onClick={startNewProduct}
                className="flex items-center justify-center gap-2 rounded bg-primary px-5 py-3 text-label-md text-on-primary transition-colors hover:bg-primary-container"
              >
                <PackagePlus size={18} />
                New Product
              </button>
            </div>
          </div>

      {(message || error) && (
        <div
          className={`mb-stack-md rounded px-4 py-3 text-sm ${
            error ? "bg-error-container text-on-error-container" : "bg-primary-fixed text-on-primary-fixed"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <div className="grid gap-gutter lg:grid-cols-[360px_1fr]">
        <aside className="rounded-lg bg-background-white p-stack-md shadow-soft lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
          <label className="mb-stack-md flex items-center gap-2 rounded border border-outline-variant bg-surface-container-low px-3 py-2 focus-within:border-primary">
            <Search size={17} className="text-primary" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          <div className="space-y-2">
            {filteredProducts.map((product) => {
              const selected = form.id === product.id;

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setForm(formFromProduct(product))}
                  className={`flex w-full gap-3 rounded border p-2 text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary-fixed"
                      : "border-outline-variant bg-background-white hover:border-primary"
                  }`}
                >
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-surface-container">
                    <Image src={product.image} alt="" fill sizes="64px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-bold text-on-surface">{product.name}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                      <span>{product.category}</span>
                      <span>{formatIDR(product.price)}</span>
                      <span>{product.stock > 0 ? `${product.stock} stock` : "Out"}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <form onSubmit={saveProduct} className="rounded-lg bg-background-white p-stack-lg shadow-soft">
          <div className="mb-stack-lg flex flex-col gap-stack-sm sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-label-md uppercase text-on-surface-variant">
                {form.id ? "Editing product" : "Create product"}
              </p>
              <h2 className="mt-1 font-display text-headline-md text-on-surface">
                {form.name || "Untitled Product"}
              </h2>
            </div>
            {form.id && (
              <Link href={`/product/${form.slug}`} className="text-sm font-bold text-primary hover:underline">
                View product
              </Link>
            )}
          </div>

          <div className="grid gap-stack-md md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-label-md uppercase text-on-surface-variant">Product Name</span>
              <input required value={form.name} onChange={(event) => setField("name", event.target.value)} className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="mb-2 block text-label-md uppercase text-on-surface-variant">Slug</span>
              <input value={form.slug} onChange={(event) => setField("slug", event.target.value)} placeholder="auto-generated if empty" className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="mb-2 block text-label-md uppercase text-on-surface-variant">Category</span>
              <select value={form.categorySlug} onChange={(event) => setField("categorySlug", event.target.value)} className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary">
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>{category.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-label-md uppercase text-on-surface-variant">Collection</span>
              <input required value={form.collection} onChange={(event) => setField("collection", event.target.value)} className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="mb-2 block text-label-md uppercase text-on-surface-variant">Brand</span>
              <input required value={form.brand} onChange={(event) => setField("brand", event.target.value)} className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="mb-2 block text-label-md uppercase text-on-surface-variant">Price</span>
              <input required type="number" min="0" value={form.price} onChange={(event) => setField("price", event.target.value)} className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="mb-2 block text-label-md uppercase text-on-surface-variant">Compare Price</span>
              <input type="number" min="0" value={form.compareAtPrice} onChange={(event) => setField("compareAtPrice", event.target.value)} className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary" />
            </label>
            <div className="block md:col-span-2">
              <span className="mb-2 block text-label-md uppercase text-on-surface-variant">Main Product Image</span>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border-2 border-outline-variant bg-surface-container shadow-soft">
                  <Image
                    src={form.image || "/images/products/product-placeholder.svg"}
                    alt="Main product preview"
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                  {form.image && form.image !== "/images/products/product-placeholder.svg" && (
                    <button
                      type="button"
                      onClick={() => setField("image", "/images/products/product-placeholder.svg")}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow hover:bg-rose-700"
                      title="Reset to placeholder"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-on-primary shadow-sm transition-colors hover:bg-primary-hover">
                    {uploading === "main" ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    <span>{uploading === "main" ? "Uploading..." : "Upload Main Photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            if (e.target?.result) {
                              setField("image", String(e.target.result));
                            }
                          };
                          reader.readAsDataURL(file);
                          uploadMainImage(file);
                        }
                      }}
                    />
                  </label>
                  <p className="text-xs text-on-surface-variant">
                    {form.image === "/images/products/product-placeholder.svg"
                      ? "Currently using default placeholder image."
                      : "Main photo uploaded and ready."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="my-stack-lg grid gap-stack-md rounded-lg border border-outline-variant/70 bg-surface-container-low p-stack-md md:grid-cols-4">
            <label className="flex items-center gap-2 text-sm font-bold text-on-surface">
              <input type="checkbox" checked={form.featured} onChange={(event) => setField("featured", event.target.checked)} className="h-4 w-4 accent-primary" />
              <Star size={16} className="text-primary" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm font-bold text-on-surface">
              <input type="checkbox" checked={form.onSale} onChange={(event) => setField("onSale", event.target.checked)} className="h-4 w-4 accent-primary" />
              <ToggleLeft size={16} className="text-primary" />
              On Sale
            </label>
            <label className="flex items-center gap-2 text-sm font-bold text-on-surface">
              <input type="checkbox" checked={form.arrival} onChange={(event) => setField("arrival", event.target.checked)} className="h-4 w-4 accent-primary" />
              <CheckCircle2 size={16} className="text-primary" />
              New Arrival
            </label>
            <label className="flex items-center gap-2 text-sm font-bold text-on-surface">
              <input
                type="checkbox"
                checked={Number(form.stock || 0) === 0}
                onChange={(event) => setField("stock", event.target.checked ? "0" : "1")}
                className="h-4 w-4 accent-primary"
              />
              Out of Stock
            </label>
          </div>

          <div className="grid gap-stack-md md:grid-cols-4">
            <label className="block">
              <span className="mb-2 block text-label-md uppercase text-on-surface-variant">Stock</span>
              <input type="number" min="0" value={form.stock} onChange={(event) => setField("stock", event.target.value)} className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="mb-2 block text-label-md uppercase text-on-surface-variant">Unit</span>
              <input value={form.unit} onChange={(event) => setField("unit", event.target.value)} placeholder="kg, pc, cup" className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="mb-2 block text-label-md uppercase text-on-surface-variant">Rating</span>
              <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(event) => setField("rating", event.target.value)} className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="mb-2 block text-label-md uppercase text-on-surface-variant">Reviews</span>
              <input type="number" min="0" value={form.reviewCount} onChange={(event) => setField("reviewCount", event.target.value)} className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary" />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-label-md uppercase text-on-surface-variant">Badge</span>
              <select value={form.badge} onChange={(event) => setField("badge", event.target.value as FormState["badge"])} className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary">
                <option value="">None</option>
                <option value="New">New</option>
                <option value="Best Seller">Best Seller</option>
                <option value="Premium">Premium</option>
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-label-md uppercase text-on-surface-variant">Tags</span>
              <input value={form.tags} onChange={(event) => setField("tags", event.target.value)} placeholder="Iwagumi, DutchStyle, NanoTank" className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary" />
            </label>
          </div>

          <div className="mt-stack-md grid gap-stack-md md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-label-md uppercase text-on-surface-variant">Description</span>
              <textarea value={form.description} onChange={(event) => setField("description", event.target.value)} rows={5} className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary" />
            </label>
            <div className="block">
              <span className="mb-2 block text-label-md uppercase text-on-surface-variant">Gallery Photos</span>

              {/* Gallery Previews Grid */}
              <div className="mb-3 flex flex-wrap gap-2.5">
                {textToLines(form.gallery).map((imgUrl, index) => (
                  <div key={index} className="relative h-20 w-20 overflow-hidden rounded-lg border border-outline-variant bg-surface-container shadow-sm group">
                    <Image src={imgUrl} alt={`Gallery item ${index + 1}`} fill sizes="80px" className="object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = textToLines(form.gallery).filter((_, i) => i !== index);
                        setField("gallery", updated.join("\n"));
                      }}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white opacity-0 transition-opacity group-hover:opacity-100 shadow"
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-xs font-bold text-primary transition-colors hover:bg-surface-container">
                {uploading === "gallery" ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                <span>{uploading === "gallery" ? "Uploading photos..." : "+ Upload Gallery Photos"}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    const files = event.target.files;
                    if (!files || files.length === 0) return;
                    Array.from(files).forEach((file) => {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        if (e.target?.result) {
                          setForm((prev) => ({
                            ...prev,
                            gallery: [...textToLines(prev.gallery), String(e.target?.result)].join("\n"),
                          }));
                        }
                      };
                      reader.readAsDataURL(file);
                    });
                    uploadGalleryImages(files);
                  }}
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-label-md uppercase text-on-surface-variant">Specifications</span>
              <textarea value={form.specs} onChange={(event) => setField("specs", event.target.value)} rows={6} placeholder="Label: Value" className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 outline-none focus:border-primary" />
            </label>
          </div>

          <div className="mt-stack-lg flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded bg-primary px-6 py-3 text-label-md text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Product
            </button>
          </div>
        </form>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-background-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-4">
              <div className="flex items-center gap-2.5 text-red-600">
                <AlertTriangle size={22} />
                <h3 className="font-display text-headline-sm font-bold text-on-surface">Delete All Products</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded p-1 text-on-surface-variant hover:bg-surface-container"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
              This action will <strong className="text-red-600 font-bold">permanently delete ALL products</strong> from the database catalog. This action cannot be undone.
            </p>

            <form onSubmit={handleDeleteAllProducts} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Admin Passcode Required
                </label>
                <div className="relative mt-1.5">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type="password"
                    required
                    placeholder="Enter admin passcode"
                    value={deletePasscode}
                    onChange={(e) => setDeletePasscode(e.target.value)}
                    className="w-full rounded border border-outline-variant bg-surface-container-low pl-9 pr-3 py-2.5 text-xs text-on-surface outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {deleteError && (
                <div className="rounded bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded border border-outline-variant px-4 py-2 text-xs font-bold text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deletingAll || !deletePasscode}
                  className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingAll ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  Confirm Delete All
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}