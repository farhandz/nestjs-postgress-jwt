export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  CHIEFEDITOR = 'chiefeditor',
  USER = 'user',
}

export interface User {
  [x: string]: any;
  id?: number;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  profileImage?: string;
}
