// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import { IEntropyConsumer } from "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";
import { IEntropy } from "@pythnetwork/entropy-sdk-solidity/IEntropy.sol";

import {RobotCaller} from "./lib/RobotCaller.sol";

import "./interfaces/Enums.sol";

import "./interfaces/IShop.sol";
import "./interfaces/IProducts.sol";

error NotARobot();
error NotAnOwner();
error ELowValue();

contract Warehouse is IEntropyConsumer, RobotCaller {
    enum Activity {
        Picking,
        Packing,
        Delivering
    }

    IShop Shop;
    IProducts Products;

    address owner;

    mapping(address => bool) _robotApproval;
    mapping(uint64 => Activity) _requestToActivity;
    mapping(uint64 => string) _requestToOrder;

    event WarehouseActivity(string orderId, Enums.OrderStatus status);
    event AssingRobot(string orderId, Activity activity, uint256 robotId);
    event RequestRobotId(string orderId, uint256 requestId);
    event ActivityVerifier(
        string orderId,
        Activity activity,
        address indexed verifier
    );

    IEntropy public Entropy;

    constructor(
        address shop,
        address products
    ) RobotCaller() {
		owner = msg.sender;
		
        Shop = IShop(shop);
        Products = IProducts(products);
        Entropy = IEntropy(0x41c9e39574F40Ad34c79f1C99B66A45eFB830d4c);
    }

    function setRobot(address robot) external onlyOwner {
        _robotApproval[robot] = true;
    }

    function processOrder(string memory orderId) external onlyOwner {
        Shop.updateOrderStatus(orderId, Enums.OrderStatus.Processing);

        emit WarehouseActivity(orderId, Enums.OrderStatus.Processing);
    }

    function pickOrder(
        string memory orderId,
        address verifier
    ) external onlyRobot {
        Shop.updateOrderStatus(orderId, Enums.OrderStatus.Picked);

        emit WarehouseActivity(orderId, Enums.OrderStatus.Picked);
        emit ActivityVerifier(orderId, Activity.Picking, verifier);
    }

    function packOrder(
        string memory orderId,
        address verifier
    ) external onlyRobot {
        Shop.updateOrderStatus(orderId, Enums.OrderStatus.Packed);

        emit WarehouseActivity(orderId, Enums.OrderStatus.Packed);
        emit ActivityVerifier(orderId, Activity.Packing, verifier);
    }

    function deliverOrder(
        string memory orderId,
        address verifier
    ) external onlyRobot {
        Shop.updateOrderStatus(orderId, Enums.OrderStatus.Delivered);

        Products.mintProduct(
            Shop.getOrderProductId(orderId),
            Shop.getOrderCustomer(orderId)
        );

        emit WarehouseActivity(orderId, Enums.OrderStatus.Delivered);
        emit ActivityVerifier(orderId, Activity.Delivering, verifier);
    }

    function requestRandomNumber(
        bytes32 userRandomNumber,
        string memory orderId,
        Activity activityType
    ) external payable returns (uint64) {
		if(msg.value < 0.000016 ether) revert ELowValue();

        address provider = Entropy.getDefaultProvider();
        uint256 fee = Entropy.getFee(provider);

        uint64 sequenceNumber = Entropy.requestWithCallback{value: fee}(
            provider,
            userRandomNumber
        );

        _requestToActivity[sequenceNumber] = activityType;
        _requestToOrder[sequenceNumber] = orderId;

        emit RequestRobotId(orderId, sequenceNumber);

        return sequenceNumber;
    }

    function entropyCallback(
        uint64 sequenceNumber,
        address provider,
        bytes32 randomNumber
    ) internal override {
        uint8 robotId = 1;
        unchecked {
            robotId = uint8(uint256(randomNumber) % 20) + 1;
        }
        emit AssingRobot(
            _requestToOrder[sequenceNumber],
            _requestToActivity[sequenceNumber],
            robotId
        );
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotAnOwner();
        _;
    }

    modifier onlyRobot() {
        if (!_robotApproval[msg.sender]) revert NotARobot();
        _;
    }

    function getEntropy() internal view virtual override returns (address) {
		return address(Entropy);
	}
}