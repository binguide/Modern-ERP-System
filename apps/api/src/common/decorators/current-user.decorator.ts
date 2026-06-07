import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export interface JwtUser {
  sub: string;
  email: string;
  companyId: string;
  isSuperAdmin: boolean;
  permissions: Array<{ resource: string; action: string; scope: string }>;
}

export const CurrentUser = createParamDecorator(
  (data: keyof JwtUser | undefined, ctx: ExecutionContext): JwtUser | string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const user: JwtUser | undefined = request.user;
    if (!user) return undefined;
    if (data) {
      return user[data] as string;
    }
    return user;
  },
);
