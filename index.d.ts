export {};

declare global {
    type AttestationStatus = 'waiting' | 'uploading' | 'uploaded'; // done when id is ready

    type OffChainStock = {
        onHold: number;
        stock: number;
    };

    type CallPermitMessage = {
        from: string;
        to: string;
        value: BigInt;
        data: string;
        gaslimit: BigInt;
        nonce: BigInt;
        deadline: number;
    };

    interface Product {
        id: number;
        name: string;
        image: string;
        uri: string;
        price: number;
        stock: number;
    }

    interface Order {
        orderId: string;
        status: 'processing' | 'completed' | 'delivered' | 'cancelled';

        productName: string;
        productId: number;
        productImage: string;

        nullifierHash: string;

        attestation?: {
            logistics?: {
                cid: string;
                id: string;
                hash: string;
            };
            receiver?: {
                cid: string;
                id: string;
                hash: string;
            };
        };

        receipt: string;

        mailingInfo: {
            name: string;
            phone: string;
            address: string;
        };

        hashes: string[];
        robots: number[];

        timestamp: number;
    }

    type SimulatorStatus = 'processing' | 'picking' | 'packing' | 'delivery' | 'completed';

    type ConnectionMethod = undefined | 'petra' | 'google';

    type BoxColor = 'purple' | 'green' | 'blue';
}
