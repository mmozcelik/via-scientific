import * as BPromise from 'bluebird';

export class Cli {
  static async closePromise(promise: PromiseLike<any>): BPromise<void> {
    try {
      const result = await promise;
      if (result) {
        if (typeof (result) === 'string') {
          console.log(result);
        } else {
          console.log('Result:', { result });
        }
      }
    } catch (err) {
      console.error(`Error executing CLI: ${err.message}`, { error: err });
      return process.exit(1);
    }
    return process.exit(0);
  }
}
