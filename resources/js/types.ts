export interface SharedProps {
  auth?: {
    user?: {
      id?: number;
      name?: string;
      email?: string;
      role?: string;
    };
  };
  flash?: {
    success?: string;
    error?: string;
  };
  url?: string;
}
