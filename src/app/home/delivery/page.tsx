'use client';

import Image from 'next/image';

import { useRouter } from 'next/navigation';
import useOrders from '@/hooks/useOrders';

import './delivery.css';

export default function Delivery() {
    const router = useRouter();
    const { orders } = useOrders();

    return (
        <section className='delivery'>
            <div id='description'>
                <Image src={'/images/svg/deliveryman.svg'} alt='man' width={32} height={32} />
                <h5>
                    This is a simulation between the 3PL (third party logistic) and the client
                    (you). Your order(s) will be here to perform this simulation. Click on the
                    pending order(s) to proceed.
                </h5>
            </div>
            <h2>
                Total Order(s) <span>{orders.length}</span>
            </h2>
            <section className='order-list'>
                {orders.map((order, index) => {
                    const displayingStatus = order.status == 'completed' ? 'pending' : order.status;

                    return (
                        <div
                            key={index}
                            className='order-card'
                            onClick={() => {
                                if (order.status == 'completed')
                                    router.push(
                                        `/order-deliver/pre-attestation?id=${order.orderId}`
                                    );
                                if (order.status == 'delivered')
                                    router.push(`/order-deliver/attestation?id=${order.orderId}`);
                            }}
                        >
                            <Image
                                src={'/images/svg/package.svg'}
                                alt='package'
                                width={34}
                                height={34}
                            />
                            <div className='status' id={displayingStatus}>
                                {displayingStatus.charAt(0).toUpperCase() +
                                    displayingStatus.slice(1)}
                            </div>
                            <h2>{order.orderId}</h2>
                        </div>
                    );
                })}
            </section>
        </section>
    );
}
