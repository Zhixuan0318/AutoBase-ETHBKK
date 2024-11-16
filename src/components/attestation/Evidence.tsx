'use client';

import Image from 'next/image';
import CodePopUp from '../CodePopUp';

import { useRef, useState } from 'react';
import { useAccount } from 'wagmi';

import { signAttestation, getSchema } from '@/utils/attestation';
import Link from 'next/link';

interface Props {
    order: Order | undefined;
    side: 'logistics' | 'receiver';
    updateOrderInList: (orderId: string, updated: Order) => void;
}

export default function Evidence({ order, side, updateOrderInList }: Props) {
    const [uploading, setUploading] = useState(false);
    const { address } = useAccount();

    const isReceiver = useRef(side == 'receiver');

    const [schema, setSchema] = useState<string>();

    return (
        <div className={side}>
            <h2>{isReceiver.current ? 'Package Recipient' : 'Third Party Logistic (3PL)'}</h2>
            <div className='schema'>
                <h5>Schema ID:</h5>
                <h5
                    onClick={async () => {
                        const data = await getSchema(isReceiver.current ? '0x3e2' : '0x3e3');
                        setSchema(JSON.stringify(data, null, 4));
                    }}
                >
                    {isReceiver.current ? 'onchain_evm_84532_0x3e2' : 'onchain_evm_84532_0x3e3'}
                </h5>
                {schema && <CodePopUp code={schema} setCode={setSchema} />}
                <Image src={'/images/svg/copy.svg'} alt='copy' height={18} width={18} />
            </div>
            <div className='upload-image'>
                <label htmlFor={side} className='file-upload'>
                    <h4>Upload Photographic Evidence</h4>
                    <input
                        id={side}
                        name={side}
                        type='file'
                        accept='image/*'
                        onChange={async (event) => {
                            const copy = { ...order };
                            if (
                                !event.target.files ||
                                !copy ||
                                copy.attestation?.[side]?.cid != undefined
                            ) {
                                event.target.files = null;
                                return;
                            }

                            if (isReceiver.current && !copy.attestation?.logistics?.id) {
                                event.target.files = null;
                                return;
                            }

                            setUploading(true);

                            const file = event.target.files[0];
                            event.target.files = null;

                            const formData = new FormData();
                            formData.append('blob', file);
                            const response = await fetch('/api/storacha/evidence', {
                                method: 'POST',
                                body: formData,
                            });

                            const json = await response.json();
                            copy.attestation = {
                                ...copy.attestation,
                                [side]: {
                                    id: '',
                                    cid: json.cid,
                                },
                            };
                            updateOrderInList(copy.orderId as string, copy as Order);
                            setUploading(false);
                        }}
                    />
                    <Image
                        src={'/images/svg/upload-image.svg'}
                        alt='upload-image'
                        height={49}
                        width={49}
                    />
                </label>
                {uploading && (
                    <h4>
                        <div id='spinner'></div>Uploading to Storacha
                    </h4>
                )}
                {order?.attestation?.[side] ? (
                    <div className='cid'>
                        <h4>CID:</h4>{' '}
                        <Link
                            href={`https://${order?.attestation?.[side].cid}.ipfs.w3s.link`}
                            target='_blank'
                        >
                            {order?.attestation?.[side].cid.slice(0, 5) +
                                '...' +
                                order?.attestation?.[side].cid.slice(55)}
                        </Link>
                        <Image
                            src={'/images/svg/copy.svg'}
                            alt='copy'
                            height={18}
                            width={18}
                            onClick={() =>
                                navigator.clipboard.writeText(order.attestation?.[side]?.cid ?? '')
                            }
                        />
                    </div>
                ) : (
                    <></>
                )}
            </div>
            {order?.attestation?.[side]?.id ? (
                <div className='success'>
                    <Image src={'/images/svg/marked.svg'} alt='sign' height={41} width={41} />
                    <Image
                        src={'/images/svg/partners/sign.svg'}
                        alt='sign'
                        height={41}
                        width={59}
                    />
                    <h4>Successfully!</h4>
                </div>
            ) : (
                <button
                    id={`black-button${!order?.attestation?.[side]?.cid ? '-disabled' : ''}`}
                    onClick={async () => {
                        if (!order) return;
                        const copy = { ...order };
                        if (!copy.attestation || !address) return;

                        if (isReceiver.current) {
                            if (!copy.attestation.receiver?.cid) return;
                            const result = await signAttestation(
                                isReceiver.current,
                                copy.receipt,
                                (copy.attestation as any)[side].cid,
                                address,
                                copy.nullifierHash,
                                address
                            );

                            copy.attestation.receiver.id = result.attestationId;
                            copy.attestation.receiver.hash = result.txHash ?? '';
                        } else {
                            if (!copy.attestation.logistics?.cid) return;
                            const result = await signAttestation(
                                isReceiver.current,
                                copy.receipt,
                                (copy.attestation as any)[side].cid,
                                address,
                                copy.nullifierHash,
                                address
                            );

                            copy.attestation.logistics.id = result.attestationId;
                            copy.attestation.logistics.hash = result.txHash ?? '';
                        }

                        updateOrderInList(copy.orderId, copy);
                    }}
                >
                    Make an attestation with{' '}
                    <Image
                        src={'/images/svg/partners/sign.svg'}
                        alt='sign'
                        height={41}
                        width={59}
                    />
                </button>
            )}

            <div className='info'>
                <Image src={'/images/svg/info.svg'} alt='info' height={32} width={32} />
                {isReceiver.current
                    ? 'You can only make an attestation after our third party logistic completed the attestation'
                    : 'Upload photo evidence as proof of delivery before proceeding'}
            </div>
        </div>
    );
}
