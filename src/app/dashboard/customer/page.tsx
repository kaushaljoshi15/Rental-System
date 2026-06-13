import { redirect } from "next/navigation";

export default function CustomerDashboardRedirect() {
  redirect("/?tab=orders");
}