'use client';

import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import WorldIdVerification from './WorldIdVerification';
import {
    LifecycleStatus,
    Transaction,
    TransactionButton,
    TransactionSponsor,
    TransactionStatusLabel,
    TransactionStatus,
    TransactionStatusAction,
    TransactionToast,
    TransactionToastAction,
    TransactionToastLabel,
    TransactionToastIcon,
} from '@coinbase/onchainkit/transaction';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import useOrders from '@/hooks/useOrders';

import Database from '@/services/Database';

import shopContracts from '@/contracts/shop';
import { baseSepolia } from 'viem/chains';
import { generateOrderId, generateRandomValue } from '@/utils/generator';

import './order-form.css';

interface Props {
    product: Product;
    setSelectedProduct: React.Dispatch<React.SetStateAction<Product | undefined>>;
}

export default function OrderForm({ product, setSelectedProduct }: Props) {
    const { addOrder, getOrder, updateOrderInList } = useOrders();
    const { address } = useAccount();
    const [isProcessing, setIsProcessing] = useState(false);

    const [countdown, setCountdown] = useState(15);

    const name = useRef('');
    const phone = useRef('');
    const deliveryAddress = useRef('');
    const orderId = useRef(generateOrderId(address ? address : '2sac1rt'));

    const [isApproved, setIsApproved] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            const form = document.querySelector('div.order-background') as HTMLElement;
            form.style.animation = 'none';
        }, 800);
    }, []);

    useEffect(() => {
        if (countdown == 0) handleCloseForm();
        else
            setTimeout(() => {
                if (!isProcessing) setCountdown(countdown - 1);
            }, 1000);
    }, [countdown]);

    const handleCloseForm = useCallback(async () => {
        const form = document.querySelector('div.order-background') as HTMLElement;
        form.style.animation = 'form-appear 750ms ease-out reverse forwards';
        await new Database().reduceOnHold(product.id, false);
        setTimeout(() => setSelectedProduct(undefined), 800);
        setIsProcessing(false);
    }, [setSelectedProduct]);

    const handleOrderCreation = useCallback(
        async (status: LifecycleStatus) => {
            if (!name.current || !phone.current || !deliveryAddress.current) return;
            if (status.statusName == 'error') handleCloseForm();
            if (status.statusName != 'init') setIsProcessing(true);
            if (status.statusName != 'success') return;

            const newOrder: Order = {
                orderId: orderId.current,
                status: 'processing',

                productId: product.id,
                productName: product.name,
                productImage: product.image,

                hashes: [status.statusData.transactionReceipts[0].transactionHash, 'empty'],
                robots: [-1, -1, -1],

                mailingInfo: {
                    name: name.current,
                    phone: phone.current,
                    address: deliveryAddress.current,
                },

                nullifierHash: '',
                receipt: '',

                timestamp: Math.floor(Date.now() / 1000),
            };

            const db = new Database();
            await db.updateOrder(address as string, newOrder);
            await db.reduceOnHold(product.id, true);

            addOrder(newOrder);
            setIsApproved(true);
        },
        [setIsProcessing, setIsApproved]
    );

    return (
        <div className='order-background'>
            {isApproved ? (
                <WorldIdVerification
                    orderId={orderId.current}
                    getOrder={getOrder}
                    updateOrderInList={updateOrderInList}
                />
            ) : (
                <section className='order-form'>
                    <div className='header'>
                        <h1>Order Form</h1>
                        <div className='countdown'>
                            <Image
                                src={'/images/svg/calender.svg'}
                                alt='calender'
                                width={25}
                                height={25}
                            />
                            <h6>
                                Congrats! This product is currently on-hold for you. Please proceed{' '}
                                <br />
                                with the order in 00:{countdown < 10
                                    ? `0${countdown}`
                                    : countdown}{' '}
                                before it is release.
                            </h6>
                        </div>
                    </div>

                    <ProductCard product={product} withButon={false} />
                    <div className='form'>
                        <Input id='name' name='Name' valueRef={name} />
                        <Input id='phone' name='Phone Number' valueRef={phone} />
                        <Input id='address' name='Address' valueRef={deliveryAddress} />
                        <Transaction
                            chainId={baseSepolia.id}
                            contracts={shopContracts(orderId.current, product.id)}
                            onStatus={handleOrderCreation}
                        >
                            <TransactionButton
                                disabled={
                                    !name.current || !phone.current || !deliveryAddress.current
                                }
                                className='tx-button'
                                text={`Place Order for FREE`}
                                pendingOverride={{ text: `Processing` }}
                            />
                            <TransactionSponsor />
                            <TransactionStatus>
                                <TransactionStatusLabel />
                                <TransactionStatusAction />
                            </TransactionStatus>

                            <TransactionToast>
                                <TransactionToastIcon />
                                <TransactionToastLabel />
                                <TransactionToastAction />
                            </TransactionToast>
                        </Transaction>
                    </div>
                    <Image
                        src={'/images/svg/cross.svg'}
                        alt='cross'
                        width={18}
                        height={18}
                        onClick={handleCloseForm}
                    />
                </section>
            )}
        </div>
    );
}

interface InputProps {
    name: string;
    id: string;
    valueRef: React.MutableRefObject<string>;
}

function Input({ name, id, valueRef }: InputProps) {
    const handleRandomizeValue = useCallback(() => {
        valueRef.current = generateRandomValue(id);
        const element = document.querySelector(`.order-form #${id}`) as HTMLInputElement;
        element.value = valueRef.current;
    }, [id]);

    return (
        <div>
            <label htmlFor={id}>{name}</label>
            {id == 'address' ? (
                <textarea id={id} onChange={(event) => (valueRef.current = event.target.value)} />
            ) : (
                <input id={id} onChange={(event) => (valueRef.current = event.target.value)} />
            )}
            <Image
                src={'/images/svg/randomize.svg'}
                alt='dice'
                width={27}
                height={27}
                onClick={handleRandomizeValue}
            />
        </div>
    );
}
