import { Module } from '@nestjs/common';
import { BlogService } from './service/blog.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntryEntity } from './model/blog-entity.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { BlogController } from './controller/blog.controller';
import { UserEntity } from 'src/user/model/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogEntryEntity, UserEntity]),
    AuthModule,
    UserModule,
  ],
  providers: [BlogService],
  controllers: [BlogController],
  exports: [BlogModule],
})
export class BlogModule {}
