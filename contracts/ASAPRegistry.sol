// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ASAP Registry
 * @notice The "Yellow Pages" for Agent Services on Base.
 * @dev Handles registration, staking, and trust signals.
 */
contract ASAPRegistry is ReentrancyGuard, Ownable {
    
    // --- Structs ---

    struct Service {
        uint256 id;
        address provider;       // Wallet address of the agent builder
        uint256 farcasterId;    // Farcaster FID (for social reputation linking)
        string endpointUrl;     // The x402 compatible URL
        string metadata;        // JSON string (name, description, tags)
        uint256 stakeAmount;    // Amount of tokens locked
        uint256 reputation;     // Onchain reputation score
        bool isActive;          // Is the service currently serving?
        uint256 createdAt;
    }

    // --- State Variables ---

    IERC20 public stakingToken; // The token required to register (e.g., ASAPToken)
    uint256 public minStake;    // Minimum tokens required to register (e.g., 100 ASAP)
    uint256 public nextServiceId;

    // Mapping from Service ID -> Service Data
    mapping(uint256 => Service) public services;
    
    // Mapping from Provider Address -> List of Service IDs owned
    mapping(address => uint256[]) public providerServices;

    // --- Events (Crucial for the Indexer) ---

    event ServiceRegistered(uint256 indexed serviceId, address indexed provider, uint256 farcasterId, string endpoint);
    event ServiceUpdated(uint256 indexed serviceId, string newEndpoint, bool isActive);
    event AttestationReceived(uint256 indexed serviceId, address indexed attester, uint8 rating, string reviewCid);
    event StakeSlashed(uint256 indexed serviceId, uint256 amount, string reason);

    // --- Constructor ---

    constructor(address _stakingToken, uint256 _minStake) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        minStake = _minStake;
        nextServiceId = 1;
    }

    // --- Core Functions ---

    /**
     * @notice Register a new Agent Service
     * @param _farcasterId Your Farcaster ID (FID)
     * @param _endpointUrl The https URL where your agent accepts x402 requests
     * @param _metadata JSON string describing the service
     * @param _stakeAmount Amount to stake (must be >= minStake)
     */
    function registerService(
        uint256 _farcasterId,
        string calldata _endpointUrl,
        string calldata _metadata,
        uint256 _stakeAmount
    ) external nonReentrant {
        require(_stakeAmount >= minStake, "Insufficient stake");
        require(bytes(_endpointUrl).length > 0, "Invalid URL");

        // Transfer stake from provider to this contract
        // User must approve() this contract first!
        require(stakingToken.transferFrom(msg.sender, address(this), _stakeAmount), "Stake transfer failed");

        uint256 newId = nextServiceId++;

        services[newId] = Service({
            id: newId,
            provider: msg.sender,
            farcasterId: _farcasterId,
            endpointUrl: _endpointUrl,
            metadata: _metadata,
            stakeAmount: _stakeAmount,
            reputation: 0, // Starts at 0, builds via social attestations
            isActive: true,
            createdAt: block.timestamp
        });

        providerServices[msg.sender].push(newId);

        emit ServiceRegistered(newId, msg.sender, _farcasterId, _endpointUrl);
    }

    /**
     * @notice Submit an onchain attestation (review)
     * @dev Actual reputation calculation happens offchain via Indexer, 
     *      but this logs the permanent record on Base.
     */
    function attest(uint256 _serviceId, uint8 _rating, string calldata _reviewCid) external {
        require(services[_serviceId].isActive, "Service not active");
        require(_rating >= 1 && _rating <= 5, "Rating must be 1-5");

        // In a real version, we might charge a small fee to prevent spam
        // For MVP, we trust the social graph (Indexer filters spam)
        
        emit AttestationReceived(_serviceId, msg.sender, _rating, _reviewCid);
    }

    /**
     * @notice Update service details
     */
    function updateService(uint256 _serviceId, string calldata _newEndpoint, bool _isActive) external {
        require(services[_serviceId].provider == msg.sender, "Not the owner");
        
        services[_serviceId].endpointUrl = _newEndpoint;
        services[_serviceId].isActive = _isActive;

        emit ServiceUpdated(_serviceId, _newEndpoint, _isActive);
    }

    /**
     * @notice Unstake and deregister
     * @dev Returns tokens to the provider
     */
    function deregister(uint256 _serviceId) external nonReentrant {
        Service storage s = services[_serviceId];
        require(s.provider == msg.sender, "Not the owner");
        require(s.isActive == true, "Already inactive");

        s.isActive = false;
        uint256 amount = s.stakeAmount;
        s.stakeAmount = 0;

        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");
    }

    // --- View Functions ---

    function getService(uint256 _id) external view returns (Service memory) {
        return services[_id];
    }

    function getServicesByProvider(address _provider) external view returns (uint256[] memory) {
        return providerServices[_provider];
    }
}