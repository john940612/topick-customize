"use client";

import { OrderList } from "@/components/studio/OrderList";
import { StudioGate } from "@/components/studio/StudioGate";

export default function StudioPage() {
  return (
    <StudioGate>
      <OrderList />
    </StudioGate>
  );
}
