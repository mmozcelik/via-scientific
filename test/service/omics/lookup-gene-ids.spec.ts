import 'dotenv/config';
import { assert } from 'chai';
import { OmicsService } from '../../../src/service/omics';

import { dbConnect, dbDisconnect } from '../../mongo';
import { createRandomOmics } from '../../util/omics';

describe('#lookup-gene-ids', () => {
  const omicsService = new OmicsService();

  before(async () => {
    await dbConnect();
    await createRandomOmics();
  });

  after(async () => {
    await dbDisconnect();
  });

  it('should get empty list if no query provided', async (): Promise<void> => {
    const result = await omicsService.lookupGeneIDs(null);

    assert.equal(result.length, 3);
  });

  it('should get two matching omics', async (): Promise<void> => {
    const result = await omicsService.lookupGeneIDs('1');

    assert.equal(result.length, 2);
  });

  it('should return nothing as no match', async (): Promise<void> => {
    let result = await omicsService.lookupGeneIDs('ZA');

    assert.equal(result.length, 0);
  });
});
