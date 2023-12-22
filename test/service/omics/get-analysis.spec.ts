import 'dotenv/config';
import { assert } from 'chai';
import { OmicsService } from '../../../src/service/omics';

import { dbConnect, dbDisconnect } from '../../mongo';
import { createRandomOmics } from '../../util/omics';

describe('#getAnalysis', () => {
  const omicsService = new OmicsService();

  before(async () => {
    await dbConnect();
    await createRandomOmics();
  });

  after(async () => {
    await dbDisconnect();
  });

  it('should get data via gene ID', async (): Promise<void> => {
    let result = await omicsService.getAnalysis('Hdac1');

    assert.isOk(result);
    assert.equal(result.mean, 260.6666666666667);
    assert.equal(result.median, 282);
    assert.equal(result.variance, 6894.222222222222);
  });
});
