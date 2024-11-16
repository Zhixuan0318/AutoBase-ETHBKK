import addresses from '@/data/addresses';
import { signMessage } from '@/utils/owner';
import { ContractFunctionParameters } from 'viem';

const abi = [
    {
        inputs: [
            {
                internalType: 'string',
                name: 'orderId',
                type: 'string',
            },
            {
                internalType: 'enum Enums.ProductId',
                name: 'productId',
                type: 'uint8',
            },
            {
                internalType: 'uint8',
                name: 'v',
                type: 'uint8',
            },
            {
                internalType: 'bytes32',
                name: 'r',
                type: 'bytes32',
            },
            {
                internalType: 'bytes32',
                name: 's',
                type: 'bytes32',
            },
        ],
        name: 'placeOrder',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
] as const;

export default function contracts(orderId: string, productId: number) {
    const signature = signMessage(orderId);

    const args = [orderId, productId, signature.v, signature.r, signature.s];

    const data: ContractFunctionParameters[] = [
        {
            address: addresses.shop,
            abi,
            functionName: 'placeOrder',
            args,
        },
    ];

    return data;
}
