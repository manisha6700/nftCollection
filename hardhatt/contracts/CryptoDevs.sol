// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable {

    string _baseTokenURI;

    bool public presaleStarted;

    uint256 public presaleEnded;

    uint256 public maxTokenIds = 20;

    uint256 public tokenIds;

    uint256 public _publicPrice = 0.001 ether;
    uint256 public _presalePrice = 0.0005 ether;

    bool public _paused;

    modifier onlyWhenNotPaused {
        require(!_paused, "Contract currently Paused");
        _;
        //this says whatever is there in the rest of the contract u can execute that
    }

    IWhitelist whitelist;

    constructor(string memory baseURI, address whitelistContarct) ERC721("Crypro Devs", "CD"){
        _baseTokenURI = baseURI;
        whitelist = IWhitelist(whitelistContarct);
    }

    function startPresale() public onlyOwner {
        presaleStarted = true;
        presaleEnded = block.timestamp + 5 minutes;
    }

    function presaleMint() public payable onlyWhenNotPaused {
        require(presaleStarted && block.timestamp < presaleEnded, "Presale is not running");
        require(whitelist.whitelistedAddresses(msg.sender), "You are not in whitelisted");
        require(tokenIds < maxTokenIds, "Exceeded the limit");
        require(msg.value >= _presalePrice, "Ether sent is not correct");

        tokenIds += 1;

        //it's checking if the address is not null and tokenid already exists then assigns
        _safeMint(msg.sender, tokenIds);
    }

    function mint() public payable onlyWhenNotPaused {
        require(presaleStarted && block.timestamp >= presaleEnded, "Presale has not ended yet");
        require(tokenIds < maxTokenIds, "Exceeded the limit");
        require(msg.value >= _publicPrice, "Ether sent is not correct");

        tokenIds += 1;

        _safeMint(msg.sender, tokenIds);
    }

    function _baseURI() internal view virtual override returns(string memory){
        return _baseTokenURI;
    }

    function setPaused(bool val) public onlyOwner {
        _paused = val;
    }

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent,) = _owner.call{value: amount}("");
        //the second parametr is for data and now we don't need to send any data
        require(sent, "Failed to send Ether");
    }

    //receive and fallback functions are required if the contract is receiving ethers
    //receive is called when msg.data is empty i.e., we r sending ethers and not sending any data
    receive() external payable{}
    //fallback is called when msg.data is not empty
    fallback() external payable{}


}