// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampaigns;
    
    function createCampaign(uint minimum, string title) public {
        address newCampaign = new Campaign(msg.sender, minimum, title);
        
        deployedCampaigns.push(newCampaign);
    }
    
    function getDeployedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
   
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }
    
    Request[] public requests;
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    uint public approversCount;
    string public title;
    
    function Campaign(address creator, uint minimum, string campaignTitle) public {
        manager = creator;
        minimumContribution = minimum;
        title = campaignTitle;
    }
    
    function contribute() public payable {
        require(msg.value > minimumContribution);
        
        if(!approvers[msg.sender]){
            approvers[msg.sender] = true;
            approversCount++;
        }
    }
    
    function hasApprovedRequest(uint index, address approverAddress) public view returns (bool) {
        Request storage request = requests[index];

        return request.approvals[approverAddress];
    }

    function createRequest(string description, uint value, address recipient) public restricted {
        Request memory newRequest = Request({
            description : description,
            value : value,
            recipient : recipient,
            complete : false,
            approvalCount: 0
        });
        
        requests.push(newRequest);
    }
    
    function approveRequest(uint index) public {
        Request storage request = requests[index];
        
        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);
        
        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }
    
    function finalizeRequest(uint index) public restricted {
        Request storage request = requests[index];
        
        require(request.approvalCount > (approversCount / 2));
        require(!request.complete);
        
        request.recipient.transfer(request.value);
        request.complete = true;
    }

    function getSummary() public view returns (
        uint, uint, uint, uint, address, string
    ) {
        return (
            minimumContribution,
            this.balance,
            requests.length,
            approversCount,
            manager,
            title
        );
    }

    function getRequestCount() public view returns (uint) {
        return requests.length;
    }
    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
}