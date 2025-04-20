import { User } from '@/shared/next-schema';

declare module 'next' {
  export interface NextApiRequest {
    session: {
      user?: Omit<User, 'password'>;
      save: () => Promise<void>;
      destroy: () => void;
    };
  }
}