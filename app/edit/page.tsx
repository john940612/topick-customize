import { Suspense } from "react";
import { EditOrder } from "@/components/EditOrder";
import { getCatalog } from "@/lib/catalog";

export const metadata = {
  title: "改已有訂單",
  description: "輸入訂單編號同 8 位電話，改返之前嘅 Topick 訂製。",
};

export default function EditPage() {
  return (
    <Suspense fallback={<p className="px-4 py-10 text-sm text-muted">正在打開…</p>}>
      <EditOrder catalog={getCatalog()} />
    </Suspense>
  );
}
