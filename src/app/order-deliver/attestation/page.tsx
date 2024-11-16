'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import Evidence from '@/components/attestation/Evidence';
import WalletWhitelist from '@/components/attestation/WalletWhitelist';
import AttestationLog from '@/components/attestation/AttestationLog';

import { useAccount } from 'wagmi';
import useOrders from '@/hooks/useOrders';
import { useSearchParams } from 'next/navigation';
import { useMemo, useRef, useEffect } from 'react';

import Firebase from '@/services/Database';

import './attestation.css';

function Attestation() {
    const searchParams = useSearchParams();
    const { address } = useAccount();

    const firebase = useRef(new Firebase());

    const { getOrder, orders, updateOrderInList } = useOrders();
    const orderId = searchParams.get('id') as string;
    const [order, setOrder] = useState<Order>();

    const statusToDisplay = useMemo(
        () => (order ? (order.status == 'completed' ? 'processing' : 'delivered') : 'processing'),
        [order?.status]
    );

    useEffect(() => {
        if (orders.length) setOrder(getOrder(orderId));
    }, [orders]);

    useEffect(() => {
        if (order && address && order.status != 'delivered') {
            if (order.attestation?.logistics?.id && order.attestation.receiver?.id) {
                order.status = 'delivered';
                updateOrderInList(order.orderId, { ...order, status: 'delivered' });
            }
            firebase.current.updateOrder(address, order);
        }
    }, [address, order]);

    return (
        <main className='attestation'>
            <h1>Package Signing (Attestation)</h1>
            <div className='order-data'>
                <div className='order-id'>
                    <h4>Order</h4>
                    <h2>#{orderId}</h2>
                </div>
                {order?.receipt && (
                    <div className='receipt'>
                        <h4>Lifecycle Report</h4>
                        <Link href={`https://${order.receipt}.ipfs.w3s.link`} target='_blank'>
                            <Image
                                src={'/images/svg/marked-invert.svg'}
                                alt='marked'
                                height={20}
                                width={20}
                            />
                            <h3>Recorder on Storacha</h3>
                        </Link>
                    </div>
                )}
                <h5 id={statusToDisplay}>
                    {order
                        ? statusToDisplay.charAt(0).toUpperCase() + statusToDisplay.slice(1)
                        : 'Loading'}
                </h5>
            </div>
            <section className='evidence'>
                <Evidence side='logistics' order={order} updateOrderInList={updateOrderInList} />
                <Evidence side='receiver' order={order} updateOrderInList={updateOrderInList} />
            </section>
            <section className='records'>
                <section className='whitelist'>
                    <h4>Attestation Whitelist</h4>
                    <WalletWhitelist address={address} party='logistic' />
                    <WalletWhitelist address={address} party='receiver' />
                </section>
                <section className='attestation'>
                    <h4>Attestations Created</h4>
                    <AttestationLog order={order} party='logistics' />
                    <AttestationLog order={order} party='receiver' />
                </section>
            </section>
        </main>
    );
}

export default function AttestationSuspended() {
    return (
        <Suspense>
            <Attestation />
        </Suspense>
    );
}
