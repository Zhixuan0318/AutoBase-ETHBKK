import { Wallet, Interface, TransactionRequest, keccak256, toUtf8Bytes, randomBytes } from 'ethers';

import { sendAsOwner } from '@/utils/owner';

import addreses from '@/data/addresses';

import WarehouseABI from '@/contracts/WarehouseABI.json';
import PickingRobotABI from '@/contracts/PickingRobotABI.json';
import PackingRobotABI from '@/contracts/PackingRobotABI.json';
import DeliveryRobotABI from '@/contracts/DeliveryRobotABI.json';
import { SigningKey } from 'ethers';

export default class Contracts {
    static async processOrder(orderId: string): Promise<string> {
        const encoded = new Interface(WarehouseABI).encodeFunctionData('processOrder', [orderId]);

        const tx: TransactionRequest = {
            to: addreses.warehouse,
            data: encoded,
        };

        const response = await sendAsOwner(tx);
        if (!response) throw new Error('Tx error');
        return response.hash;
    }

    static async generateRandomRobotId(orderId: string, robotId: 0 | 1 | 2) {
        const warehouse = new Interface(WarehouseABI);
        const encodedRequest = warehouse.encodeFunctionData('requestRandomNumber', [
            randomBytes(32),
            orderId,
            robotId,
        ]);
        const requestTx: TransactionRequest = {
            to: addreses.warehouse,
            data: encodedRequest,
            value: 16000000000000,
        };
        const requestResponse = await sendAsOwner(requestTx);
        if (!requestResponse) throw new Error('Tx error');

        const requestId = warehouse.decodeEventLog(
            'RequestRobotId',
            requestResponse.logs[1].data
        )[1];
        console.log(requestId);
    }

    static async pickOrder(orderId: string): Promise<string> {
        const wallet = Wallet.createRandom();
        const key = new SigningKey(wallet.privateKey);
        const signature = key.sign(keccak256(toUtf8Bytes(orderId)));

        const encoded = new Interface(PickingRobotABI).encodeFunctionData('pickOrder', [
            orderId,
            wallet.address,
            signature.v,
            signature.r,
            signature.s,
        ]);

        const tx: TransactionRequest = {
            to: addreses.picker,
            data: encoded,
        };

        const response = await sendAsOwner(tx);
        if (!response) throw new Error('Tx error');
        return response.hash;
    }

    static async packOrder(orderId: string): Promise<string> {
        const wallet = Wallet.createRandom();
        const key = new SigningKey(wallet.privateKey);
        const signature = key.sign(keccak256(toUtf8Bytes(orderId)));

        const encoded = new Interface(PackingRobotABI).encodeFunctionData('packOrder', [
            orderId,
            wallet.address,
            signature.v,
            signature.r,
            signature.s,
        ]);

        const tx: TransactionRequest = {
            to: addreses.packer,
            data: encoded,
        };

        const response = await sendAsOwner(tx);
        if (!response) throw new Error('Tx error');
        return response.hash;
    }

    static async deliverOrder(orderId: string): Promise<string> {
        const wallet = Wallet.createRandom();
        const key = new SigningKey(wallet.privateKey);
        const signature = key.sign(keccak256(toUtf8Bytes(orderId)));

        const encoded = new Interface(DeliveryRobotABI).encodeFunctionData('deliverOrder', [
            orderId,
            wallet.address,
            signature.v,
            signature.r,
            signature.s,
        ]);

        const tx: TransactionRequest = {
            to: addreses.deliverer,
            data: encoded,
        };

        const response = await sendAsOwner(tx);
        if (!response) throw new Error('Tx error');
        return response.hash;
    }
}
