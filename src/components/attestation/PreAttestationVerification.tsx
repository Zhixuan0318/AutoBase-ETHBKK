'use client';

import Image from 'next/image';

interface Props {
    hash: string;
    setSide: React.Dispatch<React.SetStateAction<'logistics' | 'recipient' | undefined>>;
    side: 'logistics' | 'recipient';
    order: Order | undefined;
}

export default function PreAttestationVerification({ side, order, hash, setSide }: Props) {
    const isRecipient = side == 'recipient';

    return (
        <div className={side}>
            <h3>{isRecipient ? 'Package Recipient' : 'Third Party Logistic (3PL)'}</h3>
            <Image
                src={`/images/svg/attestation/${isRecipient ? 'recipient' : 'delivery-man'}.svg`}
                alt='side'
                height={106}
                width={106}
            />
            {hash ? (
                <div id='verified'>
                    <Image
                        src={'/images/svg/marked-invert.svg'}
                        alt='success'
                        width={24}
                        height={24}
                    />
                    <h3>World ID Verified</h3>
                    <h4 onClick={() => navigator.clipboard.writeText(hash)}>
                        {hash.slice(0, 5) + '...' + hash.slice(62)}
                    </h4>
                </div>
            ) : (
                <button
                    className={`black-button${order ? '' : '-disabled'}`}
                    onClick={() => setSide(side)}
                >
                    <Image
                        src={'/images/svg/partners/worldcoin.svg'}
                        alt='world-id'
                        width={24}
                        height={24}
                    />
                    Verify with World ID
                </button>
            )}
        </div>
    );
}
