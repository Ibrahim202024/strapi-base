import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStrapiClient, StrapiError } from '../../shared/lib/strapi';

describe('createStrapiClient', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('sends Authorization header when token provided', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    vi.stubGlobal('fetch', mockFetch);
    const client = createStrapiClient('http://localhost:1337', 'test-token');
    await client.collection('articles');
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers.Authorization).toBe('Bearer test-token');
  });

  it('does NOT send Authorization when no token', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    vi.stubGlobal('fetch', mockFetch);
    const client = createStrapiClient('http://localhost:1337');
    await client.collection('articles');
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers.Authorization).toBeUndefined();
  });

  it('throws StrapiError on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    const client = createStrapiClient('http://localhost:1337', 'token');
    await expect(client.single('global')).rejects.toThrow(StrapiError);
  });

  it('bySlug returns null when no entries match', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    }));
    const client = createStrapiClient('http://localhost:1337', 'token');
    const result = await client.bySlug('pages', 'nonexistent');
    expect(result).toBeNull();
  });
});