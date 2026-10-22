import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isRoleId } from "@/config/roles";
import { RoleFormPage } from "@/components/forms/role-form-page";
import { LoadingState } from "@/components/auth/loading-state";

interface FormularioPageProps {
  params: Promise<{ rol: string }>;
}

async function FormularioContent({ params }: FormularioPageProps) {
  const { rol } = await params;

  if (!isRoleId(rol)) {
    notFound();
  }

  return <RoleFormPage roleId={rol} />;
}

export default function FormularioPage(props: FormularioPageProps) {
  return (
    <Suspense fallback={<LoadingState message="Cargando formulario…" />}>
      <FormularioContent {...props} />
    </Suspense>
  );
}
