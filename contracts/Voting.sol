// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

contract Voting {
    string public title = "Would all students pass DS-II?";

    function vote(bool _vote) public {
        emit LogVote(msg.sender, _vote);
    }

    event LogVote(address who, bool vote);
}
