import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { get, Database, getDatabase, ref, update } from 'firebase/database';

import config from '@/config/firebase.json';

export default class Firebase {
    private database: Database;
    private isAuthed = false;

    constructor() {
        const app = initializeApp(config);
        this.database = getDatabase(app);
    }

    async authDatabase() {
        const auth = getAuth(initializeApp(config));
        await signInWithEmailAndPassword(
            auth,
            process.env.FIREBASE_MAIL as string,
            process.env.FIREBASE_PASSWORD as string
        );
        this.database = getDatabase(auth.app);
    }

    async getAllOrders(address: string): Promise<Order[]> {
        // if (!this.isAuthed) await this.authDatabase();
        const snapshot = await get(ref(this.database, `/base/orders/${address.toLowerCase()}`));
        if (!snapshot.exists()) return [];

        const orders: any[] = Object.values(snapshot.val());
        const corrected = orders.map((order) => {
            return {
                ...order,
                hashes: order.hashes ? Object.values(order.hashes) : [],
                robots: order.hashes ? Object.values(order.robots) : [],
            };
        });

        return corrected;
    }

    async getOrder(address: string, orderId: string): Promise<Order> {
        // if (!this.isAuthed) await this.authDatabase();
        const snapshot = await get(
            ref(this.database, `/base/orders/${address.toLowerCase()}/${orderId}`)
        );
        return snapshot.val();
    }

    async updateOrder(address: string, data: Order) {
        // if (!this.isAuthed) await this.authDatabase();
        const updates: any = {};
        updates[`/base/orders/${address.toLowerCase()}/${data.orderId}`] = data;
        await update(ref(this.database), updates);
    }

    async completeOrder(address: string, orderId: string, uncompletedOrder: Order) {
        // if (!this.isAuthed) await this.authDatabase();
        const updates: any = {};
        uncompletedOrder.status = 'completed';
        updates[`/base/orders/${address.toLowerCase()}/${orderId}`] = uncompletedOrder;
        await update(ref(this.database), updates);
    }

    // Off chain stocks

    async getOffChainStock(productId: number): Promise<OffChainStock> {
        const snapshot = await get(ref(this.database, `/base/stocks/${productId}`));
        return snapshot.val();
    }

    async getAllOffChainStocks(): Promise<OffChainStock[]> {
        const snapshot = await get(ref(this.database, `/base/stocks`));
        const stocks: OffChainStock[] = Object.values(snapshot.val());
        return stocks;
    }

    async replenish(productId: number, amount: number) {
        // if (!this.isAuthed) await this.authDatabase();
        const snapshot = await get(ref(this.database, `/base/stocks/${productId}/stock`));
        const updates: any = {};
        updates[`/base/stocks/${productId}/stock`] = snapshot.val() + amount;
        await update(ref(this.database), updates);
    }

    async addOnHold(productId: number) {
        // if (!this.isAuthed) await this.authDatabase();
        const updates: any = {};

        const data = await this.getOffChainStock(productId);
        data.onHold++;
        data.stock--;

        updates[`/base/stocks/${productId}`] = data;
        await update(ref(this.database), updates);
    }

    async reduceOnHold(productId: number, isSuccess: boolean) {
        // if (!this.isAuthed) await this.authDatabase();
        const updates: any = {};

        const data = await this.getOffChainStock(productId);
        data.onHold--;
        if (!isSuccess) data.stock++;

        updates[`/base/stocks/${productId}`] = data;
        await update(ref(this.database), updates);
    }
}
