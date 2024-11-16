'use client';

import Image from 'next/image';
import Link from 'next/link';
import CodePopUp from '../CodePopUp';

import { useState } from 'react';

import { getAttestation } from '@/utils/attestation';

export default function AttestationLog({
    order,
    party,
}: {
    order: Order | undefined;
    party: 'logistics' | 'receiver';
}) {
    const [attestation, setAttestation] = useState<string>();

    if (!order || !order.attestation || !order.attestation[party] || !order.attestation[party].hash)
        return <></>;

    return (
        <div className='log'>
            <div className='status'>
                <Image src={'/images/svg/marked.svg'} alt='completed' width={18} height={18} />
                {party == 'logistics' ? 'Third Party Logistic (3PL)' : 'Package Recipient'}
            </div>
            <div className='data'>
                <h6
                    onClick={async () => {
                        const data = await getAttestation((order.attestation as any)[party].id);
                        setAttestation(JSON.stringify(data, null, 4));
                    }}
                >
                    Attestation: {order.attestation[party].id}
                </h6>
                <Image
                    src={'/images/svg/copy.svg'}
                    alt='copy'
                    width={20}
                    height={20}
                    onClick={() =>
                        navigator.clipboard.writeText((order.attestation as any)[party].id)
                    }
                />
            </div>
            {attestation && <CodePopUp code={attestation} setCode={setAttestation} />}
            <Link
                href={`https://testnet-scan.sign.global/attestation/onchain_evm_84532_${order.attestation[party].id}`}
                target='_blank'
            >
                <Image
                    src={'/images/svg/open-explorer.svg'}
                    alt='explorer'
                    width={20}
                    height={20}
                />
            </Link>
        </div>
    );
}
