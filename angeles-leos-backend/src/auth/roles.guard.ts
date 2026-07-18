import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { JwtPayload } from './auth.guard';

// IMPORTANTE: este guard debe ir SIEMPRE después de AuthGuard,
// ya que depende de que request.user ya esté poblado.
// Ej: @UseGuards(AuthGuard, RolesGuard)
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si la ruta no tiene @Roles(), solo se exige estar autenticado (eso ya lo valida AuthGuard)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'] as JwtPayload | undefined;

    if (!user?.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Tu rol (${user?.role ?? 'desconocido'}) no tiene permiso para realizar esta acción. Roles permitidos: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
