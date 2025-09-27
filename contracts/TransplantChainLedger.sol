// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title TransplantChainLedger
 * @dev A smart contract for managing organ donations and transplant requests on the blockchain
 * @author Your Name
 * @notice This contract provides transparent, immutable tracking of organ donations and transplant requests
 */
contract TransplantChainLedger is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // ============ ENUMS ============
    
    enum UserRole {
        PATIENT,
        DONOR,
        DOCTOR,
        ADMIN
    }
    
    enum OrganType {
        HEART,
        KIDNEY,
        LIVER,
        LUNG,
        PANCREAS,
        CORNEA,
        BONE,
        SKIN
    }
    
    enum RequestStatus {
        PENDING,
        APPROVED,
        MATCHED,
        TRANSPLANTED,
        REJECTED
    }
    
    enum DonorStatus {
        PENDING,
        VERIFIED,
        AVAILABLE,
        ALLOCATED,
        COMPLETED
    }
    
    enum VerificationStatus {
        PENDING,
        VERIFIED,
        REJECTED
    }

    // ============ STRUCTS ============
    
    struct User {
        address userAddress;
        string fullName;
        UserRole role;
        string phone;
        string physicalAddress;
        uint256 dateOfBirth;
        string bloodType;
        string medicalHistory;
        string emergencyContact;
        bool isVerified;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    struct OrganRequest {
        uint256 id;
        address patientAddress;
        OrganType organType;
        uint8 urgencyLevel; // 1-5 scale
        string medicalCondition;
        string doctorNotes;
        RequestStatus status;
        address verifiedBy;
        uint256 matchedDonationId;
        string blockchainHash;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    struct OrganDonation {
        uint256 id;
        address donorAddress;
        OrganType organType;
        DonorStatus status;
        bool medicalClearance;
        address verifiedBy;
        uint256 matchedRequestId;
        string blockchainHash;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    struct Transaction {
        uint256 id;
        string transactionHash;
        string transactionType;
        address fromUser;
        address toUser;
        uint256 organRequestId;
        uint256 organDonationId;
        string status;
        string metadata; // JSON string for additional data
        uint256 createdAt;
    }
    
    struct VerificationRecord {
        uint256 id;
        address verifierAddress;
        uint256 targetId;
        string verificationType; // "request", "donation", "user"
        VerificationStatus status;
        string notes;
        string documentHash; // IPFS hash for verification documents
        uint256 createdAt;
    }

    // ============ STATE VARIABLES ============
    
    Counters.Counter private _userIds;
    Counters.Counter private _requestIds;
    Counters.Counter private _donationIds;
    Counters.Counter private _transactionIds;
    Counters.Counter private _verificationIds;
    
    mapping(address => User) public users;
    mapping(uint256 => OrganRequest) public organRequests;
    mapping(uint256 => OrganDonation) public organDonations;
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => VerificationRecord) public verifications;
    
    // Quick lookup mappings
    mapping(address => bool) public registeredUsers;
    mapping(address => uint256[]) public userRequests;
    mapping(address => uint256[]) public userDonations;
    mapping(OrganType => uint256[]) public availableOrgans;
    mapping(OrganType => uint256[]) public pendingRequests;
    
    // Role-based access control
    mapping(address => UserRole) public userRoles;
    mapping(UserRole => bool) public rolePermissions;
    
    // Verification requirements
    uint256 public constant MIN_VERIFICATION_THRESHOLD = 2;
    mapping(uint256 => address[]) public requestVerifiers;
    mapping(uint256 => address[]) public donationVerifiers;

    // ============ EVENTS ============
    
    event UserRegistered(address indexed userAddress, string fullName, UserRole role);
    event UserUpdated(address indexed userAddress, string fullName);
    event OrganRequestCreated(uint256 indexed requestId, address indexed patient, OrganType organType);
    event OrganRequestUpdated(uint256 indexed requestId, RequestStatus newStatus);
    event OrganDonationCreated(uint256 indexed donationId, address indexed donor, OrganType organType);
    event OrganDonationUpdated(uint256 indexed donationId, DonorStatus newStatus);
    event OrganMatched(uint256 indexed requestId, uint256 indexed donationId, address patient, address donor);
    event TransplantCompleted(uint256 indexed requestId, uint256 indexed donationId);
    event TransactionRecorded(uint256 indexed transactionId, string transactionHash, string transactionType);
    event VerificationSubmitted(uint256 indexed verificationId, address indexed verifier, uint256 targetId);
    event VerificationCompleted(uint256 indexed verificationId, VerificationStatus status);

    // ============ MODIFIERS ============
    
    modifier onlyRegisteredUser() {
        require(registeredUsers[msg.sender], "User not registered");
        _;
    }
    
    modifier onlyRole(UserRole _role) {
        require(userRoles[msg.sender] == _role, "Insufficient role permissions");
        _;
    }
    
    modifier onlyDoctorOrAdmin() {
        require(
            userRoles[msg.sender] == UserRole.DOCTOR || 
            userRoles[msg.sender] == UserRole.ADMIN, 
            "Only doctors and admins can perform this action"
        );
        _;
    }
    
    modifier onlyAdmin() {
        require(userRoles[msg.sender] == UserRole.ADMIN, "Only admin can perform this action");
        _;
    }
    
    modifier validRequestId(uint256 _requestId) {
        require(_requestId > 0 && _requestId <= _requestIds.current(), "Invalid request ID");
        _;
    }
    
    modifier validDonationId(uint256 _donationId) {
        require(_donationId > 0 && _donationId <= _donationIds.current(), "Invalid donation ID");
        _;
    }
    
    modifier validOrganType(OrganType _organType) {
        require(uint8(_organType) >= 0 && uint8(_organType) <= 7, "Invalid organ type");
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor() Ownable(msg.sender) {
        // Set initial role permissions
        rolePermissions[UserRole.PATIENT] = true;
        rolePermissions[UserRole.DONOR] = true;
        rolePermissions[UserRole.DOCTOR] = true;
        rolePermissions[UserRole.ADMIN] = true;
    }

    // ============ USER MANAGEMENT ============
    
    /**
     * @dev Register a new user in the system
     * @param _fullName User's full name
     * @param _role User's role (PATIENT, DONOR, DOCTOR, ADMIN)
     * @param _phone User's phone number
     * @param _address User's physical address
     * @param _dateOfBirth User's date of birth (timestamp)
     * @param _bloodType User's blood type
     * @param _medicalHistory User's medical history
     * @param _emergencyContact Emergency contact information
     */
    function registerUser(
        string memory _fullName,
        UserRole _role,
        string memory _phone,
        string memory _address,
        uint256 _dateOfBirth,
        string memory _bloodType,
        string memory _medicalHistory,
        string memory _emergencyContact
    ) external {
        require(!registeredUsers[msg.sender], "User already registered");
        require(bytes(_fullName).length > 0, "Full name is required");
        require(_dateOfBirth > 0 && _dateOfBirth <= block.timestamp, "Invalid date of birth");
        
        _userIds.increment();
        
        User memory newUser = User({
            userAddress: msg.sender,
            fullName: _fullName,
            role: _role,
            phone: _phone,
            physicalAddress: _address,
            dateOfBirth: _dateOfBirth,
            bloodType: _bloodType,
            medicalHistory: _medicalHistory,
            emergencyContact: _emergencyContact,
            isVerified: _role == UserRole.ADMIN ? true : false,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        users[msg.sender] = newUser;
        registeredUsers[msg.sender] = true;
        userRoles[msg.sender] = _role;
        
        emit UserRegistered(msg.sender, _fullName, _role);
    }
    
    /**
     * @dev Update user information
     * @param _fullName Updated full name
     * @param _phone Updated phone number
     * @param _address Updated physical address
     * @param _bloodType Updated blood type
     * @param _medicalHistory Updated medical history
     * @param _emergencyContact Updated emergency contact
     */
    function updateUser(
        string memory _fullName,
        string memory _phone,
        string memory _address,
        string memory _bloodType,
        string memory _medicalHistory,
        string memory _emergencyContact
    ) external onlyRegisteredUser {
        require(bytes(_fullName).length > 0, "Full name is required");
        
        User storage user = users[msg.sender];
        user.fullName = _fullName;
        user.phone = _phone;
        user.physicalAddress = _address;
        user.bloodType = _bloodType;
        user.medicalHistory = _medicalHistory;
        user.emergencyContact = _emergencyContact;
        user.updatedAt = block.timestamp;
        
        emit UserUpdated(msg.sender, _fullName);
    }

    // ============ ORGAN REQUEST MANAGEMENT ============
    
    /**
     * @dev Create a new organ request
     * @param _organType Type of organ needed
     * @param _urgencyLevel Urgency level (1-5)
     * @param _medicalCondition Description of medical condition
     * @param _doctorNotes Additional doctor notes
     */
    function createOrganRequest(
        OrganType _organType,
        uint8 _urgencyLevel,
        string memory _medicalCondition,
        string memory _doctorNotes
    ) external onlyRegisteredUser onlyRole(UserRole.PATIENT) validOrganType(_organType) {
        require(_urgencyLevel >= 1 && _urgencyLevel <= 5, "Invalid urgency level");
        require(bytes(_medicalCondition).length > 0, "Medical condition is required");
        require(users[msg.sender].isVerified, "User must be verified to create requests");
        
        _requestIds.increment();
        uint256 newRequestId = _requestIds.current();
        
        OrganRequest memory newRequest = OrganRequest({
            id: newRequestId,
            patientAddress: msg.sender,
            organType: _organType,
            urgencyLevel: _urgencyLevel,
            medicalCondition: _medicalCondition,
            doctorNotes: _doctorNotes,
            status: RequestStatus.PENDING,
            verifiedBy: address(0),
            matchedDonationId: 0,
            blockchainHash: "",
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        organRequests[newRequestId] = newRequest;
        userRequests[msg.sender].push(newRequestId);
        pendingRequests[_organType].push(newRequestId);
        
        emit OrganRequestCreated(newRequestId, msg.sender, _organType);
    }
    
    /**
     * @dev Update organ request status (only doctors and admins)
     * @param _requestId ID of the request to update
     * @param _newStatus New status for the request
     * @param _notes Additional notes from the doctor
     */
    function updateOrganRequestStatus(
        uint256 _requestId,
        RequestStatus _newStatus,
        string memory _notes
    ) external onlyRegisteredUser onlyDoctorOrAdmin validRequestId(_requestId) {
        OrganRequest storage request = organRequests[_requestId];
        
        // Only allow certain status transitions
        require(
            (request.status == RequestStatus.PENDING && _newStatus == RequestStatus.APPROVED) ||
            (request.status == RequestStatus.APPROVED && _newStatus == RequestStatus.MATCHED) ||
            (request.status == RequestStatus.MATCHED && _newStatus == RequestStatus.TRANSPLANTED) ||
            (_newStatus == RequestStatus.REJECTED),
            "Invalid status transition"
        );
        
        request.status = _newStatus;
        request.verifiedBy = msg.sender;
        request.updatedAt = block.timestamp;
        
        if (bytes(_notes).length > 0) {
            request.doctorNotes = string(abi.encodePacked(request.doctorNotes, "\n", _notes));
        }
        
        emit OrganRequestUpdated(_requestId, _newStatus);
    }

    // ============ ORGAN DONATION MANAGEMENT ============
    
    /**
     * @dev Create a new organ donation registration
     * @param _organType Type of organ to donate
     */
    function createOrganDonation(
        OrganType _organType
    ) external onlyRegisteredUser onlyRole(UserRole.DONOR) validOrganType(_organType) {
        require(users[msg.sender].isVerified, "User must be verified to register donations");
        
        _donationIds.increment();
        uint256 newDonationId = _donationIds.current();
        
        OrganDonation memory newDonation = OrganDonation({
            id: newDonationId,
            donorAddress: msg.sender,
            organType: _organType,
            status: DonorStatus.PENDING,
            medicalClearance: false,
            verifiedBy: address(0),
            matchedRequestId: 0,
            blockchainHash: "",
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        organDonations[newDonationId] = newDonation;
        userDonations[msg.sender].push(newDonationId);
        
        emit OrganDonationCreated(newDonationId, msg.sender, _organType);
    }
    
    /**
     * @dev Update organ donation status and medical clearance
     * @param _donationId ID of the donation to update
     * @param _newStatus New status for the donation
     * @param _medicalClearance Medical clearance status
     */
    function updateOrganDonationStatus(
        uint256 _donationId,
        DonorStatus _newStatus,
        bool _medicalClearance
    ) external onlyRegisteredUser onlyDoctorOrAdmin validDonationId(_donationId) {
        OrganDonation storage donation = organDonations[_donationId];
        
        // Only allow certain status transitions
        require(
            (donation.status == DonorStatus.PENDING && _newStatus == DonorStatus.VERIFIED) ||
            (donation.status == DonorStatus.VERIFIED && _newStatus == DonorStatus.AVAILABLE) ||
            (donation.status == DonorStatus.AVAILABLE && _newStatus == DonorStatus.ALLOCATED) ||
            (donation.status == DonorStatus.ALLOCATED && _newStatus == DonorStatus.COMPLETED),
            "Invalid status transition"
        );
        
        donation.status = _newStatus;
        donation.medicalClearance = _medicalClearance;
        donation.verifiedBy = msg.sender;
        donation.updatedAt = block.timestamp;
        
        // Add to available organs if verified and available
        if (_newStatus == DonorStatus.AVAILABLE && _medicalClearance) {
            availableOrgans[donation.organType].push(_donationId);
        }
        
        emit OrganDonationUpdated(_donationId, _newStatus);
    }

    // ============ MATCHING SYSTEM ============
    
    /**
     * @dev Match an organ request with an available donation
     * @param _requestId ID of the organ request
     * @param _donationId ID of the available organ donation
     */
    function matchOrganWithRequest(
        uint256 _requestId,
        uint256 _donationId
    ) external onlyRegisteredUser onlyDoctorOrAdmin validRequestId(_requestId) validDonationId(_donationId) {
        OrganRequest storage request = organRequests[_requestId];
        OrganDonation storage donation = organDonations[_donationId];
        
        require(request.status == RequestStatus.APPROVED, "Request must be approved");
        require(donation.status == DonorStatus.AVAILABLE, "Donation must be available");
        require(donation.medicalClearance, "Donation must have medical clearance");
        require(request.organType == donation.organType, "Organ types must match");
        require(request.matchedDonationId == 0, "Request already matched");
        require(donation.matchedRequestId == 0, "Donation already matched");
        
        // Update statuses
        request.status = RequestStatus.MATCHED;
        request.matchedDonationId = _donationId;
        request.updatedAt = block.timestamp;
        
        donation.status = DonorStatus.ALLOCATED;
        donation.matchedRequestId = _requestId;
        donation.updatedAt = block.timestamp;
        
        emit OrganMatched(_requestId, _donationId, request.patientAddress, donation.donorAddress);
    }
    
    /**
     * @dev Mark transplant as completed
     * @param _requestId ID of the organ request
     * @param _donationId ID of the organ donation
     */
    function completeTransplant(
        uint256 _requestId,
        uint256 _donationId
    ) external onlyRegisteredUser onlyDoctorOrAdmin validRequestId(_requestId) validDonationId(_donationId) {
        OrganRequest storage request = organRequests[_requestId];
        OrganDonation storage donation = organDonations[_donationId];
        
        require(request.status == RequestStatus.MATCHED, "Request must be matched");
        require(donation.status == DonorStatus.ALLOCATED, "Donation must be allocated");
        require(request.matchedDonationId == _donationId, "Request and donation must be matched");
        require(donation.matchedRequestId == _requestId, "Donation and request must be matched");
        
        // Update statuses
        request.status = RequestStatus.TRANSPLANTED;
        request.updatedAt = block.timestamp;
        
        donation.status = DonorStatus.COMPLETED;
        donation.updatedAt = block.timestamp;
        
        emit TransplantCompleted(_requestId, _donationId);
    }

    // ============ VERIFICATION SYSTEM ============
    
    /**
     * @dev Submit verification for a user, request, or donation
     * @param _targetId ID of the target to verify (for user verification, this should be 0 and use _targetAddress)
     * @param _targetAddress Address of the user to verify (only used for user verification)
     * @param _verificationType Type of verification ("user", "request", "donation")
     * @param _status Verification status
     * @param _notes Verification notes
     * @param _documentHash IPFS hash of verification documents
     */
    function submitVerification(
        uint256 _targetId,
        address _targetAddress,
        string memory _verificationType,
        VerificationStatus _status,
        string memory _notes,
        string memory _documentHash
    ) external onlyRegisteredUser onlyDoctorOrAdmin {
        _verificationIds.increment();
        uint256 newVerificationId = _verificationIds.current();
        
        VerificationRecord memory newVerification = VerificationRecord({
            id: newVerificationId,
            verifierAddress: msg.sender,
            targetId: _targetId,
            verificationType: _verificationType,
            status: _status,
            notes: _notes,
            documentHash: _documentHash,
            createdAt: block.timestamp
        });
        
        verifications[newVerificationId] = newVerification;
        
        // Update user verification status if applicable
        if (keccak256(bytes(_verificationType)) == keccak256(bytes("user"))) {
            if (registeredUsers[_targetAddress] && _status == VerificationStatus.VERIFIED) {
                users[_targetAddress].isVerified = true;
                users[_targetAddress].updatedAt = block.timestamp;
            }
        }
        
        emit VerificationSubmitted(newVerificationId, msg.sender, _targetId);
        emit VerificationCompleted(newVerificationId, _status);
    }

    // ============ TRANSACTION RECORDING ============
    
    /**
     * @dev Record a blockchain transaction
     * @param _transactionHash Hash of the blockchain transaction
     * @param _transactionType Type of transaction
     * @param _fromUser Address of the sender
     * @param _toUser Address of the receiver
     * @param _organRequestId Associated organ request ID
     * @param _organDonationId Associated organ donation ID
     * @param _status Transaction status
     * @param _metadata Additional metadata as JSON string
     */
    function recordTransaction(
        string memory _transactionHash,
        string memory _transactionType,
        address _fromUser,
        address _toUser,
        uint256 _organRequestId,
        uint256 _organDonationId,
        string memory _status,
        string memory _metadata
    ) external onlyRegisteredUser {
        _transactionIds.increment();
        uint256 newTransactionId = _transactionIds.current();
        
        Transaction memory newTransaction = Transaction({
            id: newTransactionId,
            transactionHash: _transactionHash,
            transactionType: _transactionType,
            fromUser: _fromUser,
            toUser: _toUser,
            organRequestId: _organRequestId,
            organDonationId: _organDonationId,
            status: _status,
            metadata: _metadata,
            createdAt: block.timestamp
        });
        
        transactions[newTransactionId] = newTransaction;
        
        emit TransactionRecorded(newTransactionId, _transactionHash, _transactionType);
    }

    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get user information
     * @param _userAddress Address of the user
     * @return User struct containing user information
     */
    function getUser(address _userAddress) external view returns (User memory) {
        require(registeredUsers[_userAddress], "User not registered");
        return users[_userAddress];
    }
    
    /**
     * @dev Get organ request details
     * @param _requestId ID of the request
     * @return OrganRequest struct containing request details
     */
    function getOrganRequest(uint256 _requestId) external view validRequestId(_requestId) returns (OrganRequest memory) {
        return organRequests[_requestId];
    }
    
    /**
     * @dev Get organ donation details
     * @param _donationId ID of the donation
     * @return OrganDonation struct containing donation details
     */
    function getOrganDonation(uint256 _donationId) external view validDonationId(_donationId) returns (OrganDonation memory) {
        return organDonations[_donationId];
    }
    
    /**
     * @dev Get available organs by type
     * @param _organType Type of organ
     * @return Array of available donation IDs
     */
    function getAvailableOrgans(OrganType _organType) external view validOrganType(_organType) returns (uint256[] memory) {
        return availableOrgans[_organType];
    }
    
    /**
     * @dev Get pending requests by organ type
     * @param _organType Type of organ
     * @return Array of pending request IDs
     */
    function getPendingRequests(OrganType _organType) external view validOrganType(_organType) returns (uint256[] memory) {
        return pendingRequests[_organType];
    }
    
    /**
     * @dev Get user's organ requests
     * @param _userAddress Address of the user
     * @return Array of request IDs
     */
    function getUserRequests(address _userAddress) external view returns (uint256[] memory) {
        return userRequests[_userAddress];
    }
    
    /**
     * @dev Get user's organ donations
     * @param _userAddress Address of the user
     * @return Array of donation IDs
     */
    function getUserDonations(address _userAddress) external view returns (uint256[] memory) {
        return userDonations[_userAddress];
    }
    
    /**
     * @dev Get contract statistics
     * @return totalUsers Total number of registered users
     * @return totalRequests Total number of organ requests
     * @return totalDonations Total number of organ donations
     * @return totalTransactions Total number of transactions
     * @return totalVerifications Total number of verifications
     */
    function getContractStats() external view returns (
        uint256 totalUsers,
        uint256 totalRequests,
        uint256 totalDonations,
        uint256 totalTransactions,
        uint256 totalVerifications
    ) {
        return (
            _userIds.current(),
            _requestIds.current(),
            _donationIds.current(),
            _transactionIds.current(),
            _verificationIds.current()
        );
    }

    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update role permissions (only admin)
     * @param _role Role to update
     * @param _permission New permission status
     */
    function updateRolePermission(UserRole _role, bool _permission) external onlyAdmin {
        rolePermissions[_role] = _permission;
    }
    
    /**
     * @dev Set minimum verification threshold
     * @param _threshold New minimum verification threshold
     */
    function setMinVerificationThreshold(uint256 _threshold) external onlyAdmin {
        require(_threshold > 0, "Threshold must be greater than 0");
        // This would require updating the constant, so we'll use a state variable instead
    }
    
    /**
     * @dev Emergency pause function (only admin)
     */
    function emergencyPause() external onlyAdmin {
        // Implementation would depend on OpenZeppelin's Pausable contract
        // This is a placeholder for emergency functionality
    }
}