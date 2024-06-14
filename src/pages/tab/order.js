import { DownOutlined, UserOutlined, CopyOutlined } from '@ant-design/icons';
import { Dropdown, Table, Button, Spin, Empty } from 'antd';
import { Space } from 'antd';
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { baseUrl } from '../../static/Const';
import { WalletContext } from '../../WalletContext';
import { useAccount, useContract, useContractWrite } from '@starknet-react/core';

export default function Order() {
  const abi = [
    {
      "type": "impl",
      "name": "LockingContract",
      "interface_name": "src::mintable_lock_interface::ILockingContract"
    },
    {
      "type": "interface",
      "name": "src::mintable_lock_interface::ILockingContract",
      "items": [
        {
          "type": "function",
          "name": "set_locking_contract",
          "inputs": [
            {
              "name": "locking_contract",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "get_locking_contract",
          "inputs": [],
          "outputs": [
            {
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "state_mutability": "view"
        }
      ]
    },
    {
      "type": "impl",
      "name": "LockAndDelegate",
      "interface_name": "src::mintable_lock_interface::ILockAndDelegate"
    },
    {
      "type": "struct",
      "name": "core::integer::u256",
      "members": [
        {
          "name": "low",
          "type": "core::integer::u128"
        },
        {
          "name": "high",
          "type": "core::integer::u128"
        }
      ]
    },
    {
      "type": "interface",
      "name": "src::mintable_lock_interface::ILockAndDelegate",
      "items": [
        {
          "type": "function",
          "name": "lock_and_delegate",
          "inputs": [
            {
              "name": "delegatee",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "amount",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "lock_and_delegate_by_sig",
          "inputs": [
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "delegatee",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "amount",
              "type": "core::integer::u256"
            },
            {
              "name": "nonce",
              "type": "core::felt252"
            },
            {
              "name": "expiry",
              "type": "core::integer::u64"
            },
            {
              "name": "signature",
              "type": "core::array::Array::<core::felt252>"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        }
      ]
    },
    {
      "type": "impl",
      "name": "MintableToken",
      "interface_name": "src::mintable_token_interface::IMintableToken"
    },
    {
      "type": "interface",
      "name": "src::mintable_token_interface::IMintableToken",
      "items": [
        {
          "type": "function",
          "name": "permissioned_mint",
          "inputs": [
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "amount",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "permissioned_burn",
          "inputs": [
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "amount",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        }
      ]
    },
    {
      "type": "impl",
      "name": "MintableTokenCamelImpl",
      "interface_name": "src::mintable_token_interface::IMintableTokenCamel"
    },
    {
      "type": "interface",
      "name": "src::mintable_token_interface::IMintableTokenCamel",
      "items": [
        {
          "type": "function",
          "name": "permissionedMint",
          "inputs": [
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "amount",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "permissionedBurn",
          "inputs": [
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "amount",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        }
      ]
    },
    {
      "type": "impl",
      "name": "Replaceable",
      "interface_name": "src::replaceability_interface::IReplaceable"
    },
    {
      "type": "struct",
      "name": "core::array::Span::<core::felt252>",
      "members": [
        {
          "name": "snapshot",
          "type": "@core::array::Array::<core::felt252>"
        }
      ]
    },
    {
      "type": "struct",
      "name": "src::replaceability_interface::EICData",
      "members": [
        {
          "name": "eic_hash",
          "type": "core::starknet::class_hash::ClassHash"
        },
        {
          "name": "eic_init_data",
          "type": "core::array::Span::<core::felt252>"
        }
      ]
    },
    {
      "type": "enum",
      "name": "core::option::Option::<src::replaceability_interface::EICData>",
      "variants": [
        {
          "name": "Some",
          "type": "src::replaceability_interface::EICData"
        },
        {
          "name": "None",
          "type": "()"
        }
      ]
    },
    {
      "type": "enum",
      "name": "core::bool",
      "variants": [
        {
          "name": "False",
          "type": "()"
        },
        {
          "name": "True",
          "type": "()"
        }
      ]
    },
    {
      "type": "struct",
      "name": "src::replaceability_interface::ImplementationData",
      "members": [
        {
          "name": "impl_hash",
          "type": "core::starknet::class_hash::ClassHash"
        },
        {
          "name": "eic_data",
          "type": "core::option::Option::<src::replaceability_interface::EICData>"
        },
        {
          "name": "final",
          "type": "core::bool"
        }
      ]
    },
    {
      "type": "interface",
      "name": "src::replaceability_interface::IReplaceable",
      "items": [
        {
          "type": "function",
          "name": "get_upgrade_delay",
          "inputs": [],
          "outputs": [
            {
              "type": "core::integer::u64"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "get_impl_activation_time",
          "inputs": [
            {
              "name": "implementation_data",
              "type": "src::replaceability_interface::ImplementationData"
            }
          ],
          "outputs": [
            {
              "type": "core::integer::u64"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "add_new_implementation",
          "inputs": [
            {
              "name": "implementation_data",
              "type": "src::replaceability_interface::ImplementationData"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "remove_implementation",
          "inputs": [
            {
              "name": "implementation_data",
              "type": "src::replaceability_interface::ImplementationData"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "replace_to",
          "inputs": [
            {
              "name": "implementation_data",
              "type": "src::replaceability_interface::ImplementationData"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        }
      ]
    },
    {
      "type": "impl",
      "name": "AccessControlImplExternal",
      "interface_name": "src::access_control_interface::IAccessControl"
    },
    {
      "type": "interface",
      "name": "src::access_control_interface::IAccessControl",
      "items": [
        {
          "type": "function",
          "name": "has_role",
          "inputs": [
            {
              "name": "role",
              "type": "core::felt252"
            },
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "get_role_admin",
          "inputs": [
            {
              "name": "role",
              "type": "core::felt252"
            }
          ],
          "outputs": [
            {
              "type": "core::felt252"
            }
          ],
          "state_mutability": "view"
        }
      ]
    },
    {
      "type": "impl",
      "name": "RolesImpl",
      "interface_name": "src::roles_interface::IMinimalRoles"
    },
    {
      "type": "interface",
      "name": "src::roles_interface::IMinimalRoles",
      "items": [
        {
          "type": "function",
          "name": "is_governance_admin",
          "inputs": [
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "is_upgrade_governor",
          "inputs": [
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "register_governance_admin",
          "inputs": [
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "remove_governance_admin",
          "inputs": [
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "register_upgrade_governor",
          "inputs": [
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "remove_upgrade_governor",
          "inputs": [
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "renounce",
          "inputs": [
            {
              "name": "role",
              "type": "core::felt252"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        }
      ]
    },
    {
      "type": "impl",
      "name": "ERC20Impl",
      "interface_name": "openzeppelin::token::erc20::interface::IERC20"
    },
    {
      "type": "interface",
      "name": "openzeppelin::token::erc20::interface::IERC20",
      "items": [
        {
          "type": "function",
          "name": "name",
          "inputs": [],
          "outputs": [
            {
              "type": "core::felt252"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "symbol",
          "inputs": [],
          "outputs": [
            {
              "type": "core::felt252"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "decimals",
          "inputs": [],
          "outputs": [
            {
              "type": "core::integer::u8"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "total_supply",
          "inputs": [],
          "outputs": [
            {
              "type": "core::integer::u256"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "balance_of",
          "inputs": [
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::integer::u256"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "allowance",
          "inputs": [
            {
              "name": "owner",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "spender",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::integer::u256"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "transfer",
          "inputs": [
            {
              "name": "recipient",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "amount",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "transfer_from",
          "inputs": [
            {
              "name": "sender",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "recipient",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "amount",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "approve",
          "inputs": [
            {
              "name": "spender",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "amount",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        }
      ]
    },
    {
      "type": "impl",
      "name": "ERC20CamelOnlyImpl",
      "interface_name": "openzeppelin::token::erc20::interface::IERC20CamelOnly"
    },
    {
      "type": "interface",
      "name": "openzeppelin::token::erc20::interface::IERC20CamelOnly",
      "items": [
        {
          "type": "function",
          "name": "totalSupply",
          "inputs": [],
          "outputs": [
            {
              "type": "core::integer::u256"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "balanceOf",
          "inputs": [
            {
              "name": "account",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::integer::u256"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "transferFrom",
          "inputs": [
            {
              "name": "sender",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "recipient",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "amount",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        }
      ]
    },
    {
      "type": "constructor",
      "name": "constructor",
      "inputs": [
        {
          "name": "name",
          "type": "core::felt252"
        },
        {
          "name": "symbol",
          "type": "core::felt252"
        },
        {
          "name": "decimals",
          "type": "core::integer::u8"
        },
        {
          "name": "initial_supply",
          "type": "core::integer::u256"
        },
        {
          "name": "recipient",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "permitted_minter",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "provisional_governance_admin",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "upgrade_delay",
          "type": "core::integer::u64"
        }
      ]
    },
    {
      "type": "function",
      "name": "increase_allowance",
      "inputs": [
        {
          "name": "spender",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "added_value",
          "type": "core::integer::u256"
        }
      ],
      "outputs": [
        {
          "type": "core::bool"
        }
      ],
      "state_mutability": "external"
    },
    {
      "type": "function",
      "name": "decrease_allowance",
      "inputs": [
        {
          "name": "spender",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "subtracted_value",
          "type": "core::integer::u256"
        }
      ],
      "outputs": [
        {
          "type": "core::bool"
        }
      ],
      "state_mutability": "external"
    },
    {
      "type": "function",
      "name": "increaseAllowance",
      "inputs": [
        {
          "name": "spender",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "addedValue",
          "type": "core::integer::u256"
        }
      ],
      "outputs": [
        {
          "type": "core::bool"
        }
      ],
      "state_mutability": "external"
    },
    {
      "type": "function",
      "name": "decreaseAllowance",
      "inputs": [
        {
          "name": "spender",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "subtractedValue",
          "type": "core::integer::u256"
        }
      ],
      "outputs": [
        {
          "type": "core::bool"
        }
      ],
      "state_mutability": "external"
    },
    {
      "type": "event",
      "name": "src::strk::erc20_lockable::ERC20Lockable::Transfer",
      "kind": "struct",
      "members": [
        {
          "name": "from",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        },
        {
          "name": "to",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        },
        {
          "name": "value",
          "type": "core::integer::u256",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "src::strk::erc20_lockable::ERC20Lockable::Approval",
      "kind": "struct",
      "members": [
        {
          "name": "owner",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        },
        {
          "name": "spender",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        },
        {
          "name": "value",
          "type": "core::integer::u256",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "src::replaceability_interface::ImplementationAdded",
      "kind": "struct",
      "members": [
        {
          "name": "implementation_data",
          "type": "src::replaceability_interface::ImplementationData",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "src::replaceability_interface::ImplementationRemoved",
      "kind": "struct",
      "members": [
        {
          "name": "implementation_data",
          "type": "src::replaceability_interface::ImplementationData",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "src::replaceability_interface::ImplementationReplaced",
      "kind": "struct",
      "members": [
        {
          "name": "implementation_data",
          "type": "src::replaceability_interface::ImplementationData",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "src::replaceability_interface::ImplementationFinalized",
      "kind": "struct",
      "members": [
        {
          "name": "impl_hash",
          "type": "core::starknet::class_hash::ClassHash",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "src::access_control_interface::RoleGranted",
      "kind": "struct",
      "members": [
        {
          "name": "role",
          "type": "core::felt252",
          "kind": "data"
        },
        {
          "name": "account",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        },
        {
          "name": "sender",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "src::access_control_interface::RoleRevoked",
      "kind": "struct",
      "members": [
        {
          "name": "role",
          "type": "core::felt252",
          "kind": "data"
        },
        {
          "name": "account",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        },
        {
          "name": "sender",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "src::access_control_interface::RoleAdminChanged",
      "kind": "struct",
      "members": [
        {
          "name": "role",
          "type": "core::felt252",
          "kind": "data"
        },
        {
          "name": "previous_admin_role",
          "type": "core::felt252",
          "kind": "data"
        },
        {
          "name": "new_admin_role",
          "type": "core::felt252",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "src::roles_interface::GovernanceAdminAdded",
      "kind": "struct",
      "members": [
        {
          "name": "added_account",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        },
        {
          "name": "added_by",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "src::roles_interface::GovernanceAdminRemoved",
      "kind": "struct",
      "members": [
        {
          "name": "removed_account",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        },
        {
          "name": "removed_by",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "src::roles_interface::UpgradeGovernorAdded",
      "kind": "struct",
      "members": [
        {
          "name": "added_account",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        },
        {
          "name": "added_by",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "src::roles_interface::UpgradeGovernorRemoved",
      "kind": "struct",
      "members": [
        {
          "name": "removed_account",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        },
        {
          "name": "removed_by",
          "type": "core::starknet::contract_address::ContractAddress",
          "kind": "data"
        }
      ]
    },
    {
      "type": "event",
      "name": "src::strk::erc20_lockable::ERC20Lockable::Event",
      "kind": "enum",
      "variants": [
        {
          "name": "Transfer",
          "type": "src::strk::erc20_lockable::ERC20Lockable::Transfer",
          "kind": "nested"
        },
        {
          "name": "Approval",
          "type": "src::strk::erc20_lockable::ERC20Lockable::Approval",
          "kind": "nested"
        },
        {
          "name": "ImplementationAdded",
          "type": "src::replaceability_interface::ImplementationAdded",
          "kind": "nested"
        },
        {
          "name": "ImplementationRemoved",
          "type": "src::replaceability_interface::ImplementationRemoved",
          "kind": "nested"
        },
        {
          "name": "ImplementationReplaced",
          "type": "src::replaceability_interface::ImplementationReplaced",
          "kind": "nested"
        },
        {
          "name": "ImplementationFinalized",
          "type": "src::replaceability_interface::ImplementationFinalized",
          "kind": "nested"
        },
        {
          "name": "RoleGranted",
          "type": "src::access_control_interface::RoleGranted",
          "kind": "nested"
        },
        {
          "name": "RoleRevoked",
          "type": "src::access_control_interface::RoleRevoked",
          "kind": "nested"
        },
        {
          "name": "RoleAdminChanged",
          "type": "src::access_control_interface::RoleAdminChanged",
          "kind": "nested"
        },
        {
          "name": "GovernanceAdminAdded",
          "type": "src::roles_interface::GovernanceAdminAdded",
          "kind": "nested"
        },
        {
          "name": "GovernanceAdminRemoved",
          "type": "src::roles_interface::GovernanceAdminRemoved",
          "kind": "nested"
        },
        {
          "name": "UpgradeGovernorAdded",
          "type": "src::roles_interface::UpgradeGovernorAdded",
          "kind": "nested"
        },
        {
          "name": "UpgradeGovernorRemoved",
          "type": "src::roles_interface::UpgradeGovernorRemoved",
          "kind": "nested"
        }
      ]
    }
  ];
  const claimAbi = [
    {
      "type": "impl",
      "name": "AtomicStark",
      "interface_name": "starknet_multiple_contracts::IAtomicStark"
    },
    {
      "type": "enum",
      "name": "core::bool",
      "variants": [
        {
          "name": "False",
          "type": "()"
        },
        {
          "name": "True",
          "type": "()"
        }
      ]
    },
    {
      "type": "interface",
      "name": "starknet_multiple_contracts::IAtomicStark",
      "items": [
        {
          "type": "function",
          "name": "get_alice",
          "inputs": [],
          "outputs": [
            {
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "get_caller",
          "inputs": [],
          "outputs": [
            {
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "get_bob",
          "inputs": [],
          "outputs": [
            {
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "get_locktime",
          "inputs": [],
          "outputs": [
            {
              "type": "core::integer::u64"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "get_hash",
          "inputs": [],
          "outputs": [
            {
              "type": "core::array::Array::<core::integer::u8>"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "calculate_hash",
          "inputs": [
            {
              "name": "secret",
              "type": "core::array::Array::<core::integer::u8>"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "calculate_hash_test",
          "inputs": [
            {
              "name": "secret",
              "type": "core::array::Array::<core::integer::u8>"
            }
          ],
          "outputs": [
            {
              "type": "core::array::Array::<core::integer::u8>"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "calculate_hash_test_a",
          "inputs": [
            {
              "name": "secret",
              "type": "core::array::Array::<core::integer::u8>"
            }
          ],
          "outputs": [
            {
              "type": "core::array::Array::<core::integer::u8>"
            }
          ],
          "state_mutability": "view"
        },
        {
          "type": "function",
          "name": "bob_claim",
          "inputs": [
            {
              "name": "hash",
              "type": "core::array::Array::<core::integer::u8>"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        },
        {
          "type": "function",
          "name": "alice_withdraw",
          "inputs": [],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "external"
        }
      ]
    },
    {
      "type": "constructor",
      "name": "constructor",
      "inputs": [
        {
          "name": "_alice",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "_bob",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "_token",
          "type": "core::starknet::contract_address::ContractAddress"
        },
        {
          "name": "_locktime",
          "type": "core::integer::u64"
        },
        {
          "name": "_amount",
          "type": "core::integer::u128"
        },
        {
          "name": "hash_1",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_2",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_3",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_4",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_5",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_6",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_7",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_8",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_9",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_10",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_11",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_12",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_13",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_14",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_15",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_16",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_17",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_18",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_19",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_20",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_21",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_22",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_23",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_24",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_25",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_26",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_27",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_28",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_29",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_30",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_31",
          "type": "core::integer::u8"
        },
        {
          "name": "hash_32",
          "type": "core::integer::u8"
        }
      ]
    },
    {
      "type": "event",
      "name": "starknet_multiple_contracts::AtomicStark::Event",
      "kind": "enum",
      "variants": []
    }
  ]
  const { address } = useAccount();
  const {
    btcAddress,
    swapContractAddress,
  } = useContext(WalletContext);
  const { contract: strk_contract } = useContract({
    abi: abi,
    address: '0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D',  //strk contract address;
  });
  const { contract: claimContract } = useContract({
    abi: claimAbi,
    address: swapContractAddress
  })
  const calls_claim = useMemo(() => {
    if (!address) return [];
    return claimContract.populateTransaction["bob_claim"]([0x31, 0x61]);
  }, [claimContract, address]);

 
  const {
    writeAsync: claimMoney
  } = useContractWrite({
    calls: calls_claim
  })

  const handleMenuClick = (e) => {
    console.log('click', e);
  };



  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);


  const items = [
    {
      label: '1',
      key: '1',
      icon: <UserOutlined />,
    },
  ];
  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderid',
      key: 'orderid',
      render: (orderid) => (
        <span>
          {orderid}
          <CopyOutlined style={{ color: '#00D889', marginLeft: '8px', cursor: 'pointer' }} />
        </span>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => <div style={{ width: '90px' }}>{new Date(timestamp).toLocaleString()}</div>,
    },
    {
      title: 'Node ID',
      dataIndex: 'node_id',
      key: 'node_id',
    },
    {
      title: 'Type',
      key: 'swaptype',
      dataIndex: 'swaptype',
      render: (swaptype) => <div style={{ color: '#00D889' }}>{swaptype}</div>,
    },
    {
      dataIndex: 'hashlock',
      title: 'LockHash',
      key: 'hashlock',
    },
    {
      title: 'Price',
      dataIndex: 'amount_in',
      key: 'amount_in',
    },
    {
      title: 'Amount In',
      dataIndex: 'amount_in',
      key: 'amount_in',
    },
    {
      title: 'Amount Out',
      dataIndex: 'amount_out',
      key: 'amount_out',
    },
    {
      title: 'Tx hash',
      dataIndex: 'transaction_hash',
      key: 'transaction_hash',
      render: (transaction_hash) => (
        <span>
          {transaction_hash}
          <CopyOutlined style={{ color: '#00D889', marginLeft: '8px', cursor: 'pointer' }} />
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (val) => <span style={{ color: '#00D889' }}>{<Button onClick={() => {
        claimMoney()

      }}>claim</Button>}</span>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: () => <span style={{}}>waiting node Processing</span>,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userBTCAddress = btcAddress;
        const userSTRKAddress = 'user_strkaddress_value';

        // const url = baseUrl+`v1/userOrder?user_btcaddress=${userBTCAddress}&user_strkaddress=test`;
        const url = baseUrl + `api/v1/userOrder?user_btcaddress=${userBTCAddress}&user_strkaddress=${userSTRKAddress}`;
        const response = await fetch(url);

        const data = await response.json();
        console.log("data---", data);
        // alert(JSON.stringify(data))
        setData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className='order'>
      <div className='ltop'>
        <div className='l'>
          <Dropdown menu={menuProps}>
            <Button style={{ border: '1px solid #5c5c5c', color: '#fff' }} ghost>
              <Space>
                Buy/Sell
                <DownOutlined style={{ fontSize: '10px' }} />
              </Space>
            </Button>
          </Dropdown>
          <Dropdown menu={menuProps}>
            <Button style={{ border: '1px solid #5c5c5c', color: '#fff' }} ghost>
              <Space>
                All Token
                <DownOutlined style={{ fontSize: '10px' }} />
              </Space>
            </Button>
          </Dropdown>
          <Dropdown menu={menuProps}>
            <Button style={{ border: '1px solid #5c5c5c', color: '#fff' }} ghost>
              <Space>
                All Status
                <DownOutlined style={{ fontSize: '10px' }} />
              </Space>
            </Button>
          </Dropdown>
        </div>
        <div className='r'>
          <Button type="link">
            Make a pool
          </Button>
        </div>
      </div>
      <div className='tables'>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <Spin size="large" />
          </div>
        ) : data.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data available" />
        ) : (
          <Table
            scroll={{ x: 1300 }}
            columns={columns}
            dataSource={data}
            rowKey="orderid"
          />
        )}
      </div>
    </div>
  );
}