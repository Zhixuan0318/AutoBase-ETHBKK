'use client';

import Image from 'next/image';
import SimulationMethods from './SimulationMethods';
import { IDKitWidget, ISuccessResult, VerificationLevel } from '@worldcoin/idkit';

import { useState } from 'react';
import { useAccount } from 'wagmi';

import Firebase from '@/services/Database';

import { verifyAction } from '@/utils/world-id';

import './world-id-verification.css';

interface Props {
    orderId: string;
    updateOrderInList: (orderId: string, updated: Order) => void;
    getOrder: (orderId: string) => Order | undefined;
}

export default function WorldIdVerification({ orderId, updateOrderInList, getOrder }: Props) {
    const { address } = useAccount();

    const [next, setNext] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [hash, setHash] = useState('');

    return next ? (
        <SimulationMethods orderId={orderId} />
    ) : (
        <section className='order-verification'>
            <h1>Payment Completed</h1>
            <Image src={'/images/svg/marked-invert.svg'} alt='marked' width={64} height={64} />
            <div id='description'>
                <Image src={'/images/svg/stack.svg'} alt='stack' width={24} height={24} />
                <h4>
                    Verify yourself with World ID to bind your order with your identity. You will be
                    the only one which can receive the order once delivered by our 3PL (third-party
                    logistic). We will reverify your identity when you receive the parcel at your
                    doorstep.
                </h4>
            </div>
            {isVerified ? (
                <>
                    <button id='black-button' onClick={() => setNext(true)}>
                        Continue
                    </button>
                    <div id='verified'>
                        <Image
                            src={'/images/svg/marked-invert.svg'}
                            alt='success'
                            width={24}
                            height={24}
                        />
                        <h3>World ID Verified</h3>
                        <h4 onClick={() => navigator.clipboard.writeText(hash)}>
                            {hash.slice(0, 4) + '...' + hash.slice(60)}
                        </h4>
                    </div>
                </>
            ) : (
                <>
                    <IDKitWidget
                        app_id={process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID as any}
                        action='order-managing'
                        onSuccess={(result) => {
                            setIsVerified(true);
                            setHash(result.nullifier_hash);
                        }}
                        handleVerify={async (result: ISuccessResult) => {
                            await verifyAction(result, 'order-managing');

                            const order = getOrder(orderId);
                            if (!order || !address) throw new Error('Order does not exist');

                            order.nullifierHash = result.nullifier_hash;
                            updateOrderInList(orderId, order);
                            await new Firebase().updateOrder(address, order);
                        }}
                        verification_level={VerificationLevel.Device}
                    >
                        {({ open }) => (
                            <button id='black-button' onClick={open}>
                                <Image
                                    src={'/images/svg/partners/worldcoin.svg'}
                                    alt='world-id'
                                    width={24}
                                    height={24}
                                />
                                Verify with World ID
                            </button>
                        )}
                    </IDKitWidget>
                </>
            )}
        </section>
    );
}
