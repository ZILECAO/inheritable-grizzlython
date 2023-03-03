import React, { Component, useEffect } from 'react';
import './App.css';
import Web3 from 'web3'
import { keccak512 } from 'js-sha3'

import Inheritance_abi from "./Inheritance_abi.json";
import WeaveHash_abi from "./WeaveHash_abi.json";

const solanaWeb3 = require("@solana/web3.js");
const Buffer = require("buffer").Buffer

const { ethereum } = window;

const gasPrice = 1000; //saving tokens. It seems any gas price will work (for now) as the netowrk is not used

const CHAIN_ID = "0x14A33"; //base testnet
const CONTRACT_ADDRESS = "0x95bf3fc55aB20b4Dfc46EA20f9233D07038a6515";

const CHAIN = {
	chainId: CHAIN_ID,
	chainName: "Base Goerli Testnet",
	nativeCurrency: {
		name: "ETH",
		symbol: "ETH",
		decimals: 18,
	},
	rpcUrls: ["https://goerli.base.org"],
	blockExplorerUrls: ["https://goerli.basescan.org/"],
};


class Oracle extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentMetamaskAccount: null,
            oraclesCount: 0,
            unlocked: false,
        };

    }

    componentDidMount() {
        this.loadWeb3().then(async () => {
            this.status();
        });
    }

   async loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            window.ethereum.enable();
        }
    }

    async getCurrentMetamaskAccount() {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        return accounts[0];
    }

    async status() {
        const contract = await new window.web3.eth.Contract(Inheritance_abi, CONTRACT_ADDRESS);
        const oracles = await contract.methods.OraclesCount().call({ chainId: CHAIN_ID });
        const unlocked = await contract.methods.Unlocked().call({ chainId: CHAIN_ID });
        this.setState({
            oraclesCount: oracles,
            unlocked: unlocked > 0
        })
    }

    async connect() {
        const permissions = await ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{
                eth_accounts: {},
            }]
        });
        this.setState({ currentMetamaskAccount: await this.getCurrentMetamaskAccount() });

        const contract = await new window.web3.eth.Contract(Inheritance_abi, CONTRACT_ADDRESS);
        console.log(await contract.methods.Oracles(0).call())
        console.log(await contract.methods.Oracles(1).call())
        console.log(await contract.methods.Oracles(2).call())
    }

    async vote() {
        const contract = await new window.web3.eth.Contract(Inheritance_abi, CONTRACT_ADDRESS);

        const account = this.state.currentMetamaskAccount;
        let msg = "I confirm that it's time" +
            "\n\nWallet: " + account;

        const signature = await ethereum.request({
            method: 'personal_sign',
            params: [account, msg]
        });

        const vote = await contract.methods.vote(signature).send({ chainId: CHAIN_ID, from: account, gasPrice: gasPrice });
        console.log(vote)

        this.status();
    }


    render() {
        return <section className="bg-zinc-800 min-h-screen">
            <header className="items-center justify-between pt-12">
                <h1 className="mx-auto text-center pb-2 text-5xl font-extrabold font-mono text-gray-300">
                    Oracle
                </h1>
                <h1 className="mx-auto text-center m-2 text-2xl font-medium font-mono text-gray-300 underline decoration-gray-500">Oracle View</h1>
            </header>

            <div class="text-sm items-center text-center mt-6">
                <div class="max-w-2xl p-6 mx-auto text-center backdrop-sepia-0 backdrop-blur-sm border shadow-xl border-black">

                    <p class="transition ">
                        <span className="text-yellow-600">Connected MetaMask address: </span> <span className="text-gray-800"> {this.state.currentMetamaskAccount}</span>
                        <br />
                        <br />
                        <br />
                        <label className="text-zinc-500">Oracles Count:</label> <span className="text-yellow-600">{this.state.oraclesCount}</span>
                        <br />
                        <label className="text-zinc-500">Will Unlocked:</label> <span className="text-yellow-600">{this.state.unlocked ? "Yes" : "No"}</span>
                        <br />
                        <button className="px-5 py-2.5 mt-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-md shadow" type="submit" onClick={() => this.connect()}>Connect Wallet</button>
                        &nbsp;
                        <button className="px-5 py-2.5 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-md shadow" type="submit" onClick={() => this.vote()}>It's Time</button>
                    </p>
                </div>
            </div>


        </section>
    }
}

export default Oracle;