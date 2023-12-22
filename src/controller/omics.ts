import express from 'express';

import { Body, Example, Get, OperationId, Path, Post, Query, Request, Response, Route } from 'tsoa';

import { Logger } from '../lib/logger';
import AbstractController, { DataResponse } from './index';
import {  FindRequest, OmicsService } from '../service/omics';

@Route('omics')
export class OmicsController extends AbstractController {
  private service: OmicsService = new OmicsService();

  /**
   * Returns filtered list of gene IDs, geneID query param is optional,
   * if provided filters returned geneIDs with given gene ID, returns max 100 items
   */
  @Get('/gene-ids')
  @OperationId('lookup-gene-ids')
  @Example<DataResponse>({
    status: 'success',
    data: ['AK212155', 'AK051368'],
  })
  @Response<DataResponse>(400, 'Invalid arguments')
  @Response<DataResponse>(401, 'Unauthorized')
  @Response<DataResponse>(500, 'An error occurred processing the request')
  @Response<DataResponse>(200, 'Returns a status and data field')
  public async lookupGeneIDs(
    @Query("geneID") geneID?: string,
    @Request() request?: express.Request,
  ): Promise<DataResponse> {
    await this.checkPermission(request);

    const logger = new Logger();

    try {
      logger.info('lookup: Retrieved a new request', {
        geneID,
      });

      let result = await this.service.lookupGeneIDs(geneID);

      return this.getResponse(200, {
        data: result,
      });
    } catch (error) {
      logger.error('lookup: Failed to find requested data.', {
        geneID,
        error,
      });
      return this.getResponse(500, {
        error: { message: 'An error occurred processing the request' },
      });
    }
  }

  /**
   * Lookups the omics data with the given gene IDs
   */
  @Post('/')
  @OperationId('data-retrieval')
  @Example<DataResponse>({
    status: 'success',
    data: [{
      gene: 'AK212155',
      sampleNames: ['uc029xtn.1', 'uc029xuj.1'],
      expressionValues: {
        exper1: 80.00,
        exper2: 121.07,
        exper3: 61.00,
        control1: 147.66,
        control2: 112.00,
        control3: 67.00,
      },
    }],
  })
  @Response<DataResponse>(400, 'Invalid arguments')
  @Response<DataResponse>(401, 'Unauthorized')
  @Response<DataResponse>(500, 'An error occurred processing the request')
  @Response<DataResponse>(200, 'Returns a status and data field')
  public async findOmics(
    @Body() findRequest: Required<FindRequest>,
    @Request() request: express.Request,
  ): Promise<DataResponse> {
    await this.checkPermission(request);

    if (!findRequest.geneIDs.length) {
      return this.getResponse(400, {
        error: { message: 'Please provide at least one geneID' },
      });
    }

    const logger = new Logger();

    try {
      logger.info('retrieveData: Retrieved a new request', {
        request: findRequest,
      });

      let result = await this.service.findOmics(findRequest);

      return this.getResponse(200, {
        data: result,
      });
    } catch (error) {
      logger.error('retrieveData: Failed to find requested data.', {
        request: findRequest,
        error,
      });
      return this.getResponse(500, {
        error: { message: 'An error occurred processing the request' },
      });
    }
  }

  /**
   * For the given geneID, retrieves the data and returns the mean, median, variance
   */
  @Get('/{geneID}/analysis')
  @OperationId('data-analysis')
  @Example<DataResponse>({
    status: 'success',
    data: [{
      mean: 11.25,
      median: 12.55,
      variance: 3.22,
    }],
  })
  @Response<DataResponse>(400, 'Invalid arguments')
  @Response<DataResponse>(401, 'Unauthorized')
  @Response<DataResponse>(500, 'An error occurred processing the request')
  @Response<DataResponse>(200, 'Returns a status and data field')
  public async getAnalysis(
    @Path("geneID") geneID: string,
    @Request() request: express.Request,
  ): Promise<DataResponse> {
    await this.checkPermission(request);

    const logger = new Logger();

    try {
      logger.info('analysis: Retrieved a new request', {
        geneID,
      });

      const result = await this.service.getAnalysis(geneID);

      return this.getResponse(200, {
        data: result,
      });
    } catch (error) {
      logger.error('analysis: Failed to find requested data.', {
        geneID,
        error,
      });
      return this.getResponse(500, {
        error: { message: 'An error occurred processing the request' },
      });
    }
  }

  /**
   * Returns any gene that has a exper value diverges default %30 from control value,
   * you may give a different divergence number using `divergence` query parameter. Default is 0.3.
   */
  @Get('/anomalies')
  @OperationId('anomaly-detection')
  @Example<DataResponse>({
    status: 'success',
    data: [{
      gene: 'AK212155',
      sampleNames: ['uc029xtn.1', 'uc029xuj.1'],
      expressionValues: {
        exper1: 80.00,
        exper2: 121.07,
        exper3: 61.00,
        control1: 147.66,
        control2: 112.00,
        control3: 67.00,
      },
    }],
  })
  @Response<DataResponse>(400, 'Invalid arguments')
  @Response<DataResponse>(401, 'Unauthorized')
  @Response<DataResponse>(500, 'An error occurred processing the request')
  @Response<DataResponse>(200, 'Returns a status and data field')
  public async getAnomalies(
    @Query("divergence") divergence?: number,
    @Request() request?: express.Request,
  ): Promise<DataResponse> {
    await this.checkPermission(request);

    const logger = new Logger();

    try {
      logger.info('analysis: Retrieved a new request');

      const result = await this.service.getAnomalies(divergence);

      return this.getResponse(200, {
        data: result,
      });
    } catch (error) {
      logger.error('analysis: Failed to find requested data.', {
        error,
      });
      return this.getResponse(500, {
        error: { message: 'An error occurred processing the request' },
      });
    }
  }
}
