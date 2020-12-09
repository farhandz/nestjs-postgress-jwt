import { User } from 'src/user/model/user.interface';

export interface BlogEntry {
  id?: number;
  title?: string;
  slug?: string;
  body?: string;
  createdAt?: Date;
  updateAt?: Date;
  likes?: number;
  author?: User;
  headerImage?: string;
  publised?: boolean;
  isPublished?: boolean;
}
