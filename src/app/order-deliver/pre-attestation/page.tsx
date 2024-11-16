'use client';

import Image from 'next/image';
import PreAttestationVerification from '@/components/attestation/PreAttestationVerification';
import { Suspense } from 'react';

import { IDKitWidget, ISuccessResult, useIDKit, VerificationLevel } from '@worldcoin/idkit';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import useOrders from '@/hooks/useOrders';

import { verifyAction } from '@/utils/world-id';

import './pre-attestation.css';

function PreAttestation() {
    const { open, setOpen } = useIDKit();

    const router = useRouter();
    const searchParams = useSearchParams();

    const { getOrder, orders } = useOrders();
    const orderId = searchParams.get('id') as string;
    const order = useMemo(() => getOrder(orderId), [orders]);

    const [side, setSide] = useState<'logistics' | 'recipient'>();

    const [hashLogistics, setHashLogistics] = useState('');
    const [hashReceiver, setHashReceiver] = useState('');

    useEffect(() => {
        if (!open) setSide(undefined);
    }, [open]);

    useEffect(() => {
        if (side) setOpen(true);
    }, [side]);

    return (
        <main className='pre-attestation'>
            <Image src={'/images/svg/marked.svg'} alt='marked' width={42} height={42} />
            <h1>Pre-attestation Verification</h1>
            <section className='verifiers'>
                <PreAttestationVerification
                    side='logistics'
                    order={order}
                    setSide={setSide}
                    hash={hashLogistics}
                />
                <PreAttestationVerification
                    side='recipient'
                    order={order}
                    setSide={setSide}
                    hash={hashReceiver}
                />
                {open && side && (
                    <IDKitWidget
                        key={side}
                        app_id={process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID as any}
                        action={`order-managing`}
                        onSuccess={(result) =>
                            side == 'logistics'
                                ? setHashLogistics(result.nullifier_hash)
                                : setHashReceiver(result.nullifier_hash)
                        }
                        handleVerify={async (result: ISuccessResult) => {
                            await verifyAction(result, `order-managing`);

                            if (!order) throw new Error('Order does not exist');
                            if (order.nullifierHash != result.nullifier_hash)
                                throw new Error('Wrong nullifier hash');
                        }}
                        verification_level={VerificationLevel.Device}
                    />
                )}
            </section>
            <button
                id={`black-button${!hashLogistics || !hashReceiver ? '-disabled' : ''}`}
                onClick={() =>
                    order &&
                    hashLogistics &&
                    hashReceiver &&
                    router.push(`/order-deliver/attestation?id=${orderId}`)
                }
            >
                Proceed to attestation
            </button>
            <div className='info'>
                <Image src={'/images/svg/info.svg'} alt='info' height={18} width={18} />
                <h5>Both parties need to verify their identity before proceeding.</h5>
            </div>
        </main>
    );
}

export default function PreAttestationSuspended() {
    return (
        <Suspense>
            <PreAttestation />
        </Suspense>
    );
}
