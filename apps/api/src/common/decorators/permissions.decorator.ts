import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export type Action = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export' | 'manage';
export type Subject = 'all' | string;

export const Permissions = (action: Action, subject: Subject) =>
  SetMetadata(PERMISSIONS_KEY, { action, subject });
