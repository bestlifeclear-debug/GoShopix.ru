import type { Express } from 'express';
import request from 'supertest';
import { createApp } from '../../app.js';

let app: Express | null = null;

export function getTestApp(): Express {
  if (!app) {
    app = createApp();
  }
  return app;
}

export function api() {
  return request(getTestApp());
}
