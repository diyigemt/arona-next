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
  _id!: number;
  username!: string;
  uid!: string;
  unionOpenId!: string;
  contacts!: string[];
  config!: {
    [key: string]: PluginConfig;
  };
  constructor(builder: UserSchema) {
    this._id = builder._id;
    this.username = builder.username;
    this.uid = builder.uid;
    this.unionOpenId = builder.unionOpenId;
    this.contacts = builder.contacts;
    this.config = builder.config;
  }
}
