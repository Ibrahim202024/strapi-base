# Strapi API Permissions

Configure these in **Strapi Admin → Settings → Roles → Public**.

## Read-only API Token (STRAPI_API_TOKEN)

Grant **find** and **findOne** to the following content types:

| Content Type              | Actions          |
|---------------------------|------------------|
| page                      | find, findOne    |
| article                   | find, findOne    |
| category                  | find, findOne    |
| testimonial               | find             |
| global                    | find             |
| announcement-bar          | find             |
| popup                     | find             |
| tracking-settings         | find             |
| schema-settings           | find             |
| site-settings             | find             |
| blog-page                 | find             |
| form                      | find, findOne    |
| redirection               | find             |
| upload (media)            | find             |

> **Note:** Disabling a frontend module (e.g. Blog) does not remove its Strapi content types. Strapi permissions and frontend availability are separate concerns. You may remove permissions for disabled modules, but the content types remain available in the admin.

## Public Role (no token)

The **Public** role should have **no** content-type permissions in production.

### Form Submission (POST)

Form submissions are handled server-to-server (Nuxt → Strapi), using a
separate write token (`STRAPI_WRITE_TOKEN`). This token needs:

| Content Type              | Actions          |
|---------------------------|------------------|
| form-submission           | create           |

**Development shortcut:** Grant `form-submission.create` to the Public role
during development. Remove before going to production and use a dedicated
write token instead.

## Preview Token

The preview route uses cookie-based auth and the `PREVIEW_SECRET` shared secret,
not an API token.

## Module-Conditional Permissions

When a module is disabled in `neop.config.ts`:

| Module | Content Types | Permission Impact |
|--------|--------------|-------------------|
| Blog | article, category, blog-page | Can safely remove `find`/`findOne` |
| Auth | n/a (uses Strapi's built-in auth) | No API token permissions needed |
| Shop | (future) | Will need its own permissions |

Removing permissions for disabled modules reduces the API surface area but is not required.
