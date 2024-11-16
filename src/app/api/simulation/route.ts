import { NextRequest, NextResponse } from 'next/server';

import { sendSimulationRequest } from '@/utils/sendChainLinkFunction';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        if (!body.orderId) throw new Error('No order was provided');
        if (!body.stage) throw new Error('No stage was provided');
        if (body.stage == 1 && !body.productNameId) throw new Error('No color was provided');
        if (!body.url) throw new Error('No url was provided');

        const color =
            body.productNameId == 0 ? 'green' : body.productNameId == '1' ? 'purple' : 'blue';

        await sendSimulationRequest(`${body.url}/api/scenario${body.stage}`, body.orderId, color);
        return NextResponse.json({}, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: `Error - ${error}` }, { status: 500 });
    }
}
