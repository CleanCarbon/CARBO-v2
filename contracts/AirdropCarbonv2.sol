// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import "./v1/interfaces/ICarboToken.sol";

contract AirdropCarbonv2 is AccessControl {
    address public carboV1Addr;

    address public carboV2Addr;

    bytes32 public constant ADMIN = keccak256("ADMIN");

    event AirdropSnapshotv1(address user, uint256 amount);

    constructor(
        address owner,
        address _tokenV1,
        address _tokenV2
    ) AccessControl() {
        _setupRole(DEFAULT_ADMIN_ROLE, owner);
        _grantRole(ADMIN, owner);

        carboV1Addr = _tokenV1;
        carboV2Addr = _tokenV2;
    }

    function changeAdminRole(address account) public onlyRole(ADMIN) {
        _grantRole(ADMIN, account);
        _revokeRole(ADMIN, msg.sender);
    }

    function airdrop(uint256 amount) public {
        require(
            IERC20(carboV2Addr).balanceOf(address(this)) >= amount,
            "Contract does not have enough token for this airdrop, contact admin"
        );

        ICarboToken(carboV1Addr).burnFrom(msg.sender, amount);

        IERC20(carboV2Addr).transfer(msg.sender, amount);

        emit AirdropSnapshotv1(msg.sender, amount);
    }
}
