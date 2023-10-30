// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract AssetBloc {
    // DATA
    address private immutable i_owner;
    uint private counter;
    uint private startTime;
    uint private endTime;
    uint private timeInDays;
    uint private rentDueTime;
    uint private timeInOneYear = 31_536_000;

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
    struct Customer {
        uint assetId;
        address walletAddress;
        string name;
        bool paid;
        uint timeRented;
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
    }
    struct LockedUserFunds {
        address walletAddress;
        uint id;
        uint fundsLocked;
        uint positionInArray;
    }

    enum Status {
        NotAvailable,
        Inuse,
        Available
    }

    // Mappings
    mapping(address => User) private users;
    mapping(uint => Asset) private assets;
    mapping(address => Shares[]) private shares;
    mapping(address => LockedUserFunds[]) private userLockedFunds;
    mapping(uint => OwnersOfAsset[]) private assetOwners;
    mapping(uint => Customer) private customers;

    // Arrays
    User[] private _Investors;
    Customer[] private _Customers;

    event InvestorAdded(address indexed wallet, string firstname, uint balance);
    event AssetAdded(
        uint indexed id,
        string propertyname,
        string propertyabout,
        uint propertyvalue,
        uint sharesavailable,
        uint sharessold,
        Status status,
        uint valueperyear
    );
    event AssetEdited(
        uint indexed id,
        string propertyname,
        string propertyabout,
        uint propertyvalue,
        Status status,
        uint rentValuePerYear
    );
    event CustomerAdded(address indexed wallet, string firstname);
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
    event UnlockedShares(
        address indexed wallet,
        uint id,
        uint amount,
        uint sharesPercent
    );
    event RentDepositShare(
        address indexed wallet,
        uint amount,
        uint indexed id,
        Status status,
        bool paid,
        uint timeRented,
        uint timeInYear
    );
    event RentDue(uint indexed id, uint rentDueTime, bool paid);
    event KickedOut(uint indexed id, Status status);
    event Deposit(address indexed walletAddress, uint amount);
    event BalanceWithdrawn(address indexed walletAddress, uint amount);

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

    function addInvestor(
        string calldata firstname,
        string calldata lastname
    ) external {
        require(!isUser(msg.sender), "User already exists");
        users[msg.sender] = User(msg.sender, firstname, lastname, 0);
        _Investors.push(User(msg.sender, firstname, lastname, 0));

        emit InvestorAdded(msg.sender, firstname, 0);
    }

    // Add Customer
    function addCustomer(string calldata name) external {
        require(!isUser(msg.sender), "User already exists");
        customers[0] = Customer(0, msg.sender, name, false, 0);
        _Customers.push(Customer(0, msg.sender, name, false, 0));

        emit CustomerAdded(msg.sender, name);
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
        assets[counter] = Asset(
            counter,
            propertyname,
            propertyabout,
            propertyvalue,
            100,
            0,
            status,
            rentValuePerYear
        );

        emit AssetAdded(
            counter,
            propertyname,
            propertyabout,
            propertyvalue,
            100,
            0,
            status,
            rentValuePerYear
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

        if (bytes(propertyname).length != 0) asset.propertyName = propertyname;
        if (bytes(propertyabout).length != 0)
            asset.propertyAbout = propertyabout;
        assets[id].rentValuePerYear = rentValuePerYear;
        assets[id].propertyValue = propertyvalue;
        assets[id].status = status;

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
        Asset storage assetShares = assets[id];
        uint propValue = assetShares.propertyValue;
        uint sharesCalculatedInPercentage = calcShares(propValue, _amount);
        require(
            sharesCalculatedInPercentage <= assetShares.sharesAvailable,
            "Shares amount not available"
        );
        uint balance = users[msg.sender].balanceBSC;
        require(balance >= _amount, "Insufficient funds");

        unchecked {
            users[msg.sender].balanceBSC -= _amount;
        }
        Shares[] storage userShare = shares[msg.sender];
        OwnersOfAsset[] storage owner = assetOwners[id];

        assetShares.sharesAvailable += sharesCalculatedInPercentage;
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
                    _amount
                )
            );
        }
        if (!check) {
            owner.push(
                OwnersOfAsset(id, msg.sender, sharesCalculatedInPercentage)
            );
        }

        emit BoughtShares(
            msg.sender,
            id,
            assets[id].propertyName,
            _amount,
            sharesCalculatedInPercentage
        );
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

        emit SellShares(msg.sender, id, amount, sharesPercent);
    }

    // Lock bought shares
    function lockShares(uint id, uint amount, uint time) external onlyUser {
        timeInDays = time;
        Shares[] storage userShares = shares[msg.sender];
        LockedUserFunds[] storage lockedShares = userLockedFunds[msg.sender];
        uint propValue = assets[id].propertyValue;
        uint sharesPercent = calcShares(propValue, amount);
        uint totalSharesOfUser;
        bool sharesBought = false;
        uint i;
        for (i = 0; i < userShares.length; i++) {
            if (userShares[i].assetId == id) {
                totalSharesOfUser = userShares[i].shareValueInBSC;
                require(totalSharesOfUser > amount, "Zero shares!");
                userShares[i].shareValueInBSC -= amount;
                sharesBought = true;
                break;
            }
        }

        if (sharesBought) {
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

        emit LockedShares(msg.sender, id, timeInDays, amount, sharesPercent);
    }

    // Unlock bought shares
    function unlockShares(uint id, uint amount) external onlyUser {
        endTime = block.timestamp;
        require(endTime - startTime >= timeInDays, "Time hasn't elasped"); // Do it very well
        LockedUserFunds[] storage lockedShares = userLockedFunds[msg.sender];
        uint propValue = assets[id].propertyValue;
        uint sharesPercent = calcShares(propValue, amount);
        uint totalLockedSharesOfUser;
        uint position;
        bool sharesBought = false;

        for (uint i = 0; i < lockedShares.length; i++) {
            if (lockedShares[i].id == id) {
                totalLockedSharesOfUser = lockedShares[i].fundsLocked;
                require(totalLockedSharesOfUser > amount, "Zero shares!");
                lockedShares[i].fundsLocked -= amount;
                position = lockedShares[i].positionInArray;
                sharesBought = true;
                break;
            }
        }

        if (sharesBought) {
            Shares[] storage userShares = shares[msg.sender];
            userShares[position].shareValueInBSC += amount;
            userShares[position].shareValueInPercentage += sharesPercent;
            timeInDays = 0;
        }

        emit UnlockedShares(msg.sender, id, amount, sharesPercent);
    }

    // Rent Asset and Share profit among the shareholders
    function rentDepositShare(uint id) external payable onlyUser {
        Asset storage assetToRent = assets[id];
        uint rent = assetToRent.rentValuePerYear;
        require(msg.value == rent, "Insufficient funds");
        require(
            assetToRent.status == Status.Available,
            "Asset is not available"
        );
        Customer storage customer = customers[id];
        OwnersOfAsset[] storage owners = assetOwners[id];
        for (uint i = 0; i < owners.length; i++) {
            address wallet = owners[i].owner;
            uint sharesInPercent = owners[i].percentageValue;
            uint sharesInBSC = calcPercentBSC(rent, sharesInPercent);
            users[wallet].balanceBSC += sharesInBSC;
        }
        customer.paid = true;
        customer.timeRented = block.timestamp;
        assetToRent.status = Status.Inuse;

        emit RentDepositShare(
            msg.sender,
            msg.value,
            id,
            Status.Inuse,
            customer.paid,
            customer.timeRented,
            timeInOneYear
        );
    }

    function rentDue(uint id) external onlyUser {
        Asset storage assetToRent = assets[id];
        require(assetToRent.status == Status.Inuse, "No owner!");
        Customer storage customer = customers[id];
        rentDueTime = block.timestamp;
        require(
            rentDueTime - customer.timeRented > timeInOneYear,
            "Time still valid"
        );
        customer.paid = false;

        emit RentDue(id, rentDueTime, customer.paid);
    }

    // Email the company who is the onlyOwner to kickout the occupant as the person has not paid
    function kickOut(uint id) external onlyOwner {
        Asset storage assetToRent = assets[id];
        require(assetToRent.status == Status.Inuse, "No owner!");
        require(customers[id].paid == false, "Customer rent still valid");
        assetToRent.status = Status.Available;

        emit KickedOut(id, Status.Available);
    }

    function withdraw(uint amount) external onlyUser {
        uint balance = users[msg.sender].balanceBSC;
        require(balance >= amount, "Insufficient funds");

        unchecked {
            users[msg.sender].balanceBSC -= amount;
        }
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit BalanceWithdrawn(msg.sender, amount);
    }

    // Deposit
    function deposit() external payable onlyUser {
        unchecked {
            users[msg.sender].balanceBSC += msg.value;
        }
        emit Deposit(msg.sender, msg.value);
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
