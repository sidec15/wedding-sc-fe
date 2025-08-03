export interface Comment {
  id: string;
  nickname: string;
  email?: string;
  message: string;
  createdAt: Date;
}
