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
  UseInterceptors,
  UploadedFile,
  Request,
  Res,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { hasRoles } from 'src/decorator/roles.decorator';
import { User, UserRole } from '../model/user.interface';
import { Observable, of, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { JwtAuthGuard } from 'src/guard/jwt-guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { Pagination } from 'nestjs-typeorm-paginate';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path, { extname, join } from 'path';
import { UserIsUserGuard } from 'src/guard/UserIsUser.guard';

export const store = {
  storage: diskStorage({
    destination: './upload/profileimages',
    filename: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png|gif/;
      const extnames = filetypes.test(extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');

      if (mimetype && extnames) {
        return cb(null, `${randomName}${extname(file.originalname)}`);
      } else {
        return cb(null, 'error');
      }
    },
  }),
  limits: {
    fields: 5,
    fieldNameSize: 50, // TODO: Check if this size is enough
    fieldSize: 20000, //TODO: Check if this size is enough
    // TODO: Change this line after compression
    fileSize: 15000000, // 150 KB for a 1080x1080 JPG 90
  },
};

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

  @UseGuards(JwtAuthGuard, UserIsUserGuard)
  @Put(':id')
  updateOne(@Param() Param, @Body() user: User): Observable<any> {
    return this.userservice.updateone(Param.id, user);
  }

  @Put(':id/role')
  upateRoleUser(@Param() id, @Body() user: User): Observable<User> {
    return this.userservice.updateRoleUser(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', store))
  uploadFile(@UploadedFile() file, @Request() req): Observable<any> {
    const user: User = req.user.user;
    const filetypes = /jpeg|jpg|png|gif/;
    const extnames = filetypes.test(extname(file.originalname).toLowerCase());
    if (!extnames) {
      return of({
        message: 'file must be image',
      });
    } else {
      return this.userservice
        .updateone(user.id, { profileImage: file.filename })
        .pipe(
          map((user: User) => ({
            profileimages: user.profileImage,
            message: 'success upload image',
          })),
        );
    }
  }

  @Get('profile-image/:imagename')
  findprofileimage(@Param() Param, @Res() res): Observable<any> {
    return of(
      res.sendFile(
        join(process.cwd(), 'upload/profileimages/' + Param.imagename),
      ),
    );
  }
}
