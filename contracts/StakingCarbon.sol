// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract StakingCarbon is AccessControl, ReentrancyGuard {
    struct StakingOptions {
        string name;
        uint256 lockDurations;
        uint256 requiredToken;
        bool isActive;
    }

    struct UserState {
        uint256 package;
        uint256 latestUpdate;
    }

    bytes32 public constant ADMIN = keccak256("ADMIN");

    mapping(uint256 => StakingOptions) public stakingOptionsStorage;
    uint256 private stakingOptionsLength;

    mapping(address => UserState) public userStateStorage;

    address public mainToken;

    event AddPoolSuccessful(uint256 poolId, StakingOptions payload);
    event StakeSuccessful(
        address user,
        uint256 stakePackage,
        uint256 stakeStart
    );
    event UnstakeSuccessful(address user);
    event RestakeSuccessful(address user, uint256 timeRestake);

    event ChangeActiveStatus(uint256 stakingOptionId, bool trigger);
    event ChangeAdminRole(address oldAdmin, address newAdmin);
    event EmergencyWithdraw(address token, address adminAddress, uint256 amount);

    constructor(
        address owner,
        address _mainToken
    ) AccessControl() ReentrancyGuard() {
        _setupRole(DEFAULT_ADMIN_ROLE, owner);
        _grantRole(ADMIN, owner);
        require(mainToken != address(0), "tokenv1 can not be zero address");
        mainToken = _mainToken;
    }

    function changeAdminRole(address account) public onlyRole(ADMIN) {
        _grantRole(ADMIN, account);
        _revokeRole(ADMIN, msg.sender);

        emit ChangeAdminRole(msg.sender, account);

    }

    function changeStageOfStakingOption(
        uint256 _stakingOption,
        bool _trigger
    ) public onlyRole(ADMIN) {
        require(
            _stakingOption < stakingOptionsLength,
            "Can not larger than options"
        );
        require(
            _trigger != stakingOptionsStorage[_stakingOption].isActive,
            "already trigger"
        );
        stakingOptionsStorage[_stakingOption].isActive = _trigger;
        emit ChangeActiveStatus(_stakingOption, _trigger);
    }

    function addStakingPayload(
        StakingOptions memory payload
    ) public onlyRole(ADMIN) {
        stakingOptionsStorage[stakingOptionsLength] = StakingOptions({
            name: payload.name,
            lockDurations: payload.lockDurations,
            requiredToken: payload.requiredToken,
            isActive: payload.isActive
        });

        emit AddPoolSuccessful(stakingOptionsLength, payload);

        stakingOptionsLength++;
    }

    function stake(uint256 package) public nonReentrant {
        require(stakingOptionsStorage[package].isActive, "Wrong package");

        require(
            userStateStorage[msg.sender].latestUpdate == 0,
            "User already stake in pool"
        );

        IERC20(mainToken).transferFrom(
            msg.sender,
            address(this),
            stakingOptionsStorage[package].requiredToken
        );

        userStateStorage[msg.sender] = UserState({
            package: package,
            latestUpdate: block.timestamp
        });

        emit StakeSuccessful(msg.sender, package, block.timestamp);
    }

    function restake() public nonReentrant {
        UserState memory userInfo = userStateStorage[msg.sender];
        require(
            stakingOptionsStorage[userInfo.package].isActive,
            "Wrong package"
        );

        require(userInfo.latestUpdate != 0, "User have to stake in pool");

        require(
            userInfo.latestUpdate +
                stakingOptionsStorage[userInfo.package].lockDurations <
                block.timestamp,
            "User have to pass lock duration"
        );

        userStateStorage[msg.sender].latestUpdate = block.timestamp;

        emit RestakeSuccessful(msg.sender, block.timestamp);
    }

    function unstake() public nonReentrant {
        UserState memory userInfo = userStateStorage[msg.sender];

        require(
            userInfo.latestUpdate != 0 &&
                userInfo.latestUpdate +
                    stakingOptionsStorage[userInfo.package].lockDurations <
                block.timestamp,
            "user did not stake yet or still in lock duration"
        );

        IERC20(mainToken).transfer(
            msg.sender,
            stakingOptionsStorage[userInfo.package].requiredToken
        );

        userStateStorage[msg.sender] = UserState({package: 0, latestUpdate: 0});

        emit UnstakeSuccessful(msg.sender);
    }

    function emergencyWithdraw(
        address token
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 amount =  IERC20(token).balanceOf(address(this));

        IERC20(token).transfer(
            msg.sender,
            IERC20(token).balanceOf(address(this))
        );
        emit EmergencyWithdraw(token, msg.sender, amount);

    }
}
