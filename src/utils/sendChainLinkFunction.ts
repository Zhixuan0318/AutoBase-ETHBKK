import { Interface, TransactionRequest } from 'ethers';
import { sendAsOwner } from './owner';

import ABI from '@/contracts/WarehouseABI.json';
import addresses from '@/data/addresses';

const source = `const request = Functions.makeHttpRequest({
    url: args[0],
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    data: {
        orderId: args[1],
        boxColour: args[2],
    },
});
const response = await request;
if(response.error) throw new Error("Error");
return Functions.encodeString("Success");
`;

export async function sendSimulationRequest(
    link: string,
    orderId: string,
    boxColour?: 'blue' | 'green' | 'purple'
) {
    const args = [link, orderId, boxColour ? boxColour : 'blue'];

    const warehouse = new Interface(ABI);
    const encodedRequest = warehouse.encodeFunctionData('sendRequest', [source, args, []]);
    const requestTx: TransactionRequest = {
        to: addresses.warehouse,
        data: encodedRequest,
    };
    const requestResponse = await sendAsOwner(requestTx);
    console.log(requestResponse);
    if (!requestResponse) throw new Error('Tx error');
}
