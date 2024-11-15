'use client';

import Image from 'next/image';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { DynamicConnectButton, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';

import './connection.css';

export default function Connection() {
    const router = useRouter();
    const isLoggedIn = useIsLoggedIn();

    const { isConnected } = useAccount();

    useEffect(() => {
        if (isLoggedIn) router.push('/home/store');
    }, [isLoggedIn]);

    return (
        <main className='connection'>
            <Image src={'/images/svg/logo.svg'} alt='logo' width={73} height={60} />
            <h1>An Ecommerce Store on Base Sepolia Run By Robots.</h1>
            <div id='base'>
                <Image src={'/images/svg/partners/base.svg'} alt='trait' width={26} height={26} />
                <h2>Deployed on Base Sepolia</h2>
            </div>
            <div className='traits'>
                <h3>Powered By</h3>
                <div>
                    <Image
                        src={'/images/svg/partners/worldcoin.svg'}
                        alt='trait'
                        width={26}
                        height={26}
                    />
                    <h3>Worldcoin</h3>
                </div>
                <div>
                    <Image
                        src={'/images/svg/partners/sign.svg'}
                        alt='trait'
                        width={26}
                        height={26}
                    />
                    <h3>Sign Protocol</h3>
                </div>
                <div>
                    <Image
                        src={'/images/svg/partners/chainlink.svg'}
                        alt='trait'
                        width={26}
                        height={26}
                    />
                    <h3>Chainlink</h3>
                </div>
                <div>
                    <Image
                        src={'/images/svg/partners/dynamic.svg'}
                        alt='trait'
                        width={26}
                        height={26}
                    />
                    <h3>Dynamic</h3>
                </div>
                <div>
                    <Image
                        src={'/images/svg/partners/blockscout.svg'}
                        alt='trait'
                        width={26}
                        height={26}
                    />
                    <h3>Blockscout</h3>
                </div>
                <div>
                    <Image
                        src={'/images/svg/partners/storacha.svg'}
                        alt='trait'
                        width={26}
                        height={26}
                    />
                    <h3>Storacha</h3>
                </div>
                <div>
                    <Image
                        src={'/images/svg/partners/pyth.svg'}
                        alt='trait'
                        width={26}
                        height={26}
                    />
                    <h3>Pyth Network</h3>
                </div>
            </div>
            <DynamicConnectButton buttonClassName='dynamic-connection'>
                <Image
                    src={'/images/svg/partners/dynamic.svg'}
                    alt='dynamic'
                    width={26}
                    height={26}
                />
                <h3>Connect with Dynamic</h3>
            </DynamicConnectButton>
            <Image src={'/images/svg/main-screen.svg'} alt='picture' width={500} height={500} />
        </main>
    );
}
