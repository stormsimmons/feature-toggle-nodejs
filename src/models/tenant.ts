export interface ITenant {
  key: string;

  name: string;

  selected: boolean;

  users: Array<string>;
}
