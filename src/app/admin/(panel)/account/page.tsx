import { getAdmin } from "@/lib/auth";
import { PasswordForm } from "@/components/admin/PasswordForm";
export default async function Account() {
  const a = await getAdmin();
  return (<div className="max-w-md"><h1 className="mb-1 text-2xl font-bold">Account</h1><p className="mb-6 text-sm text-neutral-600">Signed in as {a?.email}</p><PasswordForm /></div>);
}
