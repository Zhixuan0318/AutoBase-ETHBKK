'use client';

import Image from 'next/image';
import Link from 'next/link';
import Simulator from './Simulator';
import Approval from './Approval';
import Warning from './Warning';
import TxHash from '@/components/TxHash';

import { useSearchParams } from 'next/navigation';
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useOrders from '@/hooks/useOrders';
import useProcessOrder from '@/hooks/useProcessOrder';

import logs from '@/data/logs';

import './order-info.css';

function OrderInfo() {
    const router = useRouter();
    const { orders, getOrder } = useOrders();

    const searchParams = useSearchParams();
    const orderId = searchParams.get('id') as string;
    const simulationMethod = searchParams.get('method') as string;
    const ngrokUrl = searchParams.get('url');

    const { order, setOrder, simulationStatus } = useProcessOrder(ngrokUrl);

    const [design, setDesign] = useState(false);

    const simulation = useCallback(async () => {
        await fetch('/api/order', { method: 'POST', body: JSON.stringify({ orderId, stage: 1 }) });
        if (simulationMethod == 'online') {
            await new Promise((resolve) => setTimeout(resolve, 42_000));
            await fetch('/api/order', {
                method: 'POST',
                body: JSON.stringify({ orderId, stage: 2 }),
            });
            await new Promise((resolve) => setTimeout(resolve, 30_000));
            await fetch('/api/order', {
                method: 'POST',
                body: JSON.stringify({ orderId, stage: 3 }),
            });
            await new Promise((resolve) => setTimeout(resolve, 48_000));
            await fetch('/api/order', {
                method: 'POST',
                body: JSON.stringify({ orderId, stage: 4 }),
            });
        } else {
            await fetch('/api/simulation', {
                method: 'POST',
                body: JSON.stringify({
                    orderId,
                    stage: 1,
                    url: ngrokUrl,
                    productNameId: order?.productId,
                }),
            });
        }
    }, [simulationMethod, order?.productId]);

    useEffect(() => {
        if (!orders.length || order) return;

        const loaded = getOrder(orderId);
        loaded ? setOrder(loaded) : router.push('/home/store');
    }, [orders]);

    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
        if (!order || order.status == 'completed' || order.status == 'delivered' || isLoaded)
            return;
        setIsLoaded(true);
        simulation();
    }, [order]);

    return (
        <>
            <Warning order={order} />
            <main className='order-info'>
                <div className='order-id'>
                    <h1>#{orderId}</h1>
                    <h5 id={order ? order.status : 'processing'}>
                        {order
                            ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                            : 'Loading'}
                    </h5>
                </div>
                <section className='order-details'>
                    <div className='product'>
                        <h4>Order</h4>
                        <Image
                            src={order ? order.productImage : '/'}
                            alt='product-image'
                            height={32}
                            width={32}
                        />
                        <h5>{order ? order.productName : 'Product'}</h5>
                    </div>
                    <div className='mailing-info'>
                        <h4>Mailing Info</h4>
                        <h5>{order ? order.mailingInfo.name : 'Loading'}</h5>
                        <h5>{order ? order.mailingInfo.phone : 'Loading'}</h5>
                        <h5>{order ? order.mailingInfo.address : 'Loading'}</h5>
                        <div>
                            <Image
                                src={'/images/svg/marked.svg'}
                                alt='marked'
                                height={14}
                                width={14}
                            />
                            <Image
                                src={'/images/svg/partners/worldcoin.svg'}
                                alt='worldcoin'
                                height={14}
                                width={14}
                            />
                        </div>
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
                </section>
                <section className='load-assignment'>
                    <div id='header'>
                        <h4>Load Assignment</h4>
                        <div id='order-prop'>
                            <Image src={'/images/svg/power.svg'} alt='power' height={9} width={9} />
                            <h6>Pyth Entropy</h6>
                        </div>
                    </div>

                    {order?.robots.map((robot, index) => {
                        const hash =
                            order.hashes.length > 2 + index * 2
                                ? order.hashes[2 + index * 2]
                                : 'empty';
                        return (
                            <div key={index} className='assignment-card'>
                                <Image
                                    src={'/images/svg/crane.svg'}
                                    alt='crane'
                                    height={67}
                                    width={58}
                                />

                                <div className='data'>
                                    <h5>
                                        {index == 0
                                            ? 'Product Picking'
                                            : index == 1
                                            ? 'Order Packing'
                                            : 'Parcel Delivery'}
                                    </h5>
                                    <div>ROBOT ID</div>
                                    {robot != -1 ? <h4>{robot}</h4> : <div id='spinner'></div>}
                                </div>
                                <TxHash hash={hash == 'empty' ? undefined : hash} />

                                <Link
                                    href={`${process.env.NEXT_PUBLIC_EXPLORER}/tx/${hash}`}
                                    target='_blank'
                                >
                                    <Image
                                        src={'/images/svg/view-explorer.svg'}
                                        alt='explorer'
                                        width={20}
                                        height={20}
                                    />
                                </Link>
                            </div>
                        );
                    })}
                </section>
                <Simulator
                    order={order}
                    simulationStatus={simulationStatus}
                    productName={order ? order.productName : ''}
                    simulationMethod={simulationMethod}
                    setDesign={setDesign}
                />
                {design && (
                    <section className='simulation-design'>
                        <h3>About the Webot simulation setup</h3>
                        <h5>
                            The robots simulated in the Webot scenes are programmed to perform
                            warehouse operations based on the activity on the Base Sepolia
                            blockchain, and will also report back to the Base Sepolia blockchain
                            once jobs are completed. Our team had built a simulated warehouse scene
                            to demonstrate how robots deal with product picking, parcel packing, and
                            parcel delivery:
                        </h5>
                        <div>
                            <Image
                                src={'/images/simulation-design.png'}
                                alt='design'
                                width={630}
                                height={413}
                            />
                            <Image src={'/images/arrow.png'} alt='arrow' width={16} height={16} />
                            <h6>Warehouse Simulation Design</h6>
                        </div>
                    </section>
                )}
                <section className='detail-log'>
                    <div id='header'>
                        <h4>Detail Log</h4>
                        <div id='order-prop'>
                            <Image
                                src={'/images/svg/important.svg'}
                                alt='important'
                                height={9}
                                width={9}
                            />
                            <h6>Click to view on Base Scan</h6>
                        </div>
                    </div>
                    <div className='logs'>
                        {order?.hashes
                            .map((hash, index) => (
                                <div key={index} className='log'>
                                    <div className='status'>
                                        {index < order.hashes.length - 1 ||
                                        order.status == 'completed' ||
                                        order.status == 'delivered' ? (
                                            <Image
                                                src={'/images/svg/marked.svg'}
                                                alt='completed'
                                                width={18}
                                                height={18}
                                            />
                                        ) : (
                                            <div id='spinner'></div>
                                        )}
                                        {logs[index]}
                                    </div>
                                    <TxHash hash={hash == 'empty' ? undefined : hash} />
                                    <Link
                                        href={`${process.env.NEXT_PUBLIC_EXPLORER}/tx/${hash}`}
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
                            ))
                            .reverse()}
                    </div>
                </section>
                <Approval order={order} />
            </main>
        </>
    );
}

export default function Page() {
    return (
        <Suspense>
            <OrderInfo />
        </Suspense>
    );
}
