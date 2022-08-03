// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./libs/ERC721Enumerable.sol";
import "./libs/Ownable.sol";
import "./libs/RoyaltiesV2Impl.sol";
import './libs/SafeMath.sol';
import './libs/Counters.sol';
import './libs/LibRoyaltiesV2.sol';

contract ASG is ERC721Enumerable, Ownable, RoyaltiesV2Impl {
    using Strings for uint256;
    using SafeMath for uint256;

    mapping(address => bool) whitelist;

    mapping (uint256 => string) private revealURI;
    string public unrevealURI = "https://gateway.pinata.cloud/ipfs/QmdFyWEXh9ZV84xtTz7jyUJetLJFEjLcdGd9h1kBJz8vYV/1.webp";
    bool public reveal = false;

    bool public endSale = false;
    bool public publicSale = false;

    string private _baseURIextended = "https://ipfs.io/ipfs/";
    uint256 private _publicPrice = 91 * ( 10 ** 16 );
    uint256 private _whitelistPrice = 10 ** 15;
    // mapping (uint256 => bool) registerID;

    uint256 public tokenMinted = 0;
    bool public pauseMint = true;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdentifiers;
    uint256 public whiteListedNum;

    uint256 public constant MAX_NFT_SUPPLY = 111;
    uint256 public constant MAX_WHITELIST_NUM = 10;
    uint256 public constant MAX_PER_WALLET = 3;
    uint256 public constant MAX_PER_WHITELIST = 1;

    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;
    address payable public marketingWallet = payable(0x97E075279b4f1b5d9D9d9f4bD6820b0915B0e713);
    address payable private ownerWallet = payable(0x4d0A21DCAe6afb82d3f916DCb80e1bb5Feb4360a);

    constructor() ERC721("All Star Gangster", "ASG") {
        setWhitelist(address(0xDC13960B0F3A7a02DC2A8AaBE5EC04fA9522E967));
    }

    function setEndSale(bool _endSale) public onlyOwner {
        endSale = _endSale;
    }

    function setWhitelist(address _add) public onlyOwner {
        require(_add != address(0), "Zero Address");
        require(whiteListedNum < MAX_WHITELIST_NUM, "Whitelisted member exceed!");
        whitelist[_add] = true;
        whiteListedNum += 1;
    }

    function setWhitelistAll(address[] memory _adds) public onlyOwner {
        require(whiteListedNum + _adds.length <= MAX_WHITELIST_NUM, "Whitelisted member exceed!");
        for(uint256 i = 0; i < _adds.length; i++) {
            address tmp = address(_adds[i]);
            whitelist[tmp] = true;
            whiteListedNum += 1;
        }
    }

    function removeWhitelist(address _addr) public onlyOwner {
        require(_addr != address(0), "Zero Address");
        whitelist[_addr] = false;
        whiteListedNum = whiteListedNum - 1;
    }

    function setPublicSale(bool _publicSale) public onlyOwner {
        publicSale = _publicSale;
    }

    function getNFTBalance(address _owner) public view returns (uint256) {
       return ERC721.balanceOf(_owner);
    }

    function getPublicNFTPrice() public view returns (uint256) {
        require(tokenMinted < MAX_NFT_SUPPLY, "Sale has already ended");
        return _publicPrice;
    }

    function claimNFTForOwner() public onlyOwner {
        require(!pauseMint, "Paused!");
        require(tokenMinted < MAX_NFT_SUPPLY, "Sale has already ended");

        _tokenIdentifiers.increment();
        
        _safeMint(msg.sender, _tokenIdentifiers.current());
        tokenMinted += 1;
    }

    function mintNFT(uint256 _cnt) public payable {
        require(_cnt > 0);
        require(_cnt <= MAX_PER_WALLET, "minting number must be less than 5");
        require(!pauseMint, "Paused!");
        require(tokenMinted < MAX_NFT_SUPPLY, "Sale has already ended");
        

        if(!publicSale) {
            require(whitelist[msg.sender], "Not a whitelisted member");
            require(_cnt == MAX_PER_WHITELIST, "minting number must be 1");
            require(_whitelistPrice.mul(_cnt) == msg.value, "ETH value sent is not correct");
        }

        if(publicSale) {
            require(_publicPrice.mul(_cnt) == msg.value, "ETH value sent is not correct");
        }

        for(uint256 i = 0; i < _cnt; i++) {
            _tokenIdentifiers.increment();
            _safeMint(msg.sender, _tokenIdentifiers.current());
            tokenMinted += 1;
        }
    }

    function whitelistMintNFT(uint256 _cnt) public payable {
        if(!publicSale) {
            require(whitelist[msg.sender], "Not a whitelisted member");
            require(_cnt == MAX_PER_WHITELIST, "minting number must be 1");
            require(_whitelistPrice.mul(_cnt) == msg.value, "ETH value sent is not correct");
        }
        for(uint256 i = 0; i < _cnt; i++) {
            _tokenIdentifiers.increment();
            _safeMint(msg.sender, _tokenIdentifiers.current());
            tokenMinted += 1;
        }
    }

    function withdraw() public onlyOwner() {
        require(endSale, "Ongoing Minting");
        uint balance = address(this).balance;
        address payable ownerAddress = payable(msg.sender);
        ownerAddress.transfer(balance);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        if(!reveal) return unrevealURI;
        return bytes(_baseURIextended).length > 0 ? string(abi.encodePacked(_baseURIextended, tokenId.toString(), ".json")) : "";
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURIextended;
    }

    function setBaseURI(string memory baseURI_) external onlyOwner() {
        _baseURIextended = baseURI_;
    }

    function setUnrevealURI(string memory _uri) external onlyOwner() {
        unrevealURI = _uri;
    }

    function Reveal() public onlyOwner() {
        reveal = true;
    }

    function UnReveal() public onlyOwner() {
        reveal = false;
    }

    function getPublicPrice() public view returns (uint256) {
        return _publicPrice;
    }

    function getWhitelistPrice() public view returns (uint256) {
        return _whitelistPrice;
    }

    function setPrice(uint256 _priceextended_) external onlyOwner() {
        _publicPrice = _priceextended_;
    }

    function setWhitelistPrice(uint256 _priceextended_) external onlyOwner() {
        _whitelistPrice = _priceextended_;
    }

    function pause() public onlyOwner {
        pauseMint = true;
    }

    function unPause() public onlyOwner {
        pauseMint = false;
    }

    function setMarketingWallet(address payable _marketingWallet) public onlyOwner {
        marketingWallet = _marketingWallet;
    }

    //configure royalties
    function setRoyalties(uint _tokenId) public onlyOwner {
        LibPart.Part[] memory _royalties = new LibPart.Part[](2);
        _royalties[0].value = 1000;
        _royalties[0].account = marketingWallet;
        _royalties[1].value = 1000;
        _royalties[1].account = ownerWallet;
        _saveRoyalties(_tokenId, _royalties);
    }


    //configure royalties for Mintable using the ERC2981 standard
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) external view returns (address receiver, uint256 royaltyAmount) {
      //use the same royalties that were saved 
      LibPart.Part[] memory _royalties = royalties[_tokenId];
      if(_royalties.length > 0) {
        return (_royalties[0].account, (_salePrice * _royalties[0].value) / 10000);
      }
      return (address(0), 0);
    }


    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable) returns (bool) {
        if(interfaceId == LibRoyaltiesV2._INTERFACE_ID_ROYALTIES) {
            return true;
        }

        if(interfaceId == _INTERFACE_ID_ERC2981) {
          return true;
        }

        return super.supportsInterface(interfaceId);
    }
}