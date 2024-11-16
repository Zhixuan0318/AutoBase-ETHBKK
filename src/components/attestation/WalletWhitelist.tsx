import Image from 'next/image';
import Link from 'next/link';

export default function WalletWhitelist({
    address,
    party,
}: {
    address: string | undefined;
    party: 'logistic' | 'receiver';
}) {
    return (
        <div className='log'>
            <div className='status'>
                <Image src={'/images/svg/marked.svg'} alt='completed' width={18} height={18} />
                {party == 'logistic' ? 'Third Party Logistic (3PL)' : 'Package Recipient'}
            </div>
            <div className='data'>
                <h6>
                    Wallet: {address ? address.slice(0, 6) + '...' + address.slice(38) : 'Pending'}
                </h6>
                {address && (
                    <Image
                        src={'/images/svg/copy.svg'}
                        alt='copy'
                        width={20}
                        height={20}
                        onClick={() => navigator.clipboard.writeText(address + '')}
                    />
                )}
            </div>
            <Link href={`${process.env.NEXT_PUBLIC_EXPLORER}/address/${address}`} target='_blank'>
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
