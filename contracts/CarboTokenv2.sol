// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract CarboTokenv2 is ERC20Burnable, AccessControl {
    using SafeERC20 for IERC20;
    bytes32 public constant ADMIN = keccak256("ADMIN");

    address public teamDev;
    uint256 public latestUpdateForTeamDev;

    uint256 public constant secondsPerMonth = 2_592_000;

    uint256 public maxTokenForDev;
    uint256 public tokenEachMonth;
    uint256 public receivedTokenForDev;

    bool private releaseDone;

    event RewardForDev(uint256 timeUpdate, uint256 reward);
    event ReleaseTokenForAirdropContract(
        address airdropContract,
        uint256 amount
    );
    event ChangeAdminRole(address oldAdmin, address newAdmin);
    event EmergencyWithdraw(
        address token,
        address adminAddress,
        uint256 amount
    );

    constructor(
        address owner,
        uint256 _latestUpdatedForTeamDev
    ) ERC20("CLEANCARBON", "CARBO")  {
        require(
            _latestUpdatedForTeamDev % secondsPerMonth == 0,
            "not a multiple of secondsPerMonth"
        );
        _setupRole(DEFAULT_ADMIN_ROLE, owner);
        _grantRole(ADMIN, owner);

        //null address
        _mint(
            0x0000000000000000000000000000000000000001,
            80_000_000 * 10 ** decimals()
        );
        // future burning
        _mint(
            0x062Ede1C8613629f4dAF34CC5a9225988df95695,
            90_000_000 * 10 ** decimals()
        );

        //future public
        _mint(
            0xff6A07a7887097aaba127936329B5325a0BcE2C1,
            50_000_000 * 10 ** decimals()
        );

        // liquidity pool
        _mint(
            0x8441220eFF1370A24f1400f79C06558c3C5A48fa,
            65_000_000 * 10 ** decimals()
        );

        //airdrop
        _mint(
            0x1D2d2B2DddA02500B97f08f361AFb17751a27728,
            35_000_000 * 10 ** decimals()
        );
        //contests
        _mint(
            0xff48bCC891e2d2E442E2D01aFDA93161572736aF,
            25_000_000 * 10 ** decimals()
        );

        //marketing
        _mint(
            0xa48d081d79FB257eEA71791B99D535858Ad8B1DC,
            20_000_000 * 10 ** decimals()
        );

        //company reserve
        _mint(
            0xA5B10a6A78dF992Fd06587400378010BD248278b,
            15_000_000 * 10 ** decimals()
        );

        teamDev = 0x924bFf61da5B81ecCc58607e3CB76A00aa6201cf;
        maxTokenForDev = 30_000_000 * 10 ** decimals();
        tokenEachMonth = 1_000_000 * 10 ** decimals();
        latestUpdateForTeamDev = _latestUpdatedForTeamDev;
    }

    function releaseForAirdrop(address contractAirdrop) public onlyRole(ADMIN) {
        require(!releaseDone, "Already released");
        releaseDone = true;
        _mint(contractAirdrop, 90_000_000 * 10 ** decimals());

        emit ReleaseTokenForAirdropContract(
            contractAirdrop,
            90_000_000 * 10 ** decimals()
        );
    }

    function rewardForTeamDev() public {
        if (block.timestamp >= latestUpdateForTeamDev) {
            uint256 tillTime = (block.timestamp / secondsPerMonth);

            uint256 fromTime = (latestUpdateForTeamDev / secondsPerMonth);

            uint256 multiplier = tillTime - fromTime;

            uint256 reward = multiplier * tokenEachMonth;

            if (reward > maxTokenForDev - receivedTokenForDev) {
                reward = maxTokenForDev - receivedTokenForDev;
            }
            receivedTokenForDev += reward;

            _mint(teamDev, reward);

            emit RewardForDev(block.timestamp, reward);

            latestUpdateForTeamDev = block.timestamp;
        }
    }

    function _mint(address account, uint256 amount) internal override {
        super._mint(account, amount);
    }

    function changeAdminRole(address account) public onlyRole(ADMIN) {
        _grantRole(ADMIN, account);
        _revokeRole(ADMIN, msg.sender);

        emit ChangeAdminRole(msg.sender, account);
    }

    function emergencyWithdraw(
        address token
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 amount = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransfer(
            msg.sender,
            IERC20(token).balanceOf(address(this))
        );
        emit EmergencyWithdraw(token, msg.sender, amount);
    }
}
