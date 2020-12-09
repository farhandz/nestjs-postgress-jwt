import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Request,
  UseGuards,
  Query,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { BlogService } from '../service/blog.service';
import { Observable, from, of } from 'rxjs';
import { BlogEntry } from '../model/blog.interface';
import { JwtAuthGuard } from 'src/guard/jwt-guard';
import { UserIsAuthorGuard } from '../guard/user-is-author.guard';

@Controller('blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() blogEntry: BlogEntry, @Request() req): Observable<BlogEntry> {
    const user = req.user.user;
    return from(this.blogService.create(user, blogEntry));
  }
  @Get()
  getData(@Query('userid') userId: number): Observable<BlogEntry[]> {
    if (userId == null) {
      return this.blogService.findALl();
    } else {
      return this.blogService.findByUser(userId);
    }
  }
  @Get(':id')
  findone(@Param() Param): Observable<BlogEntry> {
    return from(this.blogService.findone(Param.id));
  }

  @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
  @Put(':id')
  updateone(
    @Param('id') id,
    @Body() blogEntry: BlogEntry,
  ): Observable<BlogEntry> {
    return from(this.blogService.updateone(Number(id), blogEntry));
  }

  @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
  @Delete(':id')
  deleteone(@Param('id') id): Observable<any> {
    return this.blogService.deleteone(Number(id));
  }
}
