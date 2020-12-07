import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { hasRoles } from 'src/decorator/roles.decorator';
import { User, UserRole } from '../model/user.interface';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { JwtAuthGuard } from 'src/guard/jwt-guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { Pagination } from 'nestjs-typeorm-paginate';

@Controller('user')
export class UserController {
  constructor(private userservice: UserService) {}
  @Post()
  create(@Body() user: User): Observable<User | any> {
    return this.userservice.create(user).pipe(
      map((user: User) => user),
      catchError((err) => of({ error: err.message })),
    );
  }
  @Post('login')
  login(@Body() user: User): Observable<any> {
    return this.userservice.login(user).pipe(
      map((jwt: string) => {
        return { access_token: jwt };
      }),
    );
  }
  @Get(':id')
  findOne(@Param() Param): Observable<User> {
    return this.userservice.findone(Param.id);
  }
  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  index(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('username') username: string,
  ): Observable<Pagination<User>> {
    limit = limit > 100 ? 100 : limit;
    if (username == null || username == undefined) {
      return this.userservice.paginate({
        page: Number(page),
        limit: Number(limit),
        route: 'http://localhost:3000/user',
      });
    } else {
      return this.userservice.paginateFileterUsername(
        {
          page: Number(page),
          limit: Number(limit),
          route: 'http://localhost:3000/user',
        },
        { username },
      );
    }
  }

  @Delete(':id')
  deleteONe(@Param() Param): Observable<User> {
    return this.userservice.delete(Param.id);
  }

  @Put(':id')
  updateOne(@Param() Param, @Body() user: User): Observable<any> {
    return this.userservice.updateone(Param.id, user);
  }

  @Put(':id/role')
  upateRoleUser(@Param() id, @Body() user: User): Observable<User> {
    return this.userservice.updateRoleUser(id, user);
  }
}
