export const prerender = "auto";

export const load = async ({ cookies }) => {
  // An active Prismic preview session is signalled by this cookie: editors who
  // arrive via a Prismic preview link have it set, normal visitors never do.
  // Gate the Prismic toolbar on it (the toolbar sets ~21 third-party cookies
  // that otherwise hit every visitor and fail Lighthouse Best Practices).
  const isPreviewSession = !!cookies.get("io.prismic.preview");

  return {
    isPreviewSession,
  };
};
