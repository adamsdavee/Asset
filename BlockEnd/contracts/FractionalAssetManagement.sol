// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract AssetBloc {
    // DATA
    address private immutable i_owner;
    uint private counter;
    uint public startTime;
    uint public endTime;
    uint private timeInDays;

    struct Shares {
        address walletAddress;
        uint assetId;
        string propertyName;
        uint shareValueInPercentage;
        uint shareValueInBSC;
    }
    struct OwnersOfAsset {
        uint id;
        address owner;
        uint percentageValue;
    }

    struct User {
        address walletAddress;
        string firstName;
        string lastName;
        uint balanceBSC;
    }
    struct Asset {
        uint id;
        string propertyName;
        string propertyAbout;
        uint propertyValue;
        uint sharesAvailable;
        uint sharesSold;
    }
    struct LockedUserFunds {
        address walletAddress;
        uint id;
        uint fundsLocked;
        uint positionInArray;
    }

    // Mappings
    mapping(address => User) public users;
    mapping(uint => Asset) public assets;
    mapping(address => Shares[]) public shares;
    mapping(address => LockedUserFunds[]) public userLockedFunds;
    mapping(uint => OwnersOfAsset[]) public assetOwners;

    // Arrays
    User[] public _users;
    Asset[] public _assets;

    constructor() {
        i_owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == i_owner, "Only the owner can call this function");
        _;
    }
    modifier onlyUser() {
        require(isUser(msg.sender), "User does not exist");
        _;
    }

    // Functions

    function addUser(
        string calldata firstname,
        string calldata lastname
    ) external {
        require(!isUser(msg.sender), "User already exists");
        users[msg.sender] = User(msg.sender, firstname, lastname, 0);
        _users.push(User(msg.sender, firstname, lastname, 0));
    }

    // Add Asset
    function addAsset(
        string calldata propertyname,
        string calldata propertyabout,
        uint propertyvalue
    ) external onlyOwner {
        counter++;
        assets[counter] = Asset(
            counter,
            propertyname,
            propertyabout,
            propertyvalue,
            100,
            0
        );
        //Delete
        // _assets.push(Asset(counter, propertyname, propertyabout, propertyvalue, 100, 0));
    }

    function editAsset(
        uint id,
        string calldata propertyname,
        string calldata propertyabout
    ) external onlyOwner {
        require(assets[id].id != 0, "Asset with the Id does not exist");
        Asset storage asset = assets[id];

        if (bytes(propertyname).length != 0) asset.propertyName = propertyname;
        if (bytes(propertyabout).length != 0)
            asset.propertyAbout = propertyabout;
    }

    // Buy shares
    function buyShares(uint id, uint _amount) external onlyUser {
        uint balance = users[msg.sender].balanceBSC;
        require(balance >= _amount, "Insufficient funds");

        unchecked {
            users[msg.sender].balanceBSC -= _amount;
        }
        Shares[] storage userShare = shares[msg.sender];
        OwnersOfAsset[] storage owner = assetOwners[id];
        uint propValue = assets[id].propertyValue;
        string memory propertyName = assets[id].propertyName;

        /**TOD0 */
        uint sharesCalculatedInPercentage = calcShares(propValue, _amount);
        bool verify = false;
        for (uint i = 0; i < userShare.length; i++) {
            if (userShare[i].assetId == id) {
                userShare[i]
                    .shareValueInPercentage += sharesCalculatedInPercentage;
                userShare[i].shareValueInBSC += _amount;
                verify = true;
                break;
            }
        }
        bool check = false;
        for (uint i = 0; i < owner.length; i++) {
            if (owner[i].owner == msg.sender) {
                owner[i].percentageValue += sharesCalculatedInPercentage;
                check = true;
                break;
            }
        }
        if (!verify) {
            shares[msg.sender].push(
                Shares(
                    msg.sender,
                    id,
                    propertyName,
                    sharesCalculatedInPercentage,
                    _amount
                )
            );
        }
        if (!check) {
            owner.push(
                OwnersOfAsset(id, msg.sender, sharesCalculatedInPercentage)
            );
        }
    }

    // Sell shares
    function sellShares(uint id, uint amount) external onlyUser {
        Shares[] storage userShares = shares[msg.sender];
        uint totalSharesOfUser;
        bool sharesBought = false;
        uint i;
        for (i = 0; i < userShares.length; i++) {
            if (userShares[i].assetId == id) {
                totalSharesOfUser = userShares[i].shareValueInBSC;
                sharesBought = true;
                // Delete the shares from the array
                break;
            }
        }
        require(
            sharesBought && totalSharesOfUser > amount,
            "Didn't buy shares"
        );

        uint propValue = assets[id].propertyValue;
        uint sharesPercent = calcShares(propValue, amount);
        OwnersOfAsset[] storage owner = assetOwners[id];
        for (uint x = 0; x < owner.length; x++) {
            if (owner[x].owner == msg.sender) {
                owner[x].percentageValue -= sharesPercent;
                break;
            }
        }
        userShares[i].shareValueInBSC -= amount;
        userShares[i].shareValueInPercentage -= sharesPercent;
        users[msg.sender].balanceBSC += amount;
    }

    // Lock bought shares
    function lockShares(uint id, uint amount, uint time) external onlyUser {
        timeInDays = time;
        Shares[] storage userShares = shares[msg.sender];
        LockedUserFunds[] storage lockedShares = userLockedFunds[msg.sender];
        uint totalSharesOfUser;
        bool sharesBought = false;
        uint i;
        for (i = 0; i < userShares.length; i++) {
            if (userShares[i].assetId == id) {
                // Reduce the value
                totalSharesOfUser = userShares[i].shareValueInBSC;
                require(totalSharesOfUser > amount, "Zero shares!");
                userShares[i].shareValueInBSC -= amount;
                sharesBought = true;
                // Delete the shares from the array
                break;
            }
        }

        if (sharesBought) {
            uint propValue = assets[id].propertyValue;
            uint sharesPercent = calcShares(propValue, amount);
            userShares[i].shareValueInPercentage -= sharesPercent;
            bool verify = false;
            for (uint x = 0; x < lockedShares.length; x++) {
                if (lockedShares[x].id == id) {
                    lockedShares[x].fundsLocked += amount;
                    verify = true;
                    break;
                }
            }
            if (!verify) {
                userLockedFunds[msg.sender].push(
                    LockedUserFunds(msg.sender, id, amount, i)
                );
            }
            startTime = block.timestamp;
        } else revert("No shares found!");
    }

    // Unlock bought shares
    function unlockShares(uint id, uint amount) external onlyUser {
        endTime = block.timestamp;
        require(startTime - endTime >= timeInDays, "Time hasn't elasped"); // Do it very well
        LockedUserFunds[] storage lockedShares = userLockedFunds[msg.sender];
        uint totalLockedSharesOfUser;
        uint position;
        bool sharesBought = false;

        for (uint i = 0; i < lockedShares.length; i++) {
            if (lockedShares[i].id == id) {
                // Reduce the value
                totalLockedSharesOfUser = lockedShares[i].fundsLocked;
                require(totalLockedSharesOfUser > amount, "Zero shares!");
                lockedShares[i].fundsLocked -= amount;
                position = lockedShares[i].positionInArray;
                sharesBought = true;
                // Delete the shares from the array
                break;
            }
        }

        if (sharesBought) {
            /**TODO: Locked funds */
            Shares[] storage userShares = shares[msg.sender];
            userShares[position].shareValueInBSC += amount;
            uint propValue = assets[id].propertyValue;
            uint sharesPercent = calcShares(propValue, amount);
            userShares[position].shareValueInPercentage += sharesPercent;
        }
    }

    // Disburse profit and store a percentage of funds
    function disburseProfit(uint id) external payable onlyUser {
        OwnersOfAsset[] storage owners = assetOwners[id];
        for (uint i = 0; i < owners.length; i++) {
            address wallet = owners[i].owner;
            uint sharesInPercent = owners[i].percentageValue;
            uint sharesInBSC = calcPercentBSC(msg.value, sharesInPercent);
            users[wallet].balanceBSC += sharesInBSC;
        }
    }

    function withdraw(uint amount) external onlyUser {
        uint balance = users[msg.sender].balanceBSC;
        require(balance >= amount, "Insufficient funds");

        unchecked {
            users[msg.sender].balanceBSC -= amount;
        }
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }

    // Deposit
    function deposit() external payable onlyUser {
        unchecked {
            users[msg.sender].balanceBSC += msg.value;
        }
    }

    function isUser(address wallet) private view returns (bool) {
        return users[wallet].walletAddress != address(0);
    }

    function calcShares(uint propVal, uint amount) private pure returns (uint) {
        uint x = 100 * amount;
        return x / propVal;
    }

    function calcPercentBSC(
        uint profit,
        uint sharesInPercent
    ) private pure returns (uint) {
        uint x = profit * sharesInPercent;
        return x / 100;
    }
}
