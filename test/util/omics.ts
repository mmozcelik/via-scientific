import { Omics } from '../../src/model/omics';

export async function cleanOmics() {
  await Omics.deleteMany({});
}
export async function createOmics(omicsData: any) {
  const omics = new Omics({
    created: new Date(),
    ...omicsData,
  });
  await omics.save();
}

export async function createRandomOmics() {
  await Promise.all([
    createOmics({
      gene: 'Pias1',
      expressionValues: {
        exper1: 112.97,
        exper2: 75.16,
        exper3: 59.73,
        control1: 350.01,
        control2: 164.21,
        control3: 166.37,
      },
      sampleNames: ['uc009qar.1', 'uc009qas.1'],
    }),
    createOmics({
      gene: 'Nup62',
      expressionValues: {
        exper1: 165.02,
        exper2: 193.00,
        exper3: 68.00,
        control1: 177.02,
        control2: 132.00,
        control3: 128.01,
      },
      sampleNames: ['uc009gqw.2'],
    }),
    createOmics({
      gene: 'Hdac1',
      expressionValues: {
        exper1: 282.00,
        exper2: 350.00,
        exper3: 150.00,
        control1: 403.00,
        control2: 263.00,
        control3: 271.00,
      },
      sampleNames: ['uc008uxg.1'],
    })]);
}
