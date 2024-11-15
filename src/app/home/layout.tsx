'use client';

import Image from 'next/image';
import { DynamicWidget, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

import './home-layout.css';

export default function HomeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const pathname = usePathname();

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
                />
                <DynamicWidget />
            </nav>
            <main className='home-layout'>
                <div className='selector'>
                    {[['Store'], ['Track', 'package'], ['Inventory'], ['Delivery']].map(
                        (section, index) => (
                            <button
                                key={index}
                                id={
                                    pathname.includes(section[0].toLowerCase())
                                        ? 'black-button'
                                        : 'white-button'
                                }
                                onClick={() => router.push(`/home/${section[0].toLowerCase()}`)}
                            >
                                <Image
                                    src={`/images/svg/${(section.length == 2
                                        ? section[1]
                                        : section[0]
                                    ).toLowerCase()}.svg`}
                                    alt='store'
                                    width={21}
                                    height={21}
                                />
                                {section[0]}
                            </button>
                        )
                    )}
                </div>
                {children}
            </main>
        </>
    );
}
