import { describe, it, expect, afterAll } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';

describe('GET /api/health', () => {
  const app = createApp();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('responde 200 o 503 con la forma esperada (según disponibilidad real de la BD)', async () => {
    const res = await request(app).get('/api/health');

    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('db');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET / responde con la info básica de la API', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Coopidrogas API');
  });

  it('devuelve 404 en una ruta inexistente', async () => {
    const res = await request(app).get('/api/no-existe');
    expect(res.status).toBe(404);
  });
});