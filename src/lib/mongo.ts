import { connect } from 'mongoose';

class Mongo {
  public connect() {
    const connectionUri = process.env.MONGODB_URI;
    connect(connectionUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then(() => {
        console.log(`Database connection successful for: ${connectionUri}`);
      })
      .catch((err) => {
        console.error(`Database connection error for ${connectionUri} with error: ${err.message}`);
      });
  }
}

export default new Mongo();
