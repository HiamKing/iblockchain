enum MessageType {
  QUERY_LATEST = 0,
  QUERY_ALL = 1,
  RESPONSE_BLOCKCHAIN = 2
}

class Message {
  public type: MessageType;
  public data: any;

  constructor(type: MessageType, data: any) {
      this.type = type;
      this.data = data;
  }
}
