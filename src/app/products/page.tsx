import { permanentRedirect } from "next/navigation";

export default async function ProductsRedirectPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const urlParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) {
        if (Array.isArray(val)) {
          val.forEach((v) => urlParams.append(key, v));
        } else {
          urlParams.set(key, val);
        }
      }
    });
  }

  const queryString = urlParams.toString();
  permanentRedirect(queryString ? `/?${queryString}` : "/");
}