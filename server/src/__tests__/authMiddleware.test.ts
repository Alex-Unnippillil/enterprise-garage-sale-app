import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

let authMiddleware: any;

beforeAll(() => {
  process.env.DATABASE_URL = 'https://example.com';
  process.env.GEOCODE_USER_AGENT = 'agent';
  process.env.COGNITO_AUDIENCE = 'aud';
  process.env.COGNITO_ISSUER = 'iss';
  process.env.AWS_REGION = 'region';
  process.env.S3_BUCKET_NAME = 'bucket';
  process.env.AWS_ACCESS_KEY_ID = 'id';
  process.env.AWS_SECRET_ACCESS_KEY = 'secret';
  process.env.JWT_SECRET = 'secret';
  authMiddleware = require('../middleware/authMiddleware').authMiddleware;
});

jest.mock('jsonwebtoken');

describe('authMiddleware', () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;
  const next: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows access for allowed roles', () => {
    const req = {
      headers: { authorization: 'Bearer token' },
    } as unknown as Request;
    (jwt.verify as jest.Mock).mockReturnValue({ sub: '1', 'custom:role': 'admin' });

    authMiddleware(['admin'])(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(req.user).toEqual({ id: '1', role: 'admin' });
    expect(next).toHaveBeenCalled();
  });

  it('denies access for disallowed roles', () => {
    const req = {
      headers: { authorization: 'Bearer token' },
    } as unknown as Request;
    (jwt.verify as jest.Mock).mockReturnValue({ sub: '1', 'custom:role': 'tenant' });

    authMiddleware(['admin'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access Denied' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token missing', () => {
    const req = { headers: {} } as unknown as Request;

    authMiddleware(['admin'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token invalid', () => {
    const req = {
      headers: { authorization: 'Bearer token' },
    } as unknown as Request;
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid');
    });

    authMiddleware(['admin'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });
});
