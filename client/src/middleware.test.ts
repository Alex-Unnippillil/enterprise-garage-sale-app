/** @jest-environment node */
import { middleware } from './middleware';

describe('middleware', () => {
  const createRequest = (path: string, role?: string) => {
    const url = new URL(`http://localhost${path}`);
    const cookieStore = new Map<string, { value: string }>();
    if (role) {
      cookieStore.set('role', { value: role });
    }
    return {
      nextUrl: url,
      cookies: {
        get: (name: string) => cookieStore.get(name),
      },
      url: url.toString(),
    } as any;
  };

  it('allows manager access to managers routes', () => {
    const req = createRequest('/managers/properties', 'manager');
    const res = middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('blocks tenant from managers routes', () => {
    const req = createRequest('/managers/properties', 'tenant');
    const res = middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/signin');
  });

  it('allows tenant access to tenants routes', () => {
    const req = createRequest('/tenants/residences', 'tenant');
    const res = middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('blocks manager from tenants routes', () => {
    const req = createRequest('/tenants/residences', 'manager');
    const res = middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/signin');
  });
});
