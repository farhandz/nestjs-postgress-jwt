import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../model/user.entity';
import { Repository, Like } from 'typeorm';
import { User, UserRole } from '../model/user.interface';
import { Observable, from, throwError } from 'rxjs';
import { AuthService } from 'src/auth/service/auth.service';
import { switchMap, catchError, map } from 'rxjs/operators';

import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { totalmem } from 'os';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private authService: AuthService,
  ) {}
  create(user: User): Observable<User> {
    return this.authService.hashPasssword(user.password).pipe(
      switchMap((passwordhasHash: string) => {
        const newUser = new UserEntity();
        newUser.name = user.name;
        newUser.username = user.username;
        newUser.email = user.email;
        newUser.password = passwordhasHash;
        newUser.role = UserRole.USER;
        return from(this.userRepository.save(newUser)).pipe(
          map((user: User) => {
            const { password, ...result } = user;
            return result;
          }),
          catchError((err) => throwError(err)),
        );
      }),
    );
  }
  findAll(): Observable<User[]> {
    return from(this.userRepository.find()).pipe(
      map((users: User[]) => {
        console.log(typeof users == 'undefined');
        users.forEach(function (v) {
          delete v.password;
        });
        return users;
      }),
    );
    // return from(this.userRepository.find());
  }

  delete(id: number): Observable<any> {
    return from(this.userRepository.delete(id));
  }

  updateone(id: number, user: User): Observable<any> {
    delete user.email;
    delete user.password;
    delete user.role;
    return from(this.userRepository.update(id, user)).pipe(
      switchMap(() => this.findone(id)),
    );
  }

  findone(id: number): Observable<User> {
    return from(this.userRepository.findOne({ id })).pipe(
      map((user: User) => {
        const { password, ...result } = user;
        return result;
      }),
    );
    // return from(this.userRepository.findOne(id));
  }

  login(user: User): Observable<string> {
    return this.validateUser(user.email, user.password).pipe(
      switchMap((user: User) => {
        if (user) {
          return this.authService
            .generateJwt(user)
            .pipe(map((jwt: string) => jwt));
        } else {
          return 'Wrong';
        }
      }),
    );
  }
  validateUser(email: string, password: string): Observable<User> {
    return this.findByEmail(email).pipe(
      switchMap((user: User) =>
        this.authService.comparePassword(password, user.password).pipe(
          map((match: boolean) => {
            if (match) {
              const { password, ...result } = user;
              return result;
            } else {
              throw Error;
            }
          }),
        ),
      ),
    );
  }

  findByEmail(email: string): Observable<User> {
    return from(this.userRepository.findOne({ email }));
  }

  updateRoleUser(id: number, user: User): Observable<any> {
    return from(this.userRepository.update(id, user));
  }

  paginate(option: IPaginationOptions): Observable<Pagination<User>> {
    return from(paginate<User>(this.userRepository, option)).pipe(
      map((userPageable: Pagination<User>) => {
        userPageable.items.forEach(function (v) {
          delete v.password;
        });
        return userPageable;
      }),
    );
  }
  paginateFileterUsername(
    options: IPaginationOptions,
    user: User,
  ): Observable<Pagination<User>> {
    return from(
      this.userRepository.findAndCount({
        skip: 0,
        take: options.limit || 10,
        order: { id: 'ASC' },
        select: ['id', 'name', 'username', 'email', 'role'],
        where: [{ username: Like(`%${user.username}%`) }],
      }),
    ).pipe(
      map(([user, totalUSer]) => {
        const userPageable: Pagination<User> = {
          items: user,
          links: {
            first: options.route + `?limit=${options.limit}`,
            previous: options.route + '',
            next:
              options.route + `?limit=${options.limit}&page=${options.page}`,
            last:
              options.route +
              `?limit=${options.limit}&page=${Math.ceil(
                totalUSer / options.limit,
              )}`,
          },
          meta: {
            currentPage: options.page,
            itemCount: user.length,
            itemsPerPage: options.limit,
            totalItems: totalUSer,
            totalPages: Math.ceil(totalUSer / options.limit),
          },
        };
        return userPageable;
      }),
    );
  }
}
