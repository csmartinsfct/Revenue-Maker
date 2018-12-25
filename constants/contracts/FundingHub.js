module.exports ={
   ADDRESS:'0xB94BD7c5Ca000Beeff27dB7CEBb9C03749901f19',
   ABI:[
    {
      "constant": true,
      "inputs": [],
      "name": "database",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "name": "_database",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "fallback"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_funder",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "_assetID",
          "type": "bytes32"
        }
      ],
      "name": "LogNewFunder",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_sender",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "_amount",
          "type": "uint256"
        },
        {
          "indexed": true,
          "name": "_assetID",
          "type": "bytes32"
        }
      ],
      "name": "LogAssetFunded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_assetID",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "name": "_amountRaised",
          "type": "uint256"
        }
      ],
      "name": "LogAssetFundingFailed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_assetID",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "name": "_currentEthPrice",
          "type": "uint256"
        }
      ],
      "name": "LogAssetFundingSuccess",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "_funder",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "LogRefund",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_assetID",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "LogAssetPayout",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_locationSent",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "_amountSent",
          "type": "uint256"
        },
        {
          "indexed": true,
          "name": "_caller",
          "type": "address"
        }
      ],
      "name": "LogDestruction",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "_value1",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "_value2",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "_value3",
          "type": "uint256"
        }
      ],
      "name": "fundingLimitModifier",
      "type": "event"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_assetID",
          "type": "bytes32"
        }
      ],
      "name": "fund",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_assetID",
          "type": "bytes32"
        }
      ],
      "name": "payout",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_assetID",
          "type": "bytes32"
        }
      ],
      "name": "initiateRefund",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_assetID",
          "type": "bytes32"
        }
      ],
      "name": "refund",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_functionInitiator",
          "type": "address"
        },
        {
          "name": "_holdingAddress",
          "type": "address"
        }
      ],
      "name": "destroy",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
}