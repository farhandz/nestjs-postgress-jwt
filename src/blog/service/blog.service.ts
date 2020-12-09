import { Injectable } from '@nestjs/common';
import { Observable, from, of } from 'rxjs';
import { BlogEntry } from '../model/blog.interface';
import { Repository } from 'typeorm';
import { BlogEntryEntity } from '../model/blog-entity.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/service/user.service';
import { User } from 'src/user/model/user.interface';
import { switchMap, map } from 'rxjs/operators';
import slugify from 'slugify';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogEntryEntity)
    private readonly blogRepository: Repository<BlogEntryEntity>,
    private userService: UserService,
  ) {}
  getHello(): any {
    return {
      message: 'farhan here ',
    };
  }
  create(user: User, blogEntry: BlogEntry): Observable<BlogEntry> {
    blogEntry.author = user;
    return this.generateSlug(blogEntry.title).pipe(
      switchMap((slug: string) => {
        blogEntry.slug = slug;
        return from(this.blogRepository.save(blogEntry));
      }),
    );
  }

  generateSlug(title: string): Observable<string> {
    return of(slugify(title));
  }

  findALl(): Observable<BlogEntry[]> {
    return from(this.blogRepository.find({ relations: ['author'] }));
  }
  findByUser(userId: number): Observable<BlogEntry[]> {
    return from(
      this.blogRepository.find({
        where: {
          author: userId,
        },
        relations: ['author'],
      }),
    ).pipe(map((blogEntries: BlogEntry[]) => blogEntries));
  }
  findone(id: number): Observable<BlogEntry> {
    return from(this.blogRepository.findOne({ id }, { relations: ['author'] }));
  }
  updateone(id: number, blogEntry: BlogEntry): Observable<BlogEntry> {
    return from(this.blogRepository.update(id, blogEntry)).pipe(
      switchMap(() => this.findone(id)),
    );
  }
  deleteone(id: number): Observable<any> {
    return from(this.blogRepository.delete({ id }));
  }
}
