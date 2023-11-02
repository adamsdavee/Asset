// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract AssetBloc {
    // DATA
    address private immutable i_owner;
    uint private counter;
    uint private timeInDays;
    uint private rentDueTime;

    struct Shares {
        address walletAddress;
        uint assetId;
        string propertyName;
        uint shareValueInPercentage;
        uint shareValueInBSC;
        uint locked;
        uint lockedTime;
    }
    struct OwnersOfAsset {
        uint id;
        address owner;
        uint percentageValue;
    }

    struct User {
        address walletAddress;
        uint balanceBSC;
    }

    struct Asset {
        uint id;
        string propertyName;
        string propertyAbout;
        uint propertyValue;
        uint sharesAvailable;
        uint sharesSold;
        Status status;
        uint rentValuePerYear;
        uint startTime;
        uint endTime;
        address rentee;
        bool paid;
    }

    enum Status {
        NotAvailable,
        Inuse,
        Available
    }

    // Mappings
    mapping(address => uint) private users;
    mapping(uint => Asset) private assets;
    mapping(address => Shares[]) private shares;
    mapping(uint => OwnersOfAsset[]) private assetOwners;

    // Arrays
    Asset[] private assetsArray;

    event InvestorAdded(address indexed wallet, uint balance);
    event AssetAdded(
        uint indexed id,
        string propertyname,
        string propertyabout,
        uint propertyvalue,
        uint sharesavailable,
        uint sharessold,
        Status status,
        uint valueperyear,
        address rentee,
        bool paid
    );
    event AssetEdited(
        uint indexed id,
        string propertyname,
        string propertyabout,
        uint propertyvalue,
        Status status,
        uint rentValuePerYear
    );
    event CustomerAdded(address indexed wallet);
    event BoughtShares(
        address indexed wallet,
        uint indexed id,
        string propertyname,
        uint amount,
        uint sharesinpercentage
    );
    event SellShares(
        address indexed wallet,
        uint indexed id,
        uint amount,
        uint sharespercentage
    );
    event LockedShares(
        address indexed wallet,
        uint id,
        uint timeInDays,
        uint amount,
        uint sharesPercent
    );
    event UnlockedShares(address indexed wallet, uint id);
    event RentDepositShare(
        address indexed wallet,
        uint amount,
        uint indexed id,
        Status status,
        bool paid,
        uint timeRented
    );
    event RentDue(uint indexed id, uint rentDueTime, bool paid);
    event KickedOut(uint indexed id, Status status);
    event Deposit(address indexed walletAddress, uint amount);
    event BalanceWithdrawn(address indexed walletAddress, uint amount);

    constructor() {
        i_owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == i_owner, "Not Owner");
        _;
    }
    modifier onlyUser() {
        require(users[msg.sender] > 0, "User does not exist");
        _;
    }

    modifier isShareholder(uint id) {
        OwnersOfAsset[] storage owners = assetOwners[id];
        bool foundOwner = false;
        for (uint i; i < owners.length; i++) {
            if (owners[i].owner == msg.sender) foundOwner = true;
        }
        require(foundOwner == true, "Not an asset owner!");

        _;
    }

    // Add Asset
    function addAsset(
        string calldata propertyname,
        string calldata propertyabout,
        uint propertyvalue,
        Status status,
        uint rentValuePerYear
    ) external onlyOwner {
        counter++;
        propertyvalue = propertyvalue * (10 ** 18);
        rentValuePerYear = rentValuePerYear * (10 ** 18);

        Asset memory asset = Asset(
            counter,
            propertyname,
            propertyabout,
            propertyvalue,
            100,
            0,
            status,
            rentValuePerYear,
            0,
            0,
            msg.sender,
            false
        );
        assets[counter] = asset;
        assetsArray.push(asset);

        emit AssetAdded(
            counter,
            propertyname,
            propertyabout,
            propertyvalue,
            100,
            0,
            status,
            rentValuePerYear,
            msg.sender,
            false
        );
    }

    function editAsset(
        uint id,
        string calldata propertyname,
        string calldata propertyabout,
        uint propertyvalue,
        Status status,
        uint rentValuePerYear
    ) external onlyOwner {
        require(assets[id].id != 0, "Asset with the Id does not exist");
        Asset storage asset = assets[id];

        asset.propertyName = propertyname;
        asset.propertyAbout = propertyabout;
        assets[id].rentValuePerYear = rentValuePerYear * (10 ** 18);
        assets[id].propertyValue = propertyvalue * (10 ** 18);
        assets[id].status = status;

        assetsArray[id - 1] = asset;
        emit AssetEdited(
            counter,
            propertyname,
            propertyabout,
            propertyvalue,
            status,
            rentValuePerYear
        );
    }

    // Buy shares
    function buyShares(uint id, uint _amount) external onlyUser {
        _amount = _amount * (10 ** 18);
        Asset storage assetShares = assets[id];
        uint propValue = assetShares.propertyValue;
        uint sharesCalculatedInPercentage = calcShares(propValue, _amount);
        require(
            sharesCalculatedInPercentage <= assetShares.sharesAvailable,
            "Shares amount not available"
        );
        uint balance = users[msg.sender];
        require(balance >= _amount, "Insufficient funds");

        unchecked {
            users[msg.sender] -= _amount;
        }
        Shares[] storage userShare = shares[msg.sender];
        OwnersOfAsset[] storage owner = assetOwners[id];

        assetShares.sharesAvailable -= sharesCalculatedInPercentage;
        assetShares.sharesSold += sharesCalculatedInPercentage;

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
                    assets[id].propertyName,
                    sharesCalculatedInPercentage,
                    _amount,
                    0,
                    0
                )
            );
        }
        if (!check) {
            owner.push(
                OwnersOfAsset(id, msg.sender, sharesCalculatedInPercentage)
            );
        }

        assetsArray[id - 1] = assetShares;

        emit BoughtShares(
            msg.sender,
            id,
            assets[id].propertyName,
            _amount,
            sharesCalculatedInPercentage
        );
    }

    // Sell shares
    function sellShares(uint id, uint amount) external isShareholder(id) {
        amount = amount * (10 ** 18);
        Shares[] storage userShares = shares[msg.sender];
        uint totalSharesOfUser;
        bool sharesBought = false;
        uint i;
        for (i = 0; i < userShares.length; i++) {
            if (userShares[i].assetId == id) {
                totalSharesOfUser = userShares[i].shareValueInBSC;
                sharesBought = true;
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

        Asset storage assetUpdate = assets[id];
        assetUpdate.sharesAvailable += sharesPercent;
        assetUpdate.sharesSold -= sharesPercent;
        assetsArray[id - 1] = assetUpdate;

        userShares[i].shareValueInBSC -= amount;
        userShares[i].shareValueInPercentage -= sharesPercent;
        users[msg.sender] += amount;

        emit SellShares(msg.sender, id, amount, sharesPercent);
    }

    // Lock bought shares
    function lockShares(
        uint id,
        uint amount,
        uint time
    ) external isShareholder(id) {
        amount = amount * (10 ** 18);

        Shares[] storage userShares = shares[msg.sender];
        uint propValue = assets[id].propertyValue;
        uint sharesPercent = calcShares(propValue, amount);
        for (uint i = 0; i < userShares.length; i++) {
            if (userShares[i].assetId == id) {
                userShares[i].locked += amount;
                userShares[i].lockedTime += time;
                break;
            }
        }

        emit LockedShares(msg.sender, id, timeInDays, amount, sharesPercent);
    }

    // Unlock bought shares
    function unlockShares(uint id) external isShareholder(id) {
        uint currentTime = block.timestamp;
        Shares[] storage userShares = shares[msg.sender];

        for (uint i = 0; i < userShares.length; i++) {
            if (userShares[i].assetId == id) {
                require(
                    currentTime >= userShares[i].lockedTime,
                    "Lock time hasn't elasped"
                );
                userShares[i].locked = 0;
                userShares[i].lockedTime = 0;
                break;
            }
        }

        emit UnlockedShares(msg.sender, id);
    }

    // Rent Asset and Share profit among the shareholders
    function rentShare(uint id) external payable {
        Asset storage assetToRent = assets[id];
        uint rent = assetToRent.rentValuePerYear;
        require(msg.value == rent, "Insufficient funds");
        require(
            assetToRent.status == Status.Available,
            "Asset is not available"
        );

        OwnersOfAsset[] storage owners = assetOwners[id];
        for (uint i = 0; i < owners.length; i++) {
            address wallet = owners[i].owner;
            uint sharesInPercent = owners[i].percentageValue;
            uint sharesInBSC = calcPercentBSC(rent, sharesInPercent);
            users[wallet] += sharesInBSC;
        }
        assetToRent.paid = true;
        assetToRent.startTime = block.timestamp;
        assetToRent.endTime = assetToRent.startTime + 365 days;
        assetToRent.rentee = msg.sender;
        assetToRent.status = Status.Inuse;

        assetsArray[id - 1] = assetToRent;

        emit RentDepositShare(
            msg.sender,
            msg.value,
            id,
            Status.Inuse,
            assetToRent.paid,
            assetToRent.startTime
        );
    }

    function rentDue(uint id) external isShareholder(id) {
        Asset storage assetToRent = assets[id];
        require(assetToRent.status == Status.Inuse, "No owner!");

        require(block.timestamp > assetToRent.endTime, "Time still valid");
        assetToRent.paid = false;

        assetsArray[id - 1] = assetToRent;
        emit RentDue(id, block.timestamp, assetToRent.paid);
    }

    // Email the company who is the onlyOwner to kickout the occupant as the person has not paid
    function kickOut(uint id) external onlyOwner {
        Asset storage assetToRent = assets[id];
        require(assetToRent.status == Status.Inuse, "No owner!");
        require(assetToRent.paid == false, "Customer rent still valid");
        assetToRent.status = Status.Available;

        assetsArray[id] = assetToRent;
        emit KickedOut(id, Status.Available);
    }

    function withdraw(uint amount) external onlyUser {
        amount = amount * (10 ** 18);
        uint balance = users[msg.sender];
        require(balance >= amount, "Insufficient funds");

        unchecked {
            users[msg.sender] -= amount;
        }
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit BalanceWithdrawn(msg.sender, amount);
    }

    // // Deposit
    function deposit() external payable {
        unchecked {
            users[msg.sender] += msg.value;
        }
        emit Deposit(msg.sender, msg.value);
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

    // Query Functions

    function getOwner() external view returns (address) {
        return i_owner;
    }

    function getAllAssets() external view returns (Asset[] memory) {
        return assetsArray;
    }

    function getAsset(uint id) external view returns (Asset memory) {
        return assets[id];
    }

    function getCurrentCount() external view returns (uint) {
        return counter;
    }

    function getContractBalance() external view onlyOwner returns (uint) {
        return address(this).balance;
    }

    function getUserBalance() external view returns (uint) {
        return users[msg.sender];
    }

    function getAssetByStatus(
        Status _status
    ) external view returns (Asset[] memory) {
        Asset[] memory assetWithStatus;
        uint count = 0;
        for (uint i = 1; i <= counter; i++) {
            if (assets[i].status == _status) {
                assetWithStatus[count] = assets[i];
                count++;
            }
        }

        return assetWithStatus;
    }

    function getAssetById(uint id) external view returns (Asset memory) {
        return assets[id];
    }

    function getSharesAvailable(uint id) external view returns (uint) {
        return assets[id].sharesAvailable;
    }

    function getSharesSold(uint id) external view returns (uint) {
        return assets[id].sharesSold;
    }

    function getUserShares() external view returns (Shares[] memory) {
        return shares[msg.sender];
    }

    function getAssetOwners(
        uint id
    ) external view returns (OwnersOfAsset[] memory) {
        return assetOwners[id];
    }
}
