import { SignProtocolClient, SpMode, EvmChains, Schema, Attestation } from '@ethsign/sp-sdk';
import { provider } from '@/utils/owner';

export async function signAttestation(
    isReceiver: boolean,
    receipt: string,
    evidenceCID: string,
    otherPartyWallet: string,
    otherPartyNullifierHash: string,
    sender: string
) {
    const client = new SignProtocolClient(SpMode.OnChain, {
        chain: EvmChains.baseSepolia,
    });

    const data: any = {
        lifecycleReportCID: receipt,
        evidenceCID,
    };
    data[isReceiver ? 'deliveryManWallet' : 'recipientWallet'] = otherPartyWallet;
    data[isReceiver ? 'deliveryManNullifierHash' : 'recipientNullifierHash'] =
        otherPartyNullifierHash;

    const result = await client.createAttestation({
        schemaId: isReceiver ? '0x3e2' : '0x3e3',
        data,
        indexingValue: sender.toLowerCase(),
    });

    const txReceipt = await provider.waitForTransaction(result.txHash as any);
    if (txReceipt?.status != 1) throw new Error('Tx error');

    return result;
}

export async function getSchema(id: string): Promise<Schema> {
    const client = new SignProtocolClient(SpMode.OnChain, {
        chain: EvmChains.baseSepolia,
    });

    return await client.getSchema(id);
}

export async function getAttestation(id: string): Promise<Attestation> {
    const client = new SignProtocolClient(SpMode.OnChain, {
        chain: EvmChains.baseSepolia,
    });

    return await client.getAttestation(id);
}
