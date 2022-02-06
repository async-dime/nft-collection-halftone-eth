// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract HalftoneEth is ERC721Enumerable, Ownable {
    /**
     * @dev _baseTokenURI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`.
     */

    string _baseTokenURI;

    // _price is the price of one HalftoneEth NFT
    uint256 public _price = 0.01 ether;

    // _paused is used to pause the contract in case of an emergency
    bool public _paused;

    // max number of HalftoneEth
    uint256 public maxTokenIds = 20;

    // total number of tokenIds minted
    uint256 public tokenIds;

    // Whitelist contract instance
    IWhitelist whitelist;

    // boolean to keep track of when presale started
    bool public presaleStarted;

    // timestamp for event presale would end
    uint256 public presaleEnded;

    modifier onlyWhenNotPaused() {
        require(!_paused, "Contract currently paused");
        _;
    }

    /**
     * @dev ERC721 constructor takes in a `name` and a `symbol` for the token collection
     * name in our case is `Halftone Eth` and symbol is `HE`
     * Contructor for Halftone Eth takes in the baseURI to set _baseTokenURI for the collection
     * It is also initializes an instance of whitelist interface
     */
    constructor(string memory baseURI, address whitelistContract)
        ERC721("Halftone Eth", "HET")
    {
        _baseTokenURI = baseURI;
        whitelist = IWhitelist(whitelistContract);
    }

    /**
     * @dev startPresale starts a presale for the whitelisted addresses
     */
    function startPresale() public onlyOwner {
        presaleStarted = true;
        // set presaleEnded time as current timestamp + 5 minutes
        // Solidity has cool syntax for timestamps (seconds, minutes, hours, days, years)
        presaleEnded = block.timestamp + 5 minutes;
    }

    /**
     * @dev presaleMint allows an user to mint one NFT per transaction during the presale
     */
    function presaleMint() public payable onlyWhenNotPaused {
        // check if presale is running
        require(
            presaleStarted && block.timestamp < presaleEnded,
            "Presale is not running"
        );
        // check if sender is whitelisted
        require(
            whitelist.whitelistedAddresses(msg.sender),
            "Unfortunately you're not whitelisted"
        );
        // check if tokenIds is less than maxTokenIds
        require(tokenIds < maxTokenIds, "Exceeded maximum Halftone Eths supply");
        // check if sender has enough ether to buy a token
        require(msg.value >= _price, "Ether sent is not correct");
        tokenIds += 1;
        // _safeMint is a safer version of the _mint function as it ensures that
        // if the address being minted to is a contract, then it knows how to deal with an ERC721 tokens
        // if the address being minted to is not a contract, it works the same way as _mint
        _safeMint(msg.sender, tokenIds);
    }

    /**
     * @dev mint allows an user to mint one NFT per transaction after the presale has ended
     */
    function mint() public payable onlyWhenNotPaused {
        // check if presale has ended
        require(
            presaleStarted && block.timestamp >= presaleEnded,
            "Presale has not ended yet"
        );
        // check if tokenIds is less than maxTokenIds
        require(tokenIds < maxTokenIds, "Exceeded maximum Halftone Eths supply");
        // check if sender has enough ether to buy a token
        require(msg.value >= _price, "Ether sent is not correct");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    /**
     * @dev _baseURI overrides the Openzeppelin's ERC721 implementation which by default
     * returned an empty string for the baseURI
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev setPaused makes the contract paused or unpaused
     */
    function setPaused(bool paused) public onlyOwner {
        _paused = paused;
    }

    /**
     * @dev withdraw send all the ether in the contract
     * to the owner of the contract
     */
    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to withdraw ether");
    }

    // function to receive ether. the msg.data must be empty
    receive() external payable {}

    // fallback function is called when msg.data is not empty
    fallback() external payable {}
}
