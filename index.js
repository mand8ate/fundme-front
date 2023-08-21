import { ethers } from "./ethers-5.1.esm.min.js";
import { abi, address } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

// console.log(ethers);

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    document.getElementById("connectButton").innerHTML = "Connected!";
  } else {
    document.getElementById("connectButton").innerHTML =
      "Please install Metamask";
  }
}

async function getBalance() {
  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(address);
    console.log(ethers.utils.formatEther(balance));
  }
}

// fund function
async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`Funding with ${ethAmount} ...`);
  if (typeof window.ethereum !== "undefined") {
    console.log("Yes");
    // provider
    // signer
    // contract
    // ABI & Address
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    // console.log(signer);
    const contract = new ethers.Contract(address, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      // wait for tx to finish
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done");
    } catch (error) {
      console.log(error);
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  // listen for this transaction to finish
  return new Promise((resolve, reject) => {
    let complete = false;

    // listen for transaction receipt
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      if (!complete) {
        console.log(
          `Completed with ${transactionReceipt.confirmations} confirmations`
        );
        complete = true;
        resolve();
      }
    });

    // set timeout for 5 seconds
    setTimeout(() => {
      if (!complete) {
        reject(new Error("Transaction mining timeout"));
      }
    }, 5000);
  });
}

// withdraw
async function withdraw() {
  if (typeof window.ethereum != "undefined") {
    console.log("Withdrawing...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(address, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  }
}
