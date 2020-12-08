import {
  CanActivate,
  Injectable,
  ExecutionContext,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from 'src/user/service/user.service';
import { User } from 'src/user/model/user.interface';
import { map } from 'rxjs/operators';

@Injectable()
export class UserIsUserGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user.user;
    const params = request.params;
    return this.userService.findone(user.id).pipe(
      map((user: User) => {
        let hasPermision = false;
        if (user.id === Number(params.id)) {
          hasPermision = true;
        }
        return user && hasPermision;
      }),
    );
  }
}
