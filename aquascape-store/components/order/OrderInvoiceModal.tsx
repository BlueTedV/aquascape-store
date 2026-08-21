"use client";

import { useEffect } from "react";
import { Printer, X, CheckCircle2, Clock, Truck, ShieldCheck } from "lucide-react";
import { Order } from "@/lib/api/orders";
import { formatIDR } from "@/lib/format";

interface OrderInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderInvoiceModal({ order, isOpen, onClose }: OrderInvoiceModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = orderDate.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const invoiceNumber = `INV/${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, "0")}/${order.orderNumber}`;

  const isPaid = order.paymentStatus === "paid" || order.orderStatus === "completed";
  const isCod = order.paymentMethod === "cod";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Print Specific CSS Style Injection */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice,
          #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative my-6 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl print:my-0 print:max-h-none print:shadow-none">
        {/* Modal Top Bar (Hidden on Print) */}
        <div className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-gray-50/95 px-6 py-3.5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <Printer size={18} className="text-primary" />
            <span>Order Invoice &amp; Official Receipt</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-hover transition-colors"
            >
              <Printer size={15} />
              <span>Print Invoice (Cetak)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* INVOICE CONTENT (Printable Sheet) */}
        <div id="printable-invoice" className="p-8 sm:p-10 font-sans text-gray-800 bg-white">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-primary/20 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-black text-primary tracking-tight">
                  AQUAKU SHOP
                </span>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                  Official Store
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500 max-w-sm leading-relaxed">
                PT Aquaku Natural Nusantara • Jl. Ir. H. Juanda No. 128, Dago, Bandung, Jawa Barat 40135
                <br />
                Telp: +62 821-2345-6789 • Email: orders@aquakushop.id
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="font-display text-xl font-bold tracking-wider text-gray-900 uppercase">
                INVOICE
              </span>
              <p className="font-mono text-xs font-bold text-primary mt-0.5">{invoiceNumber}</p>
              <p className="text-xs text-gray-500 mt-1">
                Tanggal: <strong>{formattedDate}</strong>, {formattedTime} WIB
              </p>

              {/* Status Stamp */}
              <div className="mt-2.5 inline-block">
                {isPaid ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-600 bg-emerald-50 px-3.5 py-1 text-xs font-black uppercase text-emerald-800 tracking-wider">
                    <CheckCircle2 size={13} />
                    LUNAS / PAID
                  </span>
                ) : isCod ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-blue-600 bg-blue-50 px-3.5 py-1 text-xs font-black uppercase text-blue-800 tracking-wider">
                    C.O.D (BAYAR DITEMPAT)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-500 bg-amber-50 px-3.5 py-1 text-xs font-black uppercase text-amber-800 tracking-wider">
                    <Clock size={13} />
                    MENUNGGU PEMBAYARAN
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/80 p-4 rounded-xl border border-gray-200/80 text-xs">
            <div>
              <p className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">
                DITAGIHKAN KEPADA (BILL TO)
              </p>
              <p className="font-bold text-gray-900 text-sm mt-1">{order.customerName}</p>
              <p className="text-gray-600 mt-0.5">{order.customerPhone}</p>
              <p className="text-gray-600">{order.customerEmail}</p>
              <p className="text-gray-500 mt-2">
                Metode Pembayaran: <strong className="uppercase text-gray-800">{order.paymentMethod}</strong>
              </p>
            </div>

            <div>
              <p className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">
                DIKIRIM KE (SHIP TO)
              </p>
              <p className="font-bold text-gray-900 text-sm mt-1">{order.customerName}</p>
              <p className="text-gray-600 mt-0.5 leading-relaxed">
                {order.shippingAddress}, {order.shippingCity}, {order.shippingPostalCode}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-700">
                <span className="flex items-center gap-1">
                  <Truck size={13} className="text-primary" />
                  Kurir: <strong>{order.courier}</strong>
                </span>
                {order.trackingNumber && (
                  <span>
                    No. Resi: <strong className="font-mono text-primary">{order.trackingNumber}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100/80 text-gray-700 font-bold border-b border-gray-200">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Nama Produk / Deskripsi</th>
                  <th className="py-3 px-4 text-center w-16">Qty</th>
                  <th className="py-3 px-4 text-right w-28">Harga Satuan</th>
                  <th className="py-3 px-4 text-right w-32">Total Harga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-center text-gray-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {item.productName}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-gray-800">{item.quantity}</td>
                    <td className="py-3 px-4 text-right text-gray-600 font-mono">
                      {formatIDR(item.price)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900 font-mono">
                      {formatIDR(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation Summary */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-start gap-6">
            <div className="text-xs text-gray-500 max-w-sm space-y-2">
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <ShieldCheck size={16} />
                <span>Jaminan Kualitas Aquaku Shop</span>
              </div>
              <p className="leading-relaxed">
                Semua pesanan tanaman air melalui karantina 14 hari dan dikemas khusus dengan insulasi udara. Harap simpan invoice ini sebagai bukti sah pembelian.
              </p>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal Produk</span>
                <span className="font-mono font-medium">{formatIDR(order.subtotal)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Biaya Pengiriman</span>
                <span className="font-mono font-medium">
                  {order.shippingCost === 0 ? "GRATIS" : formatIDR(order.shippingCost)}
                </span>
              </div>

              {order.discountAmount && order.discountAmount > 0 ? (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Diskon Voucher</span>
                  <span className="font-mono">-{formatIDR(order.discountAmount)}</span>
                </div>
              ) : null}

              <div className="flex justify-between border-t-2 border-gray-900 pt-2.5 text-base font-black text-gray-900">
                <span>TOTAL AKHIR</span>
                <span className="font-mono text-price-green">{formatIDR(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer Signoff */}
          <div className="mt-10 border-t border-gray-200 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-400 gap-2">
            <p>Invoice ini diterbitkan resmi oleh sistem e-commerce Aquaku Shop.</p>
            <p className="font-mono">aquakushop.id • Terima Kasih Atas Pesanan Anda!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
