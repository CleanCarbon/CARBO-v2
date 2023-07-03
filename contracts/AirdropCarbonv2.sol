// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./v1/interfaces/ICarboToken.sol";

contract AirdropCarbonv2 is AccessControl, Pausable {
    address public carboV1Addr;

    address public carboV2Addr;

    bytes32 public constant ADMIN = keccak256("ADMIN");

    event AirdropSnapshotv1(address user, uint256 amount);
    event SetCarboV1(address token);
    event SetCarboV2(address token);

    event ChangeAdminRole(address oldAdmin, address newAdmin);
    event EmergencyWithdraw(
        address token,
        address adminAddress,
        uint256 amount
    );

    constructor(
        address owner,
        address _tokenV1,
        address _tokenV2
    ) AccessControl() {
        _setupRole(DEFAULT_ADMIN_ROLE, owner);
        _grantRole(ADMIN, owner);

        require(_tokenV1 != address(0), "tokenv1 can not be zero address");
        require(_tokenV2 != address(0), "tokenv2 can not be zero address");

        carboV1Addr = _tokenV1;
        emit SetCarboV1(_tokenV1);
        carboV2Addr = _tokenV2;
        emit SetCarboV2(_tokenV2);
    }

    function pause() public whenNotPaused onlyRole(ADMIN) {
        _pause();
    }

    function unpause() public whenPaused onlyRole(ADMIN) {
        _unpause();
    }

    function changeAdminRole(
        address account
    ) public onlyRole(ADMIN) whenNotPaused {
        _grantRole(ADMIN, account);
        _revokeRole(ADMIN, msg.sender);

        emit ChangeAdminRole(msg.sender, account);
    }

    function airdrop(uint256 amount) public whenNotPaused {
        require(
            IERC20(carboV2Addr).balanceOf(address(this)) >= amount,
            "Contract does not have enough token for this airdrop, contact admin"
        );

        ICarboToken(carboV1Addr).burnFrom(msg.sender, amount);

        IERC20(carboV2Addr).transfer(msg.sender, amount);

        emit AirdropSnapshotv1(msg.sender, amount);
    }

    function emergencyWithdraw(
        address token
    ) public onlyRole(DEFAULT_ADMIN_ROLE) whenPaused {
        uint256 amount = IERC20(token).balanceOf(address(this));

        IERC20(token).transfer(
            msg.sender,
            IERC20(token).balanceOf(address(this))
        );
        emit EmergencyWithdraw(token, msg.sender, amount);
    }
}
