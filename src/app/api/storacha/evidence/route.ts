import { NextRequest, NextResponse } from 'next/server';

import * as Client from '@web3-storage/w3up-client';
import { StoreMemory } from '@web3-storage/w3up-client/stores/memory';
import * as Proof from '@web3-storage/w3up-client/proof';
import { Signer } from '@web3-storage/w3up-client/principal/ed25519';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('blob') as File | null;
        if (!file) throw new Error('No file was provided');

        const principal = Signer.parse(process.env.STORACHA_KEY as string);
        const store = new StoreMemory();
        const client = await Client.create({ principal, store });

        const proof = await Proof.parse(process.env.STORACHA_PROOF as string);
        const space = await client.addSpace(proof);
        await client.setCurrentSpace(space.did());

        const convertedFile = new File([await file.arrayBuffer()], 'evidence.png');
        const link = await client.uploadFile(convertedFile);

        return NextResponse.json({ cid: link.toString() }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}
