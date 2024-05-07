export interface Create {
  clientName: string;
  clientId: string;
  clientSecret: string;
}

export type Update = {
  id: number;
} & Create;
