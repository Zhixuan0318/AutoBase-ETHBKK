import { cookieStorage, createConfig, createStorage, http } from '@wagmi/core';
import { baseSepolia } from 'viem/chains';
import { coinbaseWallet, metaMask } from 'wagmi/connectors';

export default createConfig({
    chains: [baseSepolia],
    connectors: [coinbaseWallet({ appName: 'AutoBase', preference: 'all' }), metaMask()],
    storage: createStorage({
        storage: cookieStorage,
    }),
    ssr: true,
    transports: {
        [baseSepolia.id]: http(process.env.PROVIDER),
    },
});
