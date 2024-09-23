
export class ConnectorNotConnectedError extends Error {
  name = 'ConnectorNotConnectedError';
  message = 'Connector not connected';
}

export class ConnectorNotFoundError extends Error {
  name = 'ConnectorNotFoundError';
  message = 'Connector not found';
}

export class UserRejectedRequestError extends Error {
  name = 'UserRejectedRequestError';
  message = 'User rejected request';
}

export class UserNotConnectedError extends Error {
  name = 'UserNotConnectedError';
  message = 'User not connected';
}

export const TOKENBOUND_ACCOUNT_ICON = `data:image/png;base64,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`;

export const ARGENT_X_ICON = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTE4LjQwMTggNy41NTU1NkgxMy41OTgyQzEzLjQzNzcgNy41NTU1NiAxMy4zMDkxIDcuNjg3NDcgMTMuMzA1NiA3Ljg1MTQzQzEzLjIwODUgMTIuNDYwMyAxMC44NDg0IDE2LjgzNDcgNi43ODYwOCAxOS45MzMxQzYuNjU3MTEgMjAuMDMxNCA2LjYyNzczIDIwLjIxNjIgNi43MjIwMiAyMC4zNDkzTDkuNTMyNTMgMjQuMzE5NkM5LjYyODE1IDI0LjQ1NDggOS44MTQ0NCAyNC40ODUzIDkuOTQ1NTggMjQuMzg2QzEyLjQ4NTYgMjIuNDYxMyAxNC41Mjg3IDIwLjEzOTUgMTYgMTcuNTY2QzE3LjQ3MTMgMjAuMTM5NSAxOS41MTQ1IDIyLjQ2MTMgMjIuMDU0NSAyNC4zODZDMjIuMTg1NiAyNC40ODUzIDIyLjM3MTkgMjQuNDU0OCAyMi40Njc2IDI0LjMxOTZMMjUuMjc4MSAyMC4zNDkzQzI1LjM3MjMgMjAuMjE2MiAyNS4zNDI5IDIwLjAzMTQgMjUuMjE0IDE5LjkzMzFDMjEuMTUxNiAxNi44MzQ3IDE4Ljc5MTUgMTIuNDYwMyAxOC42OTQ2IDcuODUxNDNDMTguNjkxMSA3LjY4NzQ3IDE4LjU2MjMgNy41NTU1NiAxOC40MDE4IDcuNTU1NTZaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjQuNzIzNiAxMC40OTJMMjQuMjIzMSA4LjkyNDM5QzI0LjEyMTMgOC42MDYxNCAyMy44NzM0IDguMzU4MjQgMjMuNTU3NyA4LjI2MDIzTDIyLjAwMzkgNy43NzU5NUMyMS43ODk1IDcuNzA5MDYgMjEuNzg3MyA3LjQwMTc3IDIyLjAwMTEgNy4zMzIwMUwyMy41NDY5IDYuODI0NjZDMjMuODYwOSA2LjcyMTQ2IDI0LjEwNiA2LjQ2OTUyIDI0LjIwMjcgNi4xNTAxMUwyNC42Nzk4IDQuNTc1MDJDMjQuNzQ1OCA0LjM1NzA5IDI1LjA0ODkgNC4zNTQ3NyAyNS4xMTgzIDQuNTcxNTZMMjUuNjE4OCA2LjEzOTE1QzI1LjcyMDYgNi40NTc0IDI1Ljk2ODYgNi43MDUzMSAyNi4yODQyIDYuODAzOUwyNy44MzggNy4yODc2MUMyOC4wNTI0IDcuMzU0NSAyOC4wNTQ3IDcuNjYxNzkgMjcuODQwOCA3LjczMjEzTDI2LjI5NSA4LjIzOTQ4QzI1Ljk4MTEgOC4zNDIxIDI1LjczNiA4LjU5NDA0IDI1LjYzOTMgOC45MTQwMkwyNS4xNjIxIDEwLjQ4ODVDMjUuMDk2MSAxMC43MDY1IDI0Ljc5MyAxMC43MDg4IDI0LjcyMzYgMTAuNDkyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==`;
export const ARGENT_WEBWALLET_ICON  = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAxOCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoCiAgICAgIGZpbGwtcnVsZT0iZXZlbm9kZCIKICAgICAgY2xpcC1ydWxlPSJldmVub2RkIgogICAgICBkPSJNMS41IDAuNDM3NUMwLjk4MjIzMyAwLjQzNzUgMC41NjI1IDAuODU3MjMzIDAuNTYyNSAxLjM3NVMwLjU2MjUgMTIgMC41NjI1IDEyLjQxNDRDMC43MjcxMiAxMi44MTE4IDEuMzEzMTcgMTMuNTYyNSAyLjEyNSAxMy41NjI1SDE1Ljg3NUMxNi4yODk0IDEzLjU2MjUgMTYuNjg2OCAxMy4zOTc5IDE2Ljk3OTkgMTMuMTA0OUMxNy4yNzI5IDEyLjgxMTggMTcuNDM3NSAxMi40MTQ0IDE3LjQzNzUgMTJWMS4zNzVDMTcuNDM3NSAwLjg1NzIzMyAxNy4wMTc4IDAuNDM3NSAxNi41IDAuNDM3NUgxLjVaTTIuNDM3NSAzLjUwNjE2VjExLjY4NzVIMTUuNTYyNVYzLjUwNjE2TDkuNjMzNDkgOC45NDEwOEM5LjI3NTA3IDkuMjY5NjQgOC43MjQ5MyA5LjI2OTY0IDguMzY2NTEgOC45NDEwOEwyLjQzNzUgMy41MDYxNlpNMTQuMDg5OSAyLjMxMjVIMy45MTAxM0w5IDYuOTc4MjJMMTQuMDg5OSAyLjMxMjVaIgogICAgICBmaWxsPSJjdXJyZW50Q29sb3IiCiAgICAvPgo8L3N2Zz4=`
export const ARGENT_WEBWALLET_URL = "https://web.argent.xyz";


export const DEFAULT_TOKENBOUNDACCOUNT_URL= "https://connect.tbaexplorer.com/"

export const TESTNET_WHITELIST_URL =
  "https://static.hydrogen.argent47.net/webwallet/iframe_whitelist_testnet.json"

export const MAINNET_WHITELIST_URL =
  "https://static.argent.net/webwallet/iframe_whitelist_mainnet.json"

export const RPC_NODE_URL_TESTNET =
  "https://api.hydrogen.argent47.net/v1/starknet/goerli/rpc/v0.6"

export const RPC_NODE_URL_MAINNET =
  "https://cloud.argent-api.com/v1/starknet/mainnet/rpc/v0.6"


export const DEFAULT_CHAIN_ID = "SN_SEPOLIA"
