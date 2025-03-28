#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";
import process from "process";
import axios from "axios";

import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    McpError,
    ErrorCode
} from "@modelcontextprotocol/sdk/types.js";

interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: any;
}

interface HandlerDefinition {
    handler: (req: any) => Promise<any>;
}

const logger = {
    info: (...args: any[]) => console.error('[INFO]', ...args),
    error: (...args: any[]) => console.error('[ERROR]', ...args),
    warn: (...args: any[]) => console.error('[WARN]', ...args),
    debug: (...args: any[]) => console.error('[DEBUG]', ...args)
};

const chainIdMapping = {
    "Ethereum Mainnet": 1,
    "Sepolia Testnet": 11155111,
    "Holesky Testnet": 17000,
    "Abstract Mainnet": 2741,
    "Abstract Sepolia Testnet": 11124,
    "ApeChain Curtis Testnet": 33111,
    "ApeChain Mainnet": 33139,
    "Arbitrum Nova Mainnet": 42170,
    "Arbitrum One Mainnet": 42161,
    "Arbitrum Sepolia Testnet": 421614,
    "Avalanche C-Chain": 43114,
    "Avalanche Fuji Testnet": 43113,
    "Base Mainnet": 8453,
    "Base Sepolia Testnet": 84532,
    "Berachain Mainnet": 80094,
    "BitTorrent Chain Mainnet": 199,
    "BitTorrent Chain Testnet": 1028,
    "Blast Mainnet": 81457,
    "Blast Sepolia Testnet": 168587773,
    "BNB Smart Chain Mainnet": 56,
    "BNB Smart Chain Testnet": 97,
    "Celo Alfajores Testnet": 44787,
    "Celo Mainnet": 42220,
    "Cronos Mainnet": 25,
    "Fraxtal Mainnet": 252,
    "Fraxtal Testnet": 2522,
    "Gnosis": 100,
    "Linea Mainnet": 59144,
    "Linea Sepolia Testnet": 59141,
    "Mantle Mainnet": 5000,
    "Mantle Sepolia Testnet": 5003,
    "Moonbase Alpha Testnet": 1287,
    "Moonbeam Mainnet": 1284,
    "Moonriver Mainnet": 1285,
    "OP Mainnet": 10,
    "OP Sepolia Testnet": 11155420,
    "Polygon Amoy Testnet": 80002,
    "Polygon Mainnet": 137,
    "Polygon zkEVM Cardona Testnet": 2442,
    "Polygon zkEVM Mainnet": 1101,
    "Scroll Mainnet": 534352,
    "Scroll Sepolia Testnet": 534351,
    "Sonic Blaze Testnet": 57054,
    "Sonic Mainnet": 146,
    "Sophon Mainnet": 50104,
    "Sophon Sepolia Testnet": 531050104,
    "Taiko Hekla L2 Testnet": 167009,
    "Taiko Mainnet": 167000,
    "Unichain Mainnet": 130,
    "Unichain Sepolia Testnet": 1301,
    "WEMIX3.0 Mainnet": 1111,
    "WEMIX3.0 Testnet": 1112,
    "World Mainnet": 480,
    "World Sepolia Testnet": 4801,
    "Xai Mainnet": 660279,
    "Xai Sepolia Testnet": 37714555429,
    "XDC Apothem Testnet": 51,
    "XDC Mainnet": 50,
    "zkSync Mainnet": 324,
    "zkSync Sepolia Testnet": 300,
};

const getChainId: ToolDefinition = {
    name: "get_chain_id",
    description: "Get the chain ID for a given chain name",
    inputSchema: {
        type: "object",
        properties: {
            chain_name: {
                type: "string",
                description: "The name of the chain to get the chain ID for"
            }
        },
        required: ["chain_name"]
    }
};

const getTotalSupply: ToolDefinition = {
    name: "get_total_supply",
    description: "Get the total supply of a token given its address",
    inputSchema: {
        type: "object",
        properties: {
            chain_id: {
                type: "integer",
                description: "The chain ID",
            },
            token_address: {
                type: "string",
                description: "The address of the token",
            },
        },
        required: ["chain_id", "token_address"],
    },
};

const getFilteredRpcList: ToolDefinition = {
    name: "get_filtered_rpc_list",
    description: "Get a filtered list of RPC endpoints for a given chain ID",
    inputSchema: {
        type: "object",
        properties: {
            chain_id: {
                type: "string",
                description: "The chain ID to get the RPC endpoints for"
            },
            isOpenSource: {
                type: "boolean",
                description: "Filter by isOpenSource"
            },
            tracking: {
                type: "string",
                description: "Filter by tracking (none, yes, limited, unspecified)"
            }
        },
        required: ["chain_id"]
    }
};


const toolDefinitions: { [key: string]: ToolDefinition } = {
    [getFilteredRpcList.name]: getFilteredRpcList,
    [getChainId.name]: getChainId,
    [getTotalSupply.name]: getTotalSupply
};

const server = new Server({
    name: "etherscan-mcp",
    version: "1.0.0"
}, {
    capabilities: {
        tools: toolDefinitions,
    }
});

async function handleGetFilteredRpcList(req: any) {
    const chainId = req.params.arguments.chain_id;
    const isOpenSource = req.params.arguments.isOpenSource;
    const tracking = req.params.arguments.tracking;

    try {
        const response = await axios.get(`https://chainlist.org/rpcs.json`);
        const chainInfo = response.data.find((item: any) => item.chainId === parseInt(chainId));

        if (chainInfo) {
            let rpcList = chainInfo.rpc;

            rpcList = rpcList.filter((rpc: any) => {
                let isOpenSourceMatch = true;
                if (isOpenSource != null) {
                    isOpenSourceMatch = rpc.isOpenSource === isOpenSource;
                }

                let trackingMatch = true;
                if (tracking != null) {
                    trackingMatch = rpc.tracking === tracking;
                }

                return isOpenSourceMatch && trackingMatch;
            }).map((rpc: any) => {
                return `${rpc.url}`;
            }).join("\n");

            return {
                content: [
                    {
                        type: "text",
                        text: `RPC List for Chain ID ${chainId}:\n${rpcList}`,
                    },
                ]
            };
        } else {
            return {
                content: [
                    {
                        type: "text",
                        text: `Chain ID ${chainId} not found`
                    }
                ]
            };
        }
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to fetch RPC list: ${error}`
                }
            ]
        };
    }
}

async function handleGetChainId(req: any) {
    const chainName = req.params.arguments.chain_name;

    if (chainIdMapping[chainName] != null) {
        return {
            content: [
                {
                    type: "text",
                    text: `Chain ID for ${chainName}: ${chainIdMapping[chainName]}`,
                },
            ]
        };
    } else {
        return {
            content: [
                {
                    type: "text",
                    text: `Chain ${chainName} not found`
                }
            ]
        };
    }
}

const callToolHandler: HandlerDefinition = {
    handler: async (req: any) => {
        const apiKey = process.env.ETHERSCAN_API_KEY
        switch (req.params.name) {
            case getFilteredRpcList.name:
                return await handleGetFilteredRpcList(req);
            case getChainId.name:
                return await handleGetChainId(req);
            case getTotalSupply.name:
                return await handleGetTotalSupply(req, apiKey);
            default:
                return {
                    content: [
                        {
                            type: "text",
                            text: `Tool ${req.params.name} not found.`,
                        },
                    ],
                    isError: true,
                };
        }
    }
};

async function handleGetTotalSupply(req: any, apiKey: string) {
    const chainId = req.params.arguments.chain_id;
    const tokenAddress = req.params.arguments.token_address;

    try {
        const response = await axios.get(
            `https://api.etherscan.io/v2/api?chainid=${chainId}&module=stats&action=tokensupply&contractaddress=${tokenAddress}&apikey=${apiKey}`
        );

        if (response.data.status === "1") {
            const totalSupply = response.data.result;
            return {
                content: [
                    {
                        type: "text",
                        text: `Total supply of token ${tokenAddress} on chain ${chainId}: ${totalSupply}`,
                    },
                ],
            };
        } else {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to get total supply: ${response.data.message}`,
                    },
                ],
            };
        }
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to get total supply: ${error}`,
                },
            ],
        };
    }
}

server.setRequestHandler(CallToolRequestSchema, callToolHandler.handler);
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Object.values(toolDefinitions)
}));

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport)
}

main().catch((error) => {
    logger.error("Server error: ", error);
    process.exit(1);
})
