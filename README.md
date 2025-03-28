# Etherscan MCP Tool

This tool provides functionality to interact with blockchain data, specifically to retrieve the total supply of a token on a given chain, retrieve the chain ID for a given chain name, and retrieve a filtered list of RPC endpoints for a given chain ID.

## Usage

The tool exposes the following functionalities:

-   **Get Total Supply**: Retrieves the total supply of a token given its address and chain ID.
-   **Get Chain ID**: Retrieves the chain ID for a given chain name.
-   **Get Filtered RPC List**: Retrieves a filtered list of RPC endpoints for a given chain ID.

### Get Total Supply

To get the total supply of a token, you need to provide the chain ID and the token address.

**Parameters:**

-   `chain_id`: The ID of the blockchain network.
-   `token_address`: The address of the token.

**Example:**

To find the total supply of token `0x6B2a01A5f79dEb4c2f3c0eDa7b01DF456FbD726a` on chain `56`, you would use the following:

```json
{
  "chain_id": 56,
  "token_address": "0x6B2a01A5f79dEb4c2f3c0eDa7b01DF456FbD726a"
}
```

The tool would then return the total supply of the token, such as:

```
46141292590
```

### Get Chain ID

To get the chain ID, you need to provide the chain name.

**Parameters:**

-   `chain_name`: The name of the blockchain network.

**Example:**

To find the chain ID for `BNB Smart Chain Mainnet`, you would use the following:

```json
{
  "chain_name": "BNB Smart Chain Mainnet"
}
```

The tool would then return the chain ID, such as:

```
56
```

### Get Filtered RPC List

To get a filtered list of RPC endpoints, you need to provide the chain ID. You can also filter by `isOpenSource` and `tracking`.

**Parameters:**

-   `chain_id`: The ID of the blockchain network.
-   `isOpenSource` (optional): Filter by isOpenSource.
-   `tracking` (optional): Filter by tracking (none, yes, limited, unspecified).

**Example:**

To find the RPC list for chain ID `1`, you would use the following:

```json
{
  "chain_id": "1"
}
```

The tool would then return the RPC list for chain ID 1.

