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
import { map, switchMap } from 'rxjs/operators';
import { BlogService } from '../service/blog.service';
import { BlogEntry } from '../model/blog.interface';

@Injectable()
export class UserIsAuthorGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly blogService: BlogService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user.user;
    const params = request.params;
    const blogEntryId = Number(params.id);
    console.log(blogEntryId);
    return this.userService.findone(user.id).pipe(
      switchMap((user: User) =>
        this.blogService.findone(blogEntryId).pipe(
          map((blogEntry: BlogEntry) => {
            let hasPermision = false;
            if (user.id === blogEntry.author.id) {
              hasPermision = true;
            }
            return user && hasPermision;
          }),
        ),
      ),
    );
  }
}
