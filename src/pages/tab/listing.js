import { CopyOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { Modal } from 'antd';
import { Button, Pagination, Spin } from 'antd/es';
import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Tabs } from 'antd';
import { WalletContext } from '../../WalletContext';
import { useContract } from "@starknet-react/core";
import { RpcProvider, Contract, uint256 } from 'starknet'
import BigInt from 'big-integer';

import { useAccount, useBalance, useContractRead, useContractWrite, useNetwork } from "@starknet-react/core";
import { Button as notificationButton, notification, Space } from 'antd';
import useAllowanceRead from './starknet-contract-provider';
import bigInt from 'big-integer';
import { getUTXO, lockMoneyIntoBTCScript, synch_makeorder } from '../../Utils/AtomicService';
import { baseUrl } from '../../static/Const';





export default function Listing() {

    const [isLoading, setIsLoading] = useState(false);
    const [list, setList] = useState([])
    const [current, setCurrent] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [buyAmount, setBuyAmount] = useState('10');
    const [selectedCard, setSelectedCard] = useState({
        title: 'BTC',
        code: 1,
        price: 1,
        ps: 1,
        remaining: 1,
        fee: 1,
        Total: 1,
        Value: 1,
        server: 1
    })
    const {
        btcAddress,
        strkAddress,
        setStrkAddress,
        setBtcAddress,
        setStrkAddressIsDropdownOpen,
        setBtcAddressIsDropdownOpen,

        isStrkAddressDropdownOpen,
        isBtcAddressDropdownOpen,
        setSwapContractAddress,
        handleStarknetClick,
        CloseConnectStarknet,
        handleBitcoinClick
    } = useContext(WalletContext);
    const [api, contextHolder] = notification.useNotification();
    const openNotificationWithIcon = (type) => {
        api[type]({
            message: 'Notification Title',
            description:
                'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
            placement: 'bottomLeft', // 设置通知位置为屏幕左下角
            duration: 1.5, // 设置通知持续时间为 3 秒
            style: {
                // backgroundColor: '#262626', // 设置通知背景颜色为黑色
                // color: '#fff', // 设置通知文本颜色为白色
            },
        });
    };

    const testAddress = "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D";

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

    const abi_factory = [
        {
            "type": "impl",
            "name": "AtomicStarkFactory",
            "interface_name": "starknet_multiple_contracts::IAtomicStarkFactory"
        },
        {
            "type": "interface",
            "name": "starknet_multiple_contracts::IAtomicStarkFactory",
            "items": [
                {
                    "type": "function",
                    "name": "create",
                    "inputs": [
                        {
                            "name": "ContractClassHash",
                            "type": "core::starknet::class_hash::ClassHash"
                        },
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
                    ],
                    "outputs": [
                        {
                            "type": "core::starknet::contract_address::ContractAddress"
                        }
                    ],
                    "state_mutability": "external"
                }
            ]
        },
        {
            "type": "event",
            "name": "starknet_multiple_contracts::AtomicStarkFactory::AtomicSwapCreated",
            "kind": "struct",
            "members": [
                {
                    "name": "alice",
                    "type": "core::starknet::contract_address::ContractAddress",
                    "kind": "key"
                },
                {
                    "name": "bob",
                    "type": "core::starknet::contract_address::ContractAddress",
                    "kind": "key"
                },
                {
                    "name": "locktime",
                    "type": "core::integer::u64",
                    "kind": "key"
                },
                {
                    "name": "amount",
                    "type": "core::integer::u128",
                    "kind": "key"
                }
            ]
        },
        {
            "type": "event",
            "name": "starknet_multiple_contracts::AtomicStarkFactory::Event",
            "kind": "enum",
            "variants": [
                {
                    "name": "AtomicSwapCreated",
                    "type": "starknet_multiple_contracts::AtomicStarkFactory::AtomicSwapCreated",
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

    const { contract: strk_contract } = useContract({
        abi: abi,
        address: '0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D',  //strk contract address;
    });

    // console.log('contract',strk_contract);
    const { contract: claimContract } = useContract({
        abi: claimAbi,
        address: "0x0093b7bc84022d164d022fecd24a54a05a10c232db0d029d421fa3b9fa3fc786"
    })
    const { contract: atomic_factory_contract } = useContract({
        abi: abi_factory,
        address: '0x02177a3a2ce3daaf21f65c8df1b031f6d69d292b92354ce842180e098349911f',  //strk contract address;
    });
    // console.log('atomic_factory_contract',atomic_factory_contract);

    const { data, isError, balance_isLoading, error } = useContractRead({
        functionName: "balance_of",
        args: [strkAddress],
        abi,
        address: testAddress,
        watch: true,
    });

    const { approve_data, approve_isError, approve_isLoading, approve_error } = useContractRead({
        functionName: "allowance",
        args: ['0x03c096e020443492c5cFa99106e9fe343a8E579fbB49Ad181AaC7f244Dd4337F', '0x02177a3a2ce3daaf21f65c8df1b031f6d69d292b92354ce842180e098349911f'],
        abi,
        address: testAddress,
        watch: true,
    });

    //approve contract of strk
    // let calls = [];
    var calls_approve = useMemo(() => {
        if (!address || !strk_contract) return [];
        return strk_contract.populateTransaction["approve"]('0x02177a3a2ce3daaf21f65c8df1b031f6d69d292b92354ce842180e098349911f', { low: buyAmount * BigInt(1000000000000000000), high: 0 });
    }, [strk_contract, address]);




    const {
        writeAsync,
        approved_data,
        isPending,
    } = useContractWrite({
        calls: calls_approve,
    });


    //invoke create funcion
    const calls_create = useMemo(() => {
        if (!address || !atomic_factory_contract) return [];
        // console.log('开始调用合约')
        // 移除非空断言操作符 !
        return atomic_factory_contract.populateTransaction["create"](
            '0x02827c19d4afc5ea2615b77e04f54ebfeb0c4834cd37e317b534be12b94592a4',
            '0x02221B06403918b23F2DD1717D8Ef346fFc85C069efE7FBF680c21A5bDfE5715',
            '0x02221B06403918b23F2DD1717D8Ef346fFc85C069efE7FBF680c21A5bDfE5715',
            '0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D',
            100,
            buyAmount * bigInt(1000000000000000000),
            0xa7,
            0x3f,
            0xcf,
            0x33,
            0x96,
            0x40,
            0x92,
            0x92,
            0x07,
            0x28,
            0x1f,
            0xb8,
            0xe0,
            0x38,
            0x88,
            0x48,
            0x06,
            0xe2,
            0xeb,
            0x08,
            0x40,
            0xf2,
            0x24,
            0x56,
            0x94,
            0xdb,
            0xba,
            0x1d,
            0x5c,
            0xc8,
            0x9e,
            0x65);
    }, [atomic_factory_contract, address]);






    const calls_claim = useMemo(() => {
        if (!address || !strk_contract) return [];
        return claimContract.populateTransaction["bob_claim"]([0x31, 0x61]);
    }, [claimContract, address]);




    const {
        writeAsync: writeCreate,
        Create_data,
        Create_isPending,
    } = useContractWrite({
        calls: calls_create,
    });


    const {
        writeAsync: claimMoney
    } = useContractWrite({
        calls: calls_claim
    })


    const { TabPane } = Tabs;

    const handleInputChange = (e) => {
        // 更新buyAmount状态
        setBuyAmount(e.target.value);
    };

    const handleMax = (e) => {
        // 更新buyAmount状态
        setBuyAmount((BigInt(data) / BigInt(1000000000000000000)));

    };

    const showModal = () => {

        //增加判断是否已经连接上了两个钱包，如果其中一个没连接上，直接
        if (!btcAddress || btcAddress === '') {
            handleBitcoinClick();
            return;
        }
        if (!address || address === '') {
            handleStarknetClick();
            return
        }
        setIsModalOpen(true);
    };
    const handleOk = () => {

        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const HandleSwap = async () => {
        setIsLoading(true); // 设置加载状态为 true
        const param = {
            alice_address: btcAddress,
            bob_address: 'mwfFsVm3qpdcHnfanJ29EafpEDTCwnd9Bf'
        }
        //加锁以后生成订单通知服务器工厂合约生产合约
        console.log('param',param);
        const tx_id = lockMoneyIntoBTCScript(param);
        console.log(tx_id);
        // const makeorderParam = {
        //     nodeid: selectedCard.nodeid,
        //     swaptype: "btc2strk",
        //     btcAddress: btcAddress,
        //     amount_in: -1,
        //     amount_out: -1,
        //     transaction_hash: tx_id,
        //     hashlock: param.hash_lock,
        //     node_btcaddress: param.btcAddress,
        //     node_strkaddress: param.strkaddress,
        // }
        // await synch_makeorder(tx_id);
        // try {
        //     //获取当前地址余额
        //     if (address == '') {
        //         console.log('未连接钱包', strkAddress);
        //         openNotificationWithIcon('error');

        //     } else {
        // let approved_amount = await get_strk_Token_allowance(strkAddress);

        //         if (approved_amount >= buyAmount) {

        //             // console.log('额度足，无需授权');
        // await writeAsync()
        // let new_contract = await writeCreate();

        // console.log('new_contract', new_contract);

        // let atomic_child_contract_address = await get_transactionhash_result(new_contract['transaction_hash']);
        let atomic_child_contract_address = await get_transactionhash_result('0x22fdf943a12643709fc931a4be4d96524d6c483944590f5942af63376002542')
    
        setSwapContractAddress(atomic_child_contract_address)

        //         } else {
        //             // let ruslt = await writeAsync();
        //             // // // 这里执行交易代码

        //             // console.log('交易状态为', ruslt);


        // let new_contract = await writeCreate();
        //             // console.log('new_contract', new_contract);

        //             // let atomic_child_contract_address = await get_transactionhash_result(new_contract['transaction_hash']);
        //             // console.log('atomic_child_contract_address', atomic_child_contract_address);

        //         }

        //         openNotificationWithIcon('success');
        //         setIsModalOpen(false);
        //         console.log('开始订单信息到节点');

        //         //同步信息给relay   
        //         // await synch_makeorder();
        //         console.log('已经同步订单信息到节点');





        //     }



        // } catch (error) {
        //     console.error(error);
        //     // 处理错误
        // } finally {
        //     setIsLoading(false); // 无论成功或失败,都设置加载状态为 false
        // }

    };

    async function get_transactionhash_result(transaction_hash) {
        console.log(transaction_hash);
        const provider = new RpcProvider({
            nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno/"
        })
        let result = await provider.waitForTransaction(transaction_hash);
        let atomic_child_contract = result.events.find(event => event.from_address === address)?.data[2];
        console.log(result.events.find(event => event.from_address === strkAddress)?.data[2]);
        return atomic_child_contract
    }

    async function get_strk_Token_abi() {
        //initialize Provider
        const provider = new RpcProvider({
            nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno/"
        })
        // Connect the deployed Test contract in Testnet
        const testAddress = '0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D';


        // read abi of Test contract
        const { abi: testAbi } = await provider.getClassAt(testAddress);
        // console.log('abi',testAbi);
        if (testAbi === undefined) {
            throw new Error('no abi.');


        }

        console.log(testAbi);
        return testAbi

    }

    async function get_atomic_factory_abi() {
        //initialize Provider
        const provider = new RpcProvider({
            nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno/"
        })
        // Connect the deployed Test contract in Testnet
        const testAddress = '0x02177a3a2ce3daaf21f65c8df1b031f6d69d292b92354ce842180e098349911f';


        // read abi of Test contract
        const { abi: testAbi } = await provider.getClassAt(testAddress);
        // console.log('abi',testAbi);
        if (testAbi === undefined) {
            throw new Error('no abi.');


        }

        console.log(testAbi);
        return testAbi

    }


    // async function synch_makeorder(tx_id) {
    //     // const data = {
    //     //         node_id: selectedCard.nodeid,
    //     //         swaptype: "strk2btc",
    //     //         timestamp: "2024-04-17T11:30:00.000Z",
    //     //         user_btcaddress: btcAddress,
    //     //         user_strkaddress: strkAddress,
    //     //         amount_in: 1000,
    //     //         amount_out: 0.002,
    //     //         transaction_hash: "transaction_hash_value",
    //     //         hashlock: "hashlock_value",
    //     //         node_btcaddress: selectedCard.node_btcaddress,
    //     //         node_strkaddress: selectedCard.node_strkaddress
    //     // };

    //     const data = {
    //         node_id: selectedCard.nodeid,
    //         swaptype: "btc2strk",
    //         timestamp: new Date(),
    //         user_btcaddress: btcAddress,
    //         user_strkaddress: "address_1",
    //         amount_in: 0.005,
    //         amount_out: 1000,
    //         transaction_hash: "3ef5b8f3eaa67d585f8aab0cb5f880db5743e97887923cc082dfa5f3e20702cd",
    //         hashlock: "hashlock_value",
    //         node_btcaddress: "test",
    //         node_strkaddress: "test"
    //     }

    //     console.log('开始发送请求');
    //     try {
    //         const response = await fetch(baseUrl+'api/v1/makeorder', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(data),
    //         });

    //         if (!response.ok) {
    //             throw new Error('Network response was not ok');
    //         }

    //         console.log('Response:', response);
    //         const responseData = await response.json();
    //         console.log('Response:', responseData);
    //     } catch (error) {
    //         console.error('Error:', error);
    //     }
    // }



    async function get_strk_Token_allowance() {

        const provider = new RpcProvider({
            nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno/"
        })

        const testAddress = '0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D';
        const { abi: testAbi } = await provider.getClassAt(testAddress);


        if (testAbi === undefined) {
            throw new Error('no abi.');
        }
        const myTestContract = new Contract(testAbi, testAddress, provider);

        // Interaction with the contract with cmeall
        let allowance = await myTestContract.allowance(address, '0x02177a3a2ce3daaf21f65c8df1b031f6d69d292b92354ce842180e098349911f');

        console.log('allowance =', { allowance });

        try {
            if (allowance !== '0x0') {
                // const decimalAllowance = parseInt(allowance, 16);
                const bigIntAllowance = BigInt(allowance);
                const dividedNumber = Number(bigIntAllowance) / BigInt(10 ** 18);
                console.log(dividedNumber);
                return dividedNumber;
            } else {
                console.log('Allowance is 0');
                return 0;
            }
        } catch {
            return 0;
        }

    }


    useEffect(() => {


        const fetchData = async () => {
            try {
                // 45.32.100.53
                const response = await fetch('http://127.0.0.1:4000/api/v1/pool');
                const data = await response.json();
                const formattedList = data.pool.map((item) => ({
                    title: 'BTC',
                    code: `#${item.nodeid}`,
                    price: `1 BTC = ${item.price} STRK`,
                    ps: `≈$${(item.price * 0.0819).toFixed(4)}`,
                    remaining: `${item.blanceof_btc} BTC`,
                    fee: `${item.fee}%`,
                    Total: `${item.supply_btc} BTC`,
                    Value: `≈$${(item.supply_btc * item.price * 0.0819).toFixed(4)}`,
                    server: item.bitcoin_address,
                    bitcoin_address: item.bitcoin_address,
                    balanceof_btc: item.balanceof_btc,
                    starknet_address: item.starknet_address,
                    nodeid: item.nodeid,
                    blanceof_strk: item.blanceof_strk


                }));
                setList(formattedList);
                console.log(data.pool);
            } catch (error) {
                console.error('Error fetching pool data:', error);
            }
        };

        fetchData();

    }, []);
    return (
        <div className='listing'>
            <div className='ltop ss'>
                <div className='l'>

                    <Tabs defaultActiveKey="1">
                        <TabPane tab={<Button type="link">Stark</Button>} key="1">
                            <div className="tab-pane-container">
                                <div className='lbot'>
                                    {list.map((e, i) => {
                                        return (
                                            <div key={i} className={current === i ? 'lbox cur' : 'lbox'} onClick={() => {
                                                setCurrent(i);
                                                setSelectedCard(e);
                                            }}>
                                                <div style={{ marginBottom: '15px' }}>
                                                    <h3 style={{ fontSize: '20px' }}>{e.title}</h3>
                                                    <span style={{ padding: '1px 6px', borderRadius: '4px', background: "rgba(255, 255, 255, 0.15)" }}>{e.code}</span>
                                                </div>
                                                <div style={{ marginBottom: '4px' }}>
                                                    <span className='ds'>Price</span>
                                                    <div className='s'>
                                                        <span style={{ color: "#00D889" }}>{e.price}</span>
                                                        <span style={{ color: "#8B8B8B" }}>{e.ps}</span>
                                                    </div>
                                                </div>
                                                <div style={{ marginBottom: '12px' }}>
                                                    <span className='ds'>Remaining</span>
                                                    <span>{e.remaining}</span>
                                                </div>
                                                <div style={{ marginBottom: '11px' }}>
                                                    <h3>fee</h3>
                                                    <span>{e.fee}</span>
                                                </div>
                                                <div style={{ marginBottom: '13px' }}>
                                                    <span className='ds'>Total Value</span>
                                                    <div className='s'>
                                                        <span>{e.Total}</span>
                                                        <span style={{ color: '#8B8B8B' }}>{e.Value}</span>
                                                    </div>
                                                </div>
                                                <div className='lbs'>
                                                    <div className='lser'>
                                                        <span>Server</span>
                                                        <div className='lrsA'>
                                                            <span style={{ color: '#8B8B8B' }}>{e.server.slice(0, 6) + '..' + e.server.slice(-4)}</span>
                                                            <CopyOutlined style={{ color: '#00D889', cursor: "pointer" }} />
                                                        </div>
                                                    </div>
                                                    <Button onClick={() => [showModal()]} className='bts' ghost>Swap BTC to Strk</Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>


                                <div className='fen'>
                                    <Pagination rootClassName="fens" style={{ color: '#fff' }} total={list.length} />
                                </div></div>

                        </TabPane>

                        <TabPane tab={<Button type="link">Bitcoin</Button>} key="2">
                            <div className="tab-pane-container">
                                <div className='lbot'>
                                    {list.map((e, i) => {
                                        return (
                                            <div key={i} className={current === i ? 'lbox cur' : 'lbox'} onClick={() => {
                                                setCurrent(i);
                                                setSelectedCard(e);
                                            }}>
                                                <div style={{ marginBottom: '15px' }}>
                                                    <h3 style={{ fontSize: '20px' }}>{e.title}</h3>
                                                    <span style={{ padding: '1px 6px', borderRadius: '4px', background: "rgba(255, 255, 255, 0.15)" }}>{e.code}</span>
                                                </div>
                                                <div style={{ marginBottom: '4px' }}>
                                                    <span className='ds'>Price</span>
                                                    <div className='s'>
                                                        <span style={{ color: "#00D889" }}>{e.price}</span>
                                                        <span style={{ color: "#8B8B8B" }}>{e.ps}</span>
                                                    </div>
                                                </div>
                                                <div style={{ marginBottom: '12px' }}>
                                                    <span className='ds'>Remaining</span>
                                                    <span>{e.remaining}</span>
                                                </div>
                                                <div style={{ marginBottom: '11px' }}>
                                                    <h3>fee</h3>
                                                    <span>{e.fee}</span>
                                                </div>
                                                <div style={{ marginBottom: '13px' }}>
                                                    <span className='ds'>Total Value</span>
                                                    <div className='s'>
                                                        <span>{e.Total}</span>
                                                        <span style={{ color: '#8B8B8B' }}>{e.Value}</span>
                                                    </div>
                                                </div>
                                                <div className='lbs'>
                                                    <div className='lser'>
                                                        <span>Server</span>
                                                        <div className='lrsA'>
                                                            <span style={{ color: '#8B8B8B' }}>{e.server.slice(0, 6) + '..' + e.server.slice(-4)}</span>
                                                            <CopyOutlined style={{ color: '#00D889', cursor: "pointer" }} />
                                                        </div>
                                                    </div>
                                                    <Button onClick={() => [showModal()]} className='bts' ghost>Swap Strk to Btc</Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>


                                <div className='fen'>
                                    <Pagination rootClassName="fens" style={{ color: '#fff' }} total={list.length} />
                                </div></div>
                        </TabPane>
                    </Tabs>

                </div>
                <div className='r'>
                    <Button type="link">
                        Make a pool
                    </Button>
                </div>
            </div>

            <Modal footer={null} centered title="Swap BTC to Strk" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <div className='Mod'>
                    <div className="modelBox">
                        <span>Token Address</span>
                        <span className="asA">{selectedCard.title}</span>
                    </div>
                    <div className="modelBox">
                        <span>Price</span>
                        <span className="asA" style={{ color: "#00D889" }}>
                            {selectedCard.price}
                        </span>
                    </div>
                    <div className='modelBox'>
                        <span>Buy Amount</span>
                        <span className='asA'> <Input value={buyAmount} onChange={handleInputChange} /> <a onClick={handleMax} style={{ color: "#00D889" }}  > max </a></span>
                    </div>
                    <div className='modelBox'>
                        <span>Total Value</span>
                        <span className='asA' style={{ color: "#00D889" }}>   {selectedCard.Value}</span>
                    </div>
                    <div className='modelBox'>
                        <span>Service Fee</span>
                        <span className='asA'> {selectedCard.fee} strk</span>
                    </div>
                    <div className='modelBox'>
                        <span className='btnsAA asA' style={{ fontSize: '15px', color: "#00D889" }}>warnlng: please cllam your token on 48 hours,If you  no’t you will perhaps lost your token </span>
                    </div>
                    <div className='modelBox sa'>
                        {contextHolder}
                        <Button
                            className='bts'
                            ghost
                            onClick={HandleSwap}
                            disabled={isLoading}
                        >
                            {isLoading ? <Spin /> : 'Swap'}
                        </Button>
                    </div>
                </div>
            </Modal>







        </div >
    )
}



