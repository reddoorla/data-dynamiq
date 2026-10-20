import { asText } from "@prismicio/client";
import { error } from "@sveltejs/kit";

import { createClient } from "$lib/prismicio";

export async function load({ params, fetch, cookies }) {
  const client = createClient({ fetch, cookies });

  try {
    const page = await client.getByUID("page", params.uid);

    return {
      page,
      title: asText(page.data.title),
      meta_description: page.data.meta_description,
      meta_title: page.data.meta_title,
      meta_image: page.data.meta_image.url,
    };
  } catch {
    error(404, "Page not found");
  }
}

export async function entries() {
  const client = createClient();

  const pages = await client.getAllByType("page");

  // src/routes/contact owns /contact (a redirect into the contact modal). A page
  // with that uid, possible in this shared Prismic repository, would otherwise
  // fail every prerender with a static-route clash.
  return pages
    .filter((page) => page.uid !== "contact")
    .map((page) => {
      return { uid: page.uid };
    });
}
