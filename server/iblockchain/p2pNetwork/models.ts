enum MessageType {
  QUERY_LATEST = 0,
  QUERY_ALL = 1,
  QUERY_TRANSACTION_POOL = 2,
  RESPONSE_BLOCKCHAIN = 3,
  RESPONSE_TRANSACTION_POOL = 4,
}

class Message {
  public type: MessageType;
  public data: any;
}

export { Message, MessageType };