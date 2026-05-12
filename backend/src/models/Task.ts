import mongoose, { Schema } from 'mongoose';

import { ITask } from '../types';

const attachmentSchema = new Schema({
  filename: {
    type: String,
    required: true,
  },

  url: {
    type: String,
    required: true,
  },

  size: {
    type: Number,
    required: true,
  },

  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

    status: {
      type: String,
      enum: [
        'todo',
        'in_progress',
        'review',
        'completed',
      ],
      default: 'todo',
    },

    priority: {
      type: String,
      enum: [
        'low',
        'medium',
        'high',
        'urgent',
      ],
      default: 'medium',
    },

    dueDate: {
      type: Date,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    attachments: [attachmentSchema],
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ project: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });

export const Task = mongoose.model<ITask>(
  'Task',
  taskSchema
);