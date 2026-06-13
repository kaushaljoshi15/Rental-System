import { redirect } from "next/navigation";

export default function CustomerSettingsRedirect() {
  redirect("/?tab=profile");
}
