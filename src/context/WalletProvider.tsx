'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { type ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { OnchainKitProvider } from '@coinbase/onchainkit';

import config from '@/config/wagmi';
import { baseSepolia } from 'wagmi/chains';

const queryClient = new QueryClient();

function WalletProvider({ children }: { children: ReactNode }) {
    return (
        <DynamicContextProvider
            settings={{
                environmentId: '9bfae8a7-5dc7-454f-8c04-f012233149d5',
                walletConnectors: [EthereumWalletConnectors],
            }}
        >
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <OnchainKitProvider
                        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
                        //@ts-ignore
                        chain={baseSepolia}
                    >
                        {children}
                    </OnchainKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </DynamicContextProvider>
    );
}

export default WalletProvider;
