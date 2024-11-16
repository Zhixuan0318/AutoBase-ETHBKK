import { NextRequest, NextResponse } from 'next/server';

import Contracts from '@/class/HyperAgileContracts';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        if (!body.orderId) throw new Error('No order was provided');
        if (!body.stage) throw new Error('No stage was provided');

        if (body.stage == 1) {
            console.log('stage 1');
            await Contracts.processOrder(body.orderId);
            await Contracts.generateRandomRobotId(body.orderId, 0);
            // timer(body, 42_000);
        }

        if (body.stage == 2) {
            console.log('stage 2');
            await Contracts.pickOrder(body.orderId);
            await Contracts.generateRandomRobotId(body.orderId, 1);
            // timer(body, 30_000);
        }

        if (body.stage == 3) {
            console.log('stage 3');
            await Contracts.packOrder(body.orderId);
            await Contracts.generateRandomRobotId(body.orderId, 2);
            // timer(body, 48_000);
        }

        if (body.stage == 4) await Contracts.deliverOrder(body.orderId);

        console.log('end stage');
        return NextResponse.json({}, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: `Error - ${error}` }, { status: 500 });
    }
}
