import 'dotenv/config';
import { assert } from 'chai';
import { OmicsService } from '../../../src/service/omics';

import { dbConnect, dbDisconnect } from '../../mongo';
import { createRandomOmics } from '../../util/omics';

describe('#retrieve-data', () => {
  const omicsService = new OmicsService();

  before(async () => {
    await dbConnect();
    await createRandomOmics();
  });

  after(async () => {
    await dbDisconnect();
  });

  it('should not return data if no geneIDs provided', async (): Promise<void> => {
    const result = await omicsService.findOmics({
        geneIDs: [],
      },
    );

    assert.lengthOf(result, 0);
  });


  it('should retrieve data for given gene IDs', async (): Promise<void> => {
    const result = await omicsService.findOmics({
        geneIDs: ['Hdac1'],
      },
    );

    assert.lengthOf(result, 1);
    assert.include(result[0].sampleNames, 'uc008uxg.1');
  });

  it('should retrieve data for given gene multiple IDs', async (): Promise<void> => {
    const result = await omicsService.findOmics({
        geneIDs: ['Hdac1', 'NA', 'Pias1'],
      },
    );

    assert.lengthOf(result, 2);
    assert.include(result[1].sampleNames, 'uc008uxg.1');
    assert.include(result[0].sampleNames, 'uc009qar.1');
  });
});
