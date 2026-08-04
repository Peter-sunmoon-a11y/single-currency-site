export type IClientPublishOptions = {
  qos?: 0 | 1 | 2;
  retain?: boolean;
};

export type IClientSubscribeOptions = {
  qos?: 0 | 1 | 2;
  nl?: boolean;
  rap?: boolean;
  rh?: 0 | 1 | 2;
};

export type IClientUnsubscribeProperties = Record<string, never>;

export type ISubscriptionMap = Record<
  string,
  boolean | IClientSubscribeOptions
>;

export type IClientOptions = {
  clean?: boolean;
  clientId?: string;
  connectTimeout?: number;
  reconnectPeriod?: number;
  keepalive?: number;
  reschedulePings?: boolean;
  protocolId?: string;
  protocolVersion?: number;
  username?: string;
  password?: string;
};

export type MqttClient = {
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler: (...args: any[]) => void) => void;
  end: () => void;
  publish: (
    topic: string,
    message: string,
    opts: IClientPublishOptions | undefined,
    callback: (err?: unknown) => void
  ) => void;
  subscribe: (
    topic: string | string[] | ISubscriptionMap,
    optsOrCallback?:
      | IClientSubscribeOptions
      | ((err?: unknown) => void),
    callback?: (err?: unknown) => void
  ) => void;
  unsubscribe: (
    topic: string | string[],
    optsOrCallback?:
      | IClientUnsubscribeProperties
      | ((err?: unknown) => void),
    callback?: (err?: unknown) => void
  ) => void;
};
