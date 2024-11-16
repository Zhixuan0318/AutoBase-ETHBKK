import { ISuccessResult } from '@worldcoin/idkit';

export async function verifyAction(result: ISuccessResult, action: string) {
    const response = await fetch('/api/worldcoin-verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proof: result, action }),
    });

    if (response.status == 500) throw new Error('Server error');
    if (response.status == 400) throw new Error('Verification error');
}
