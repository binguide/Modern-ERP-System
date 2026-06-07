import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export interface AuthUser {
  id: string;
  companyId: string;
  branchId?: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext): AuthUser | string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const user: AuthUser | undefined = request.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);
