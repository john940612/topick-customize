import { Studio } from "@/components/Studio";
import { getCatalog } from "@/lib/catalog";

export default function Page() {
  return <Studio catalog={getCatalog()} />;
}
