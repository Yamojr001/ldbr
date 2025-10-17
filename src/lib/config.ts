// src/lib/config.ts

// Using 'viem' Abi type for robust type checking of the ABI JSON structure
import { Abi } from 'viem'; 

// --- 1. STAFF REGISTRY ABI (First JSON Block) ---
export const STAFF_REGISTRY_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "initialManager",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "StaffRegistry__AccountExists",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "staffId",
				"type": "uint256"
			}
		],
		"name": "StaffRegistry__AccountNotFound",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "StaffRegistry__InvalidUsername",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "StaffRegistry__SameManager",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "StaffRegistry__SignatureInvalid",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "StaffRegistry__Unauthorized",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "username",
				"type": "string"
			}
		],
		"name": "StaffRegistry__UsernameTaken",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "StaffRegistry__ZeroAddress",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousManager",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newManager",
				"type": "address"
			}
		],
		"name": "ManagerUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "previousAdminRole",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "newAdminRole",
				"type": "bytes32"
			}
		],
		"name": "RoleAdminChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "RoleGranted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "RoleRevoked",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "staffId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "walletAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "username",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "StaffAccountCreated",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "DEFAULT_ADMIN_ROLE",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MANAGER_ROLE",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "STAFF_ROLE",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "username",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "staffAddress",
				"type": "address"
			}
		],
		"name": "createStaffAccount",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			}
		],
		"name": "getRoleAdmin",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getRoleMember",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			}
		],
		"name": "getRoleMemberCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "staffId",
				"type": "uint256"
			}
		],
		"name": "getStaffAccount",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "walletAddress",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "username",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "createdAt",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "exists",
						"type": "bool"
					}
				],
				"internalType": "struct StaffRegistry.StaffAccount",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "staffAddress",
				"type": "address"
			}
		],
		"name": "getStaffId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "grantRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "hasRole",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "isStaff",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "managerWallet",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "renounceRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "revokeRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newManager",
				"type": "address"
			}
		],
		"name": "updateManager",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "staffAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "message",
				"type": "string"
			},
			{
				"internalType": "bytes",
				"name": "signature",
				"type": "bytes"
			}
		],
		"name": "verifyStaffSignature",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] as const satisfies Abi;


// --- 2. INVENTORY LEDGER ABI (Third JSON Block) ---
export const INVENTORY_LEDGER_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_registryAddress",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "recordId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			}
		],
		"name": "ItemAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "recordId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "int256",
				"name": "changeAmount",
				"type": "int256"
			}
		],
		"name": "StockUpdated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_encryptedData",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_initialStock",
				"type": "uint256"
			}
		],
		"name": "addItem",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_recordId",
				"type": "uint256"
			}
		],
		"name": "getItemData",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "items",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "recordId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "encryptedData",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "currentStock",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalSold",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "registry",
		"outputs": [
			{
				"internalType": "contract IStaffRegistry",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_recordId",
				"type": "uint256"
			},
			{
				"internalType": "int256",
				"name": "_changeAmount",
				"type": "int256"
			}
		],
		"name": "updateStock",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
] as const satisfies Abi;


// --- 3. TRANSACTION PROCESSOR ABI (Fourth JSON Block) ---
export const TRANSACTION_PROCESSOR_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_ledgerAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_registryAddress",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "txId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			}
		],
		"name": "SaleProcessed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_txId",
				"type": "uint256"
			}
		],
		"name": "getTransaction",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ledger",
		"outputs": [
			{
				"internalType": "contract InventoryLedger",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_encryptedTransactionData",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "_salesManagerWallet",
				"type": "address"
			}
		],
		"name": "processSale",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "registry",
		"outputs": [
			{
				"internalType": "contract IStaffRegistry",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "transactions",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "txId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "encryptedPayload",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "salesManagerAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] as const satisfies Abi;


// --- 4. DEPLOYMENT ADDRESSES (Placeholders - MUST BE UPDATED AFTER DEPLOYMENT) ---
// Note: These addresses are conceptual Hardhat defaults for local development.
const HARDHAT_REGISTRY_ADDR: string = "0x5FbDB2315678aeCB367F032d93F642f64180aa3";
const HARDHAT_LEDGER_ADDR: string = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const HARDHAT_TXN_PROCESSOR_ADDR: string = "0x9fE46755CD0C28CAd0B3F1735aE522E2f48A54c8";

// Use environment variables for production/testnet deployment
const REGISTRY_ADDRESS: string = (process.env.NODE_ENV === 'development' ? HARDHAT_REGISTRY_ADDR : (process.env.VITE_STAFF_REGISTRY_ADDR || "0x_STAFF_REGISTRY_ADDRESS_"));
const LEDGER_ADDRESS: string = (process.env.NODE_ENV === 'development' ? HARDHAT_LEDGER_ADDR : (process.env.VITE_INVENTORY_LEDGER_ADDR || "0x_INVENTORY_LEDGER_ADDRESS_"));
const TXN_PROCESSOR_ADDRESS: string = (process.env.NODE_ENV === 'development' ? HARDHAT_TXN_PROCESSOR_ADDR : (process.env.VITE_TXN_PROCESSOR_ADDR || "0x_TXN_PROCESSOR_ADDRESS_"));


// --- 5. EXPORT CONTRACTS OBJECT ---
export const CONTRACTS = {
    StaffRegistry: {
        address: REGISTRY_ADDRESS,
        abi: STAFF_REGISTRY_ABI,
    },
    InventoryLedger: {
        address: LEDGER_ADDRESS,
        abi: INVENTORY_LEDGER_ABI,
    },
    TransactionProcessor: {
        address: TXN_PROCESSOR_ADDRESS,
        abi: TRANSACTION_PROCESSOR_ABI,
    }
};

// --- 6. EXPORT ROLE HASHES ---
// Manager Role Hash: keccak256("MANAGER_ROLE")
export const MANAGER_ROLE_HASH: string = '0x17282b0f44e138a834220b329437145e14b5536412140ed5445217a2202613b1'; 
// Staff Role Hash: keccak256("STAFF_ROLE")
export const STAFF_ROLE_HASH: string = '0x74291244519446f24be9859f515099042b083321523455a2d8299874a7962459';