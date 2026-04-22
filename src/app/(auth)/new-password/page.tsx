import { NuevaPasswordForm } from "@/components/ui/nuevaPasswordForm";
 
type TProps = {
  searchParams: Promise<{ token?: string }>;
};
 
export default async function NuevaPasswordPage({ searchParams }: TProps) {
  const { token } = await searchParams;
 
  return (
    <NuevaPasswordForm token={token ?? null} />
  );
}