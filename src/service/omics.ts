import { IOmics, Omics } from '../model/omics';

export interface FindRequest {
  geneIDs: string[],
}

const DEFAULT_DIVERGENCE = 0.3;

export class OmicsService {

  /**
   * This find method uses default compound indexes to find requested data
   * @param geneID
   */
  async lookupGeneIDs(geneID: string): Promise<string[]> {
    const query = geneID || '';
    const result = await Omics.find({ gene: { $regex: `.*${query}.*` } }).limit(100);
    return result.map((r) => r.gene);
  }

  /**
   * This find method uses default compound indexes to find requested data
   * @param request
   */
  async findOmics(request: FindRequest): Promise<IOmics[]> {
    const query = {} as any;
    if (request.geneIDs?.length) {
      query.gene = request.geneIDs;
    }

    // Return empty list if no filter is provided
    if (Object.keys(query).length === 0) {
      return [];
    }

    return Omics.find(query);
  }

  async getAnalysis(geneID: string): Promise<{ mean: number, median: number, variance: number }> {
    const query = { gene: geneID };

    const omicsArray = await Omics.find(query);
    // No gene found
    if (!omicsArray.length) {
      return { mean: 0, median: 0, variance: 0 };
    }
    const omics = omicsArray.length > 0 ? omicsArray[0] : null;
    const expressionValues = omics.expressionValues as any;
    const expressions = [expressionValues.exper1, expressionValues.exper2, expressionValues.exper3].sort();
    return { mean: (expressions[0] + expressions[1] + expressions[2]) / 3, median: expressions[1], variance: this.findVariance(expressions) };
  }

  async getAnomalies(divergence: number): Promise<IOmics[]> {
    const outlierQuery = this.getOutlierQuery(divergence || DEFAULT_DIVERGENCE);
    return Omics.find({ $where: outlierQuery }).limit(100);
  }

  private getOutlierQuery(divergence: number): string {
    return `${this.getOutlierCheckForField('exper1', 'control1', divergence)} || ${this.getOutlierCheckForField('exper2', 'control2', divergence)} || ${this.getOutlierCheckForField('exper3', 'control3', divergence)}`;
  }

  private getOutlierCheckForField(field: string, control: string, divergence: number): string {
    return `this.expressionValues.${field} > ${1 + divergence} * this.expressionValues.${control} || this.expressionValues.${field} < ${1 - divergence} * this.expressionValues.${control}`;
  }

  private findVariance(arr = []): number {
    if (!arr.length) {
      return 0;
    }
    const sum = arr.reduce((acc, val) => acc + val);
    const { length: num } = arr;
    const median = sum / num;
    let variance = 0;
    arr.forEach(num => {
      variance += ((num - median) * (num - median));
    });
    variance /= num;
    return variance;
  }
}
