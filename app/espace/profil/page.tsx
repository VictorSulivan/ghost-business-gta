import { Suspense } from "react";
import { ProfileForm } from "@/components/profile-form";
import { PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";

async function Profil() {
  const user = await requireUser("client");
  const profile = user.profile;
  return (
    <div>
      <PageHeader
        title="Profil"
        lede="Ces informations servent aux membres à vous désigner correctement."
      />
      <ProfileForm
        characterName={profile?.characterName ?? ""}
        phone={profile?.phone ?? ""}
        description={profile?.description ?? ""}
        notes={profile?.notes ?? ""}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="text-muted">Chargement de la fiche…</p>}>
      <Profil />
    </Suspense>
  );
}
