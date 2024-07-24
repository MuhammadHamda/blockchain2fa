// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TwoFactorAuth {
    struct User {
        string username;
        address publicKey;
        uint256 otpSeed;
    }

    mapping(address => User) public users;
    mapping(address => uint256) public otps;
    mapping(address => uint256) public otpTimestamps;

    uint256 constant OTP_VALIDITY_PERIOD = 30 seconds;

    function registerUser(string memory _username, uint256 _otpSeed) public {
        require(users[msg.sender].publicKey == address(0), "User already registered.");
        users[msg.sender] = User(_username, msg.sender, _otpSeed);
    }

    function generateOTP() public {
        require(users[msg.sender].publicKey != address(0), "User not registered.");
        uint256 otp = uint256(keccak256(abi.encodePacked(block.timestamp, users[msg.sender].otpSeed))) % 1000000;
        otps[msg.sender] = otp;
        otpTimestamps[msg.sender] = block.timestamp;
    }

    function authenticate(uint256 _otp) public view returns (bool) {
        require(users[msg.sender].publicKey != address(0), "User not registered.");
        require(otps[msg.sender] == _otp, "Invalid OTP.");
        require(block.timestamp <= otpTimestamps[msg.sender] + OTP_VALIDITY_PERIOD, "OTP expired.");
        return true;
    }
}
