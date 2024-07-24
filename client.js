const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const contractPath = path.resolve(__dirname, 'build', 'contracts', 'TwoFactorAuth.json');
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const web3 = new Web3(new Web3.providers.HttpProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`));
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;
const contractAddress = process.env.CONTRACT_ADDRESS;
const twoFactorAuth = new web3.eth.Contract(contract.abi, contractAddress);
async function isUserRegistered(address) {
    try {
        const user = await twoFactorAuth.methods.users(address).call();
        return user.publicKey !== '0x0000000000000000000000000000000000000000';
    } catch (error) {
        console.error('Error checking user registration:', error.message);
        return false;
    }
}
async function registerUser(username, otpSeed) {
    try {
        const isRegistered = await isUserRegistered(account.address);
        if (isRegistered) {
            console.log('User already registered.');
            return;
        }
        const gas = await twoFactorAuth.methods.registerUser(username, otpSeed).estimateGas({ from: account.address });
        await twoFactorAuth.methods.registerUser(username, otpSeed).send({
            from: account.address,
            gas,
            gasPrice: web3.utils.toWei('10', 'gwei')
        });
        console.log('User registered.');
    } catch (error) {
        console.error('Error registering user:', error.message);
    }
}
async function generateOTP() {
    try {
        const gas = await twoFactorAuth.methods.generateOTP().estimateGas({ from: account.address });
        await twoFactorAuth.methods.generateOTP().send({
            from: account.address,
            gas,
            gasPrice: web3.utils.toWei('10', 'gwei')
        });
        const otp = await twoFactorAuth.methods.otps(account.address).call();
        console.log('OTP:', otp);
    } catch (error) {
        console.error('Error generating OTP:', error.message);
    }
}
async function authenticate(otp) {
    try {
        const isAuthenticated = await twoFactorAuth.methods.authenticate(otp).call({ from: account.address });
        console.log('Authenticated:', isAuthenticated);
    } catch (error) {
        console.error('Error authenticating:', error.message);
    }
}
(async () => {
    try {
        await registerUser('user1', 123456);
        setTimeout(async () => {
            await generateOTP();
            const otp = await twoFactorAuth.methods.otps(account.address).call();
            setTimeout(async () => {
                await authenticate(otp);
            }, 2000);
        }, 2000);
    } catch (error) {
        console.error('Error:', error.message);
    }
})();












