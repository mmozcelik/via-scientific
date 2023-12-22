import { model, Schema } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface IOmics {
  gene: string;
  sampleNames: string[];
  expressionValues: Object;
}

// 2. Create a Schema corresponding to the document interface.
const omicsSchema = new Schema<IOmics>({
  gene: {
    type: String,
    required: true,
  },
  sampleNames: [{
    type: String,
    required: true,
  }],
  expressionValues: {
    type: Object,
    required: true,
  },
}, { collection: 'omics' }); // Collection name

export const Omics = model<IOmics>('Omics', omicsSchema);
