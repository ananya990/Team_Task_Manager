import mongoose, { Schema } from 'mongoose';

import { IProject } from '../types';

const projectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: [
        'active',
        'completed',
        'archived',
      ],
      default: 'active',
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ owner: 1 });
projectSchema.index({ members: 1 });
projectSchema.index({ status: 1 });

export const Project = mongoose.model<IProject>(
  'Project',
  projectSchema
);