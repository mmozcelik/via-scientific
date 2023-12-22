import * as BPromise from 'bluebird';
import 'dotenv/config';
import { Omics } from '../model/omics';
import { Cli } from './cli';
import csv from 'csvtojson';
import mongoDb from '../lib/mongo';

const program = require('commander');

program
  .version('1.0.0')
  .parse(process.argv);

async function run() {
  mongoDb.connect();

  const omicsRawData = await csv({ delimiter: '\t' }).fromFile('data/simple_demo.tsv');
  let runRowCount = 0;
  await BPromise.map(omicsRawData, async (omicsRawDatum) => {
    const omics = new Omics({
      gene: omicsRawDatum.gene,
      sampleNames: omicsRawDatum.transcript.split(','),
      expressionValues: {
        exper1: +omicsRawDatum.exper_rep1,
        exper2: +omicsRawDatum.exper_rep2,
        exper3: +omicsRawDatum.exper_rep3,
        control1: +omicsRawDatum.control_rep1,
        control2: +omicsRawDatum.control_rep2,
        control3: +omicsRawDatum.control_rep3,
      },
    });
    await omics.save();
    runRowCount += 1;
    if (runRowCount % 1000 === 0) {
      console.log('Processed row count ' + runRowCount);
    }
  }, { concurrency: 5 });
}

Cli.closePromise(run());
