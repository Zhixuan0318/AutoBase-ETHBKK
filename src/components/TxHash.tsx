'use client';

import Image from 'next/image';

import './tx-hash.css';

export default function TxHash({ hash }: { hash?: string }) {
    return (
        <div className='tx-hash'>
            <h6>Txn Hash: {hash ? hash?.slice(0, 6) + '...' + hash?.slice(60) : 'Pending'}</h6>
            {hash && (
                <Image
                    src={'/images/svg/copy.svg'}
                    alt='copy'
                    width={20}
                    height={20}
                    onClick={() => navigator.clipboard.writeText(hash + '')}
                />
            )}
        </div>
    );
}
