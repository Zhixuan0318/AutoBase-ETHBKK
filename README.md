Connecting Industrial Robotic Process Automation (AKA robots) to the blockchain layer. An implementation prototype to showcase the feasibility of real-life robotic-automated industries operating in a Web3 architecture.

### Project Description

Industries implement robotics for automation from manufacturing to order fulfilment, reducing cost and boost productivity. However, industries always have a complex supply chain and those data systems are isolated, causing visibility gap between stakeholders, hard to track and trace, and also raising security concerns. So, it’s time to have a solution focusing on robotics and transparency. Blockchain-connected data system is a perfect and innovative solution for this! However, connecting both Web2 (robotic) and Web3 layer heavily relies on a central hub, acting as a bridging role between the communication of two layer.

Hence, to showcase the concept of the middleware hub and feasibility for real-life industries to implement it, we build an implementation prototype which is a robotic-powered ecommerce-warehouse experiment setup on Base Sepolia, which our custom design and built hub being the most important middleware to facilitate the process on the client side, on-chain processing (smart contracts) and the control of robotic fleets. 

High-level overview of the process:

> A client able to order a product from our DApp and our storefront will process the order, and passing it to the warehouse to assign a robot from a robotic fleet and carry out a series of operations (simulations) to fulfil the order, which including pick, pack and deliver. After each robot completed the task, it will log an event on-chain, leaving a clear and transparent robotic operation trial. Then, a delivery man (simulation) will deliver the parcel from the warehouse to the client doorstep.
> 

The coolest part of this hack:

- Each of the industry components are smart contracts on Base Sepolia and collaborating together to form a complete Web3 order fulfilment process. Coordinate by the central hub.
- Managing the task assignment (load balancing) among the robotic fleet with Pyth Entropy.
- Controlling robots with on-chain events via Chainlink and record their operations on-chain.
- Introducing the Recipient Verification mechanism with World ID to ensure the recipient is the “real recipient”.
- Introducing the Attestation-Driven Delivery Assurance (ADDA) mechanism powered by Sign Protocol to ensure smooth physical delivery and the delivery man do deliver the order.
- All on-chain industrial robotic operations of an order will be compile into Lifecycle Report and stored in a tamper-proof manner with Storacha.

### How it is made

**Industrial Components as Smart Contracts @ Base**

- Store DApp built with Onchain-Kit: Using transaction components, NFT card, token image.
- Storefront smart contract: pick up client side order and process it. Middle man between the warehouse and the client. Getting order status update.
- Warehouse smart contract: Assigning robots for each operations. Getting completion updates from each robot.
- Robotics smart contract: Powering pick, pack and deliver robot
- ERC-1155 inventory collection: We tokenize each inventory product of the warehouse and manage it as in the form of NFTs.

**Robotic Load Balancing @ Pyth Entropy:**

Our warehouse smart contract will pick a robot among a fleet for each operation and this is known as load balancing. We use Pyth Entropy to perform this fully on-chain with on-chain randomness.

**Controlling Robot Simulations @ Chainlink Function:**

Each of the robotic simulation are built on Webots (a popular industry grade robotic simulator) and we built an connectivity layer (a Flask server) to expose each simulation as APIs. We make a Chainlink Function subscription for calling simulations respective to each operations. For example, when a picking robot finished its task and log the event on-chain, we will capture this and the warehouse contract will trigger the Chainlink Functions to run the next operation simulation (packing, for this example).

**Recipient Verification Mechanism @ World ID:**

This is a innovative mechanism for real world delivery which utilise World ID verification to ensure that the order is delivered to the actual recipient. The client need to undergo this verification process (powered with IDKit) before the order is confirmed and passed to the warehouse for processing. We created an Cloud Incognito Action for this delivery activity and the client required to connect their World ID to this action. This process will generate a proof which we will be used to verify with the on-cloud proof verifier. Post verification will obtained the nullifier hash of the client and bind with the order. During parcel signing stage (pre-attestation), the recipient need to connect to this Incognito Action again, and only the “actual recipient” able to generate the same nullifier hash as the order had. Note: For the whole process, we only use the nullifier hash after post verification of a recipient World ID, as we all know nullifier hash is just a public unique identifier for this combination of user, app, and action.

**Attestation-Driven Delivery Assurance (ADDA) @ Sign Protocol:**

Utilising attestation to prevent bad actors in logistics and clients (recipient) is a smart move. This mechanism involved two stages: pre-attestation check and the attestation phase. The pre-attestation phase required the delivery man and the recipient to both connect to a Worldcoin Incognito Action with World ID, to ensure the delivery man do deliver and the recipient is the “actual recipient” before making an attestation. Both of them having different schema, including the lifecycle report CID, photographic evidence CID, wallet address and nullifier hash of the opposite party. We also have setup a schema hook to perform a whitelist check, restricting the attestation eligible for both parties only. Sign Protocol REST API is used to query data of schema and attestation made and display in the dashboard.

**Tamper-proof Lifecycle Report & Photographic Evidence @ Storacha:**

Each of the operations carried out by the warehouse and robots will be logged as an event on-chain, creating a trail. This trail will be combine with general info of the order and compile into a Lifecycle Report, representing a comprehensive view of a cycle in the supply chain. This report will be stored on a space we created on Storacha. Plus, during the attestation of the delivery phase, both parties (delivery man and recipient) need to upload their photographic evidence to our Storacha space. The CID of the Lifecycle Report and photographic evidence will be used as schema data in the attestation.

**Additional:**

We also use **@ Dynamic** to seamlessly onboard industrial clients (in our case, customers) and also utilise **@ BlockScout** explorer and JSON RPC for this build.
