import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/settings";
import { saveSettingsAction } from "@/app/admin/(panel)/settings/actions";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="font-serif text-3xl">Ajustes</h1>
      <p className="pt-2 text-sm text-taupe">
        Configuración general de la tienda.
      </p>
      <div className="pt-8">
        <SettingsForm
          action={saveSettingsAction}
          initialShipping={settings.shippingFlatRate}
        />
      </div>
    </div>
  );
}
