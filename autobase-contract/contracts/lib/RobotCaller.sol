// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

contract RobotCaller is FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

	address _owner;

    uint32 gasLimit = 300000;
    bytes32 donID = 0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000;
    uint64 subscriptionId = 199;

	mapping(bytes32 => bytes) public responses;

    error UnexpectedRequestID(bytes32 requestId);

    event Response(bytes32 indexed requestId, bytes response, bytes err);

    constructor() FunctionsClient(0xf9B8fc078197181C841c296C876945aaa425B278) {
		_owner = msg.sender;
	}

    function sendRequest(
        string memory source,
        string[] memory args,
        bytes[] memory bytesArgs
    ) external returns (bytes32 requestId) {
		require(msg.sender == _owner, "Not an owner");

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        if (args.length > 0) req.setArgs(args);
        if (bytesArgs.length > 0) req.setBytesArgs(bytesArgs);
        requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donID
        );
        return requestId;
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        responses[requestId] = response;
        emit Response(requestId, response, err);
    }
}
