'use client';

import Image from 'next/image';
import { DynamicWidget, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AttestationLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const isLoggedIn = useIsLoggedIn();

    useEffect(() => {
        if (!isLoggedIn) router.push('/');
    }, [isLoggedIn]);

    return (
        <>
            <nav>
                <Image
                    className='logo'
                    src={'/images/svg/logo.svg'}
                    alt='logo'
                    width={66}
                    height={54}
                    onClick={() => router.push('/home/track')}
                />
                <DynamicWidget />
            </nav>
            {children}
        </>
    );
}
