export class ConnectorNotConnectedError extends Error {
  name = "ConnectorNotConnectedError";
  message = "Connector not connected";
}

export class ConnectorNotFoundError extends Error {
  name = "ConnectorNotFoundError";
  message = "Connector not found";
}

export class UserRejectedRequestError extends Error {
  name = "UserRejectedRequestError";
  message = "User rejected request";
}

export class UserNotConnectedError extends Error {
  name = "UserNotConnectedError";
  message = "User not connected";
}


export class WalletNotFoundError extends Error {
  name = "WalletNotFoundError";
  message = "Wallet not found";
}


export class GetTBAOwnerFailure extends Error {
  name = "GetTBAOwnerFailure";
  message = "Unable to retrieve tba owner address";
}


export class NotTokenboundAccountOwner extends Error {
  name = "NotTokenboundAccountOwner";
  message = "Not TBA Owner";
}
