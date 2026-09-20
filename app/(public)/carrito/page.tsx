import { CartView } from "@/components/public/CartView";
import { listProducts } from "@/lib/db/catalog";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function CarritoPage() {
  const [products, settings] = await Promise.all([listProducts(), getSettings()]);
  return <CartView products={products} shippingFlatRate={settings.shippingFlatRate} />;
}