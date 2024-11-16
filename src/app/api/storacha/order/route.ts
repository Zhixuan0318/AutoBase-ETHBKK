import { NextRequest, NextResponse } from 'next/server';

import * as Client from '@web3-storage/w3up-client';
import { StoreMemory } from '@web3-storage/w3up-client/stores/memory';
import * as Proof from '@web3-storage/w3up-client/proof';
import { Signer } from '@web3-storage/w3up-client/principal/ed25519';

import { readContract } from 'wagmi/actions';
import wagmi from '@/config/wagmi';
import addreses from '@/data/addresses';
import ProductsABI from '@/contracts/ProductsABI.json';

import { provider } from '@/utils/owner';

// vivid huge chat vacuum either fee hole observe ripple paper regret invite aisle insect rain behind donkey hint secret
// hurry shine modify illegal unlock

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        if (!body || !body.orderId) throw new Error('No order was provided');

        const receipt = {
            orderId: body.orderId,
            dispatcher: '0x6F01939f87C681b4FC0a36127Ae0Bd7B4b5B9F40',
            detailLog: {
                warehouseProcessing: body.hashes[0],
                warehouseProcessed: body.hashes[0],
                productPicking: body.hashes[0],
                productPicked: body.hashes[0],
                productPacking: body.hashes[0],
                productPacked: body.hashes[0],
                orderDelivering: body.hashes[0],
                orderDelivered: body.hashes[0],
            },
            approval: {
                pickingTask: ((await provider.getTransactionReceipt(body.hashes[3])) as any).logs[0]
                    .topics[0],
                packingTask: ((await provider.getTransactionReceipt(body.hashes[5])) as any).logs[0]
                    .topics[0],
                deliveryTask: ((await provider.getTransactionReceipt(body.hashes[7])) as any)
                    .logs[0].topics[0],
            },
            onChainStock: Number(
                await readContract(wagmi, {
                    abi: ProductsABI,
                    address: addreses.products,
                    functionName: 'stock',
                    args: [body.productId],
                })
            ),
            timestamp: Date.now(),
        };

        const principal = Signer.parse(process.env.STORACHA_KEY as string);
        const store = new StoreMemory();
        const client = await Client.create({ principal, store });

        const proof = await Proof.parse(process.env.STORACHA_PROOF as string);
        const space = await client.addSpace(proof);
        await client.setCurrentSpace(space.did());

        const blob = new Blob([JSON.stringify(receipt)], { type: 'application/json' });
        const link = await client.uploadFile(new File([blob], 'order.json'));

        return NextResponse.json({ cid: link.toString() }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}
