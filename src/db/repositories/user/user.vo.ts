export interface Create {
  name: string;
  password: string;
}

export interface Update {
  name: string;
  password: string;
  id: number;
  updateTime: Date;
  salt: string;
}
