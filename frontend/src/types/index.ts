export interface UserLogIn {
    email: string;
    password: string;
}

export interface Folder {
  id?: string;
  name: string;
  createdAt?: any;
}

export interface Note {
  id?: string;
  title: string;
  content: string;
  color: string;
  createdAt?: any;
  updatedAt?: any;
  lastOpened?: number; 
}
