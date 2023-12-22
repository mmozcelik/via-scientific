import express from 'express';

import { Controller } from 'tsoa';

export interface DataResponse {
  status: string,
  data?: any,
  error?: object
}
export default abstract class AbstractController extends Controller {
  async checkPermission(request: express.Request): Promise<void> {
    // In case we want to authorize request we may use this abstract function to implement it, use below if case to implement it
    if (false) {
      this.setStatus(403);
      throw new Error('Insufficient permissions');
    }
  }

  protected getResponse(statusCode: number, body?: any): any {
    this.setStatus(statusCode);
    body = body || {};
    body.status = statusCode === 200 ? 'success' : 'failed';
    return body;
  }
}
