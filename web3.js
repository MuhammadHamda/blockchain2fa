import Web3 from 'web3';
import ContractABI from './TwoFactorAuth.json';

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    window.addEventListener('load', async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      } else if (window.web3) {
        const web3 = window.web3;
        console.log('Injected web3 detected.');
        resolve(web3);
      } else {
        const provider = new Web3.providers.HttpProvider(`https://sepolia.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`);
        const web3 = new Web3(provider);
        console.log('No web3 instance injected, using Infura/Local web3.');
        resolve(web3);
      }
    });
  });

const getContract = async (web3) => {
  console.log('Contract Address:', process.env.REACT_APP_CONTRACT_ADDRESS); 
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  return new web3.eth.Contract(ContractABI.abi, contractAddress);
};

export { getWeb3, getContract };
