import React, { useState, useEffect } from 'react';
import { getWeb3, getContract } from './web3';
import { Container, TextField, Button, Typography, Paper, Box, Alert } from '@mui/material';
import './App.css'; 

function App() {
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [username, setUsername] = useState('');
  const [otpSeed, setOtpSeed] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState(''); 
  const [status, setStatus] = useState('');
  const [statusSeverity, setStatusSeverity] = useState('info');
  const [publicAddress, setPublicAddress] = useState('');
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const web3Instance = await getWeb3();
        const accounts = await web3Instance.eth.getAccounts();
        const contractInstance = await getContract(web3Instance);

        console.log('Contract:', contractInstance);

        setAccounts(accounts);
        setContract(contractInstance);
      } catch (error) {
        setStatusSeverity('error');
        setStatus(`Initialization Error: ${error.message}`);
      }
    };
    init();
  }, []);

  const handleRegister = async () => {
    try {
      const user = await contract.methods.users(accounts[0]).call();
      if (user.publicKey !== '0x0000000000000000000000000000000000000000') {
        setStatusSeverity('warning');
        setStatus('User already registered.');
        return;
      }
      await contract.methods.registerUser(username, otpSeed).send({ from: accounts[0] });
      setStatusSeverity('success');
      setStatus('User registered successfully.');
    } catch (error) {
      setStatusSeverity('error');
      setStatus(`Registration Error: ${error.message}`);
    }
  };

  const handleGenerateOTP = async () => {
    try {
      const user = await contract.methods.users(accounts[0]).call();
      if (user.publicKey === '0x0000000000000000000000000000000000000000') {
        setStatusSeverity('warning');
        setStatus('You are not registered.');
        return;
      }
      await contract.methods.generateOTP().send({ from: accounts[0] });
      const otp = await contract.methods.otps(accounts[0]).call();
      setGeneratedOtp(otp.toString());
      setStatusSeverity('success');
      setStatus(`OTP generated: ${otp}`);
    } catch (error) {
      setStatusSeverity('error');
      setStatus(`OTP Generation Error: ${error.message}`);
    }
  };

  const handleAuthenticate = async () => {
    try {
      const isAuthenticated = await contract.methods.authenticate(otp).call({ from: accounts[0] });
      setStatusSeverity('success');
      setStatus(`Authenticated: ${isAuthenticated}`);
    } catch (error) {
      setStatusSeverity('error');
      setStatus(`Authentication Error: ${error.message}`);
    }
  };

  const handleFetchUserDetails = async () => {
    try {
      const user = await contract.methods.users(publicAddress).call();
      if (user.publicKey === '0x0000000000000000000000000000000000000000') {
        setStatusSeverity('warning');
        setStatus('You are not registered.');
        setUserDetails(null);
        return;
      }
      setUserDetails(user);
      setStatusSeverity('success');
      setStatus('User details fetched successfully.');
    } catch (error) {
      setStatusSeverity('error');
      setStatus(`Error fetching user details: ${error.message}`);
    }
  };

  return (
    <div className="App">
      <Container maxWidth="sm">
        <Typography variant="h4" component="h1" gutterBottom>
          Blockchain 2FA
        </Typography>
        <Paper elevation={3} className="PaperContainer left">
          <Typography variant="h6">Register User</Typography>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="OTP Seed"
            fullWidth
            margin="normal"
            value={otpSeed}
            onChange={(e) => setOtpSeed(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleRegister}>
            Register
          </Button>
        </Paper>
        <Paper elevation={3} className="PaperContainer right">
          <Typography variant="h6">Generate OTP</Typography>
          <Button variant="contained" color="primary" onClick={handleGenerateOTP}>
            Generate OTP
          </Button>
          <Typography variant="body1">OTP: {generatedOtp}</Typography> {/* Display generated OTP */}
        </Paper>
        <Paper elevation={3} className="PaperContainer left">
          <Typography variant="h6">Authenticate</Typography>
          <TextField
            label="OTP"
            fullWidth
            margin="normal"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleAuthenticate}>
            Authenticate
          </Button>
        </Paper>
        <Paper elevation={3} className="PaperContainer right">
          <Typography variant="h6">Fetch User Details</Typography>
          <TextField
            label="Public Address"
            fullWidth
            margin="normal"
            value={publicAddress}
            onChange={(e) => setPublicAddress(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleFetchUserDetails}>
            Fetch Details
          </Button>
          {userDetails && (
            <Box mt={2}>
              <Typography variant="body1">Username: {userDetails.username}</Typography>
              <Typography variant="body1">Public Key: {userDetails.publicKey}</Typography>
              <Typography variant="body1">OTP Seed: {userDetails.otpSeed.toString()}</Typography>
            </Box>
          )}
        </Paper>
        {status && (
          <Alert severity={statusSeverity} style={{ marginTop: '20px' }}>
            {status}
          </Alert>
        )}
      </Container>
    </div>
  );
}

export default App;
