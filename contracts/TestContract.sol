pragma solidity ^0.4.21;

import "./ERC165Query.sol";
import "./ERC735.sol";

/// @title TestContract
/// @author Mircea Pasoi
/// @dev Contract used in unit tests
contract TestContract {
    // Implements ERC165
    using ERC165Query for address;

    // Events
    event IdentityCalled(bytes32 data);

    // Counts calls by msg.sender
    mapping (address => uint) public numCalls;

    function TestContract() public {
    }

    /// @dev Increments the number of calls from sender
    function callMe() external {
        numCalls[msg.sender] += 1;
    }

    /// @dev Expects to be called by an ERC735 contract and it will emit the label
    ///  of the first LABEL claim in that contract
    function whoCalling() external {
        // ERC735
        require(msg.sender.doesContractImplementInterface(0x10765379));
        // Get first LABEL claim
        ERC735 id = ERC735(msg.sender);
        // TODO: Wait until Solidity 0.4.22 is out to call getClaimIdsByType and getClaim
        // https://github.com/ethereum/solidity/issues/3270
        bytes32 data;
        // 5 is LABEL_CLAIM
        (, , , , data, ) = id.getClaimByTypeAndIndex(5, 0);
        emit IdentityCalled(data);
    }
}
