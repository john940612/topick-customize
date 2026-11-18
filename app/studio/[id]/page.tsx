import { Suspense } from "react";
import { OrderDetail } from "@/components/studio/OrderDetail";
import { StudioGate } from "@/components/studio/StudioGate";

export default function StudioOrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">正在讀取訂單…</p>}>
      <StudioOrder params={params} />
    </Suspense>
  );
}

async function StudioOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <StudioGate>
      <OrderDetail id={id} />
    </StudioGate>
  );
}
