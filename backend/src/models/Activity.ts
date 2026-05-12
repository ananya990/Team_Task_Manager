import mongoose, { Schema } from 'mongoose';

import { IActivity } from '../types';

const activitySchema = new Schema<IActivity>(
  {
    type: {
      type: String,
      enum: [
        'task_created',
        'task_updated',
        'task_completed',
        'task_assigned',
        'project_created',
        'project_updated',
        'member_added',
        'member_removed',
        'comment_added',
      ],
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },

    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },

    message: {
      type: String,
      required: true,
    },

    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ user: 1 });
activitySchema.index({ project: 1 });
activitySchema.index({ createdAt: -1 });

export const Activity = mongoose.model<IActivity>(
  'Activity',
  activitySchema
);