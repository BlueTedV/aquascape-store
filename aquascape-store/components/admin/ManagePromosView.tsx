"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Plus, Tag, Trash2 } from "lucide-react";
import { getAdminPromos, createPromo, deletePromo, PromoVoucher } from "@/lib/api/promos";
import { formatIDR } from "@/lib/format";

export default function ManagePromosView() {
  const [promos, setPromos] = useState<PromoVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "percentage" as "percentage" | "fixed" | "shipping",
    value: "10",
    maxDiscount: "50000",
    minSubtotal: "50000",
    description: "",
  });

  const loadPromos = async () => {
    setLoading(true);
    try {
      const data = await getAdminPromos();
      setPromos(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load promos.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim() || !form.description.trim()) {
      setErrorMsg("Please fill out voucher code, promo name, and description.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const newPromo = await createPromo({
        code: form.code.toUpperCase().trim(),
        name: form.name.trim(),
        type: form.type,
        value: Math.max(1, Number(form.value) || 0),
        maxDiscount: Math.max(0, Number(form.maxDiscount) || 0),
        minSubtotal: Math.max(0, Number(form.minSubtotal) || 0),
        description: form.description.trim(),
      });

      setPromos((prev) => [newPromo, ...prev]);
      setSuccessMsg(`Promo voucher '${newPromo.code}' created!`);
      setForm({
        code: "",
        name: "",
        type: "percentage",
        value: "10",
        maxDiscount: "50000",
        minSubtotal: "50000",
        description: "",
      });
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create promo voucher.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete promo code '${code}'?`)) return;

    setDeletingId(id);
    try {
      await deletePromo(id);
      setPromos((prev) => prev.filter((p) => p.id !== id));
      setSuccessMsg(`Promo code '${code}' removed.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete promo.";
      setErrorMsg(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-surface-container p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold">
            <Tag size={22} />
            <h2 className="font-display text-headline-md font-bold text-on-surface">Manage Promo Vouchers</h2>
          </div>
          <p className="mt-1 text-sm text-on-surface-variant">
            Create discount vouchers, free shipping codes, or fixed monetary price reductions for your customers.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-4 text-sm font-semibold text-rose-700 border border-rose-200">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-800 border border-emerald-200">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid: Create Form + List */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Create Form */}
        <div className="lg:col-span-5">
          <form onSubmit={handleCreate} className="rounded-2xl bg-surface-container p-6 shadow-sm space-y-4">
            <h3 className="font-display text-title-lg font-bold text-on-surface border-b border-outline-variant pb-3">
              Add New Promo Voucher
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Promo Code *
                </label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. AQUA10"
                  className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm font-mono font-bold text-on-surface outline-none focus:border-primary uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Discount Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                  className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                >
                  <option value="percentage">Percentage Off (%)</option>
                  <option value="fixed">Fixed Price Off (Rp)</option>
                  <option value="shipping">Free Shipping Fee</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Voucher Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Aquascaper 10% Discount"
                className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Value ({form.type === "percentage" ? "%" : "Rp"}) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Max Cap (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.maxDiscount}
                  onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                  placeholder="0 = unlimited"
                  className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Min Subtotal
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.minSubtotal}
                  onChange={(e) => setForm({ ...form, minSubtotal: e.target.value })}
                  placeholder="Min subtotal"
                  className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Voucher Description / Terms *
              </label>
              <textarea
                rows={2}
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="10% OFF on your order (Max Rp 50.000, Min order Rp 50.000)"
                className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-sans text-sm font-bold text-on-primary shadow-sm hover:bg-primary-hover disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />}
              <span>{submitting ? "Creating Promo..." : "Add Promo Voucher"}</span>
            </button>
          </form>
        </div>

        {/* Existing Promos List */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-surface-container p-6 shadow-sm space-y-4">
            <h3 className="font-display text-title-lg font-bold text-on-surface border-b border-outline-variant pb-3 flex items-center justify-between">
              <span>Active Promos &amp; Vouchers</span>
              <span className="text-xs font-sans font-normal text-on-surface-variant">
                {promos.length} voucher{promos.length === 1 ? "" : "s"}
              </span>
            </h3>

            {loading ? (
              <div className="py-12 text-center text-sm text-on-surface-variant">Loading promo vouchers...</div>
            ) : promos.length === 0 ? (
              <div className="py-12 text-center text-sm text-on-surface-variant">
                No promo vouchers created yet.
              </div>
            ) : (
              <div className="space-y-3">
                {promos.map((promo) => (
                  <div
                    key={promo.id}
                    className="rounded-xl border border-outline-variant/60 bg-surface-container-low p-4 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded">
                          {promo.code}
                        </span>
                        <span className="font-sans font-bold text-on-surface text-sm">
                          {promo.name}
                        </span>
                        <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                          {promo.type === "percentage"
                            ? `${promo.value}% OFF`
                            : promo.type === "shipping"
                            ? `-${formatIDR(promo.value)} SHIP`
                            : `-${formatIDR(promo.value)}`}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant">{promo.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-on-surface-variant font-medium pt-0.5">
                        <span>Min Order: {formatIDR(promo.minSubtotal)}</span>
                        {promo.maxDiscount > 0 && <span>Max Cap: {formatIDR(promo.maxDiscount)}</span>}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={deletingId === promo.id}
                      onClick={() => handleDelete(promo.id, promo.code)}
                      className="shrink-0 rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                      title="Delete promo"
                    >
                      {deletingId === promo.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
