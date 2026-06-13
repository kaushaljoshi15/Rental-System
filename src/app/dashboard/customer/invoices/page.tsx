import { redirect } from "next/navigation";

export default function CustomerInvoicesRedirect() {
  redirect("/?tab=invoices");
}
