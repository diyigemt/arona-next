export type PluginConfig = {
  [key: string]: unknown;
};

export interface UserSchema {
  _id: number;
  username: string;
  uid: string;
  unionOpenId: string;
  contacts: string[];
  config: {
    [key: string]: PluginConfig;
  };
}

export class UserSchemaImpl implements UserSchema {
  constructor(
    public _id: number,
    public username: string,
    public uid: string,
    public unionOpenId: string,
    public contacts: string[],
    public config = {},
  ) {}
}
