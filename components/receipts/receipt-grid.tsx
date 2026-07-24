"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrencyKz, formatDate, formatDateTime, truncateText } from "@/lib/format";
import { Modal } from "@/components/ui/modal";
import { loadMoreCompanyReceipts } from "@/app/(dashboard)/empresas/actions";

type ReceiptRow = {
  id: string;
  imageUrl: string;
  amount: string | null;
  receiptDate: string | null;
  createdAt: Date | string;
  note: string | null;
  type: "venda" | "compra";
  paymentMethod: "dinheiro" | "banco";
  uploaderName: string;
};

const NOTE_MAX_LENGTH = 20;

export function ReceiptGrid({
  companyId,
  date,
  initialReceipts,
  totalCount,
}: {
  companyId: string;
  date: string;
  initialReceipts: ReceiptRow[];
  totalCount: number;
}) {
  const [items, setItems] = useState(initialReceipts);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ReceiptRow | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const hasMore = items.length < totalCount;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);

        loadMoreCompanyReceipts(companyId, date, items.length)
          .then((more) => {
            if (more.length > 0) {
              setItems((prev) => [...prev, ...more]);
            }
          })
          .finally(() => {
            loadingRef.current = false;
            setLoading(false);
          });
      },
      { rootMargin: "300px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, items.length, companyId, date]);

  return (
    <>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((receipt) => (
          <li key={receipt.id}>
            <button
              type="button"
              onClick={() => setSelected(receipt)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-left transition-colors hover:border-primary/30"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                <Image
                  src={receipt.imageUrl}
                  alt="Recibo"
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={clsx(
                      "flex items-center gap-1 truncate text-[15px] font-semibold",
                      receipt.type === "venda" ? "text-success" : "text-danger",
                    )}
                  >
                    {receipt.type === "venda" ? (
                      <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 shrink-0" />
                    )}
                    {formatCurrencyKz(receipt.amount)}
                  </span>
                  <span className="shrink-0 truncate rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted-foreground">
                    {receipt.uploaderName}
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  {formatDate(receipt.receiptDate ?? receipt.createdAt)}
                  <span className="text-muted">·</span>
                  {receipt.paymentMethod === "dinheiro" ? "Dinheiro" : "Banco"}
                </span>
                {receipt.note && (
                  <span className="truncate text-[12.5px] text-muted">
                    {truncateText(receipt.note, NOTE_MAX_LENGTH)}
                  </span>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-6">
          {loading && (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          )}
        </div>
      )}

      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <div className="relative aspect-square w-full bg-surface-2 sm:aspect-video">
            <Image
              src={selected.imageUrl}
              alt="Recibo"
              fill
              sizes="(max-width: 640px) 100vw, 512px"
              className="object-contain"
            />
          </div>
          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between gap-2">
              <span
                className={clsx(
                  "flex items-center gap-1.5 text-xl font-semibold",
                  selected.type === "venda" ? "text-success" : "text-danger",
                )}
              >
                {selected.type === "venda" ? (
                  <TrendingUp className="h-4.5 w-4.5" />
                ) : (
                  <TrendingDown className="h-4.5 w-4.5" />
                )}
                {formatCurrencyKz(selected.amount)}
              </span>
              <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[12px] text-muted-foreground">
                {selected.uploaderName}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] text-muted-foreground">
              <span>{formatDate(selected.receiptDate ?? selected.createdAt)}</span>
              <span className="text-muted">·</span>
              <span>
                {selected.paymentMethod === "dinheiro" ? "Dinheiro" : "Banco"}
              </span>
            </div>
            {selected.note && (
              <p className="text-[13.5px] text-foreground">{selected.note}</p>
            )}
            <p className="text-[12px] text-muted">
              Enviado em {formatDateTime(selected.createdAt)}
            </p>
            <a
              href={selected.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[13px] font-medium text-primary"
            >
              Abrir imagem original
            </a>
          </div>
        </Modal>
      )}
    </>
  );
}
