export default () => ({
  /**
   * SEO plugin � community fork, compatible with Strapi 5.
   *
   * Adds a SEO panel in the Strapi Admin for content types that have a
   * `shared.seo` component. Editors get SERP preview, metaRobots, OG fields,
   * and metaImage directly in the admin UI.
   *
   * The plugin detects the existing `shared.seo` component automatically �
   * no schema changes required.
   *
   * @see https://github.com/strapi-community/strapi-plugin-seo
   */
  seo: {
    enabled: true,
  },
});
