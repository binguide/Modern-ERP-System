import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<
      Array<{ resource: string; action: string }>
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.isSuperAdmin) {
      return true;
    }

    // Check if user has any of the required permissions
    const userPermissions = user.permissions as
      | Array<{
          resource: string;
          action: string;
          scope: string;
        }>
      | undefined;

    if (!userPermissions?.length) {
      throw new ForbiddenException('No permissions assigned');
    }

    const hasPermission = requiredPermissions.some((required) =>
      userPermissions.some(
        (up) => up.resource === required.resource && up.action === required.action,
      ),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
