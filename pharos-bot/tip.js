require('dotenv').config();
const { ethers } = require('ethers');
const readline = require('readline');

// MONAD TESTNET CONFIGURATION
const RPC_URL = 'https://api.zan.top/node/v1/pharos/testnet/ed6c5bbb3d9e421d95d932f30f330aba';
const CHAIN_ID = 688688;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// CONTRACT ADDRESSES
const TIP_CONTRACT = '0xd17512b7ec12880bd94eca9d774089ff89805f02'; // PrimusTip
const LIQUIDITY_CONTRACT = '0x4b177aded3b8bd1d5d747f91b9e853513838cd49';
const SWAP_CONTRACT = '0xf05af5e9dc3b1dd3ad0c087bd80d7391283775e0';

const provider = new ethers.providers.JsonRpcProvider(RPC_URL, CHAIN_ID);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Colors for console output
const colors = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
  reset: '\x1b[0m'
};

console.log(`${colors.cyan}=== Monad Testnet Multi-Function Bot ===${colors.reset}`);
console.log(`${colors.gray}Wallet: ${wallet.address}${colors.reset}`);

const addDVMLiquidity = async () => {
  const methodID = '0x674d9422';
  
  // Generate fresh deadline
  const currentTime = Math.floor(Date.now() / 1000);
  const deadline = currentTime + 1800; // 30 minutes
  const deadlineHex = deadline.toString(16).padStart(64, '0');
  
  const params = [
    '000000000000000000000000ff7129709ebd3485c4ed4fef6dd923025d24e730',
    '0000000000000000000000000000000000000000000000000000000000002710',
    '00000000000000000000000000000000000000000000000000000000000076db',
    '0000000000000000000000000000000000000000000000000000000000002706',
    '00000000000000000000000000000000000000000000000000000000000076bc',
    '0000000000000000000000000000000000000000000000000000000000000000',
    deadlineHex // dynamic deadline
  ];

  const data = methodID + params.join('');
  const tx = {
    to: LIQUIDITY_CONTRACT,
    data,
    gasLimit: 300000,
    maxPriorityFeePerGas: ethers.utils.parseUnits('1', 'gwei'),
    maxFeePerGas: ethers.utils.parseUnits('2', 'gwei'),
    value: ethers.utils.parseEther('0'),
  };

  try {
    console.log(`${colors.cyan}[⟳] Adding DVM Liquidity...${colors.reset}`);
    const sentTx = await wallet.sendTransaction(tx);
    console.log(`${colors.green}[✓] Liquidity Tx: ${sentTx.hash}${colors.reset}`);
    
    const receipt = await sentTx.wait();
    if (receipt.status === 1) {
      console.log(`${colors.green}[+] Liquidity confirmed ✅${colors.reset}`);
      console.log(`${colors.cyan}[↗] Explorer: https://testnet.monad.xyz/tx/${receipt.transactionHash}${colors.reset}`);
    } else {
      console.log(`${colors.red}[✗] Liquidity failed${colors.reset}`);
    }
  } catch (err) {
    console.error(`${colors.red}[✗] Liquidity error: ${err.message}${colors.reset}`);
  }
};

const addDVMswap = async () => {
  const methodID = '0x426e40b1';
  
  // Generate fresh deadline
  const currentTime = Math.floor(Date.now() / 1000);
  const deadline = currentTime + 1800;
  const deadlineHex = deadline.toString(16).padStart(64, '0');
  
  const params = [
    '00000000000000000000000072df0bcd7276f2dfbac900d1ce63c272c4bccced',
    '000000000000000000000000d4071393f8716661958f766df660033b3d35fd29',
    '000000000000000000000000000000000000000000000000000000000000001e',
    '0000000000000000000000000000000000000000000000000000000000002710',
    '0000000000000000000000000000000000000000000000000000000000000881',
    '00000000000000000000000000000000000000000000000000000000000026de',
    '0000000000000000000000000000000000000000000000000000000000000876',
    '0000000000000000000000936ef30fb39c71f767da67bf32bf73cb6b61b777',
    deadlineHex // dynamic deadline
  ];

  const data = methodID + params.join('');
  const tx = {
    to: SWAP_CONTRACT,
    data,
    gasLimit: 300000,
    maxPriorityFeePerGas: ethers.utils.parseUnits('1', 'gwei'),
    maxFeePerGas: ethers.utils.parseUnits('2', 'gwei'),
    value: ethers.utils.parseEther('0'),
  };

  try {
    console.log(`${colors.cyan}[⟳] DVM Swapping...${colors.reset}`);
    const sentTx = await wallet.sendTransaction(tx);
    console.log(`${colors.green}[✓] Swap Tx: ${sentTx.hash}${colors.reset}`);
    
    const receipt = await sentTx.wait();
    if (receipt.status === 1) {
      console.log(`${colors.green}[+] Swap confirmed ✅${colors.reset}`);
      console.log(`${colors.cyan}[↗] Explorer: https://testnet.monad.xyz/tx/${receipt.transactionHash}${colors.reset}`);
    } else {
      console.log(`${colors.red}[✗] Swap failed${colors.reset}`);
    }
  } catch (err) {
    console.error(`${colors.red}[✗] Swap error: ${err.message}${colors.reset}`);
  }
};

// UPDATED TIP FUNCTION BASED ON LATEST SUCCESSFUL TX: 0x060e45840d33f4fadba798194ad5714d1afa702176c39be042a5772d79fbda2b
const tipFunction = async () => {
  const methodID = '0x8e57fa5d';
  
  // EXACT PARAMETERS FROM LATEST SUCCESSFUL TRANSACTION
  const params = [
    '0000000000000000000000000000000000000000000000000000000000000001', // [0]
    '0000000000000000000000000000000000000000000000000000000000000000', // [1]
    '0000000000000000000000000000000000000000000000000000000000000060', // [2]
    '0000000000000000000000000000000000000000000000000000000000000080', // [3]
    '00000000000000000000000000000000000000000000000000000000000000c0', // [4]
    '00000000000000000000000000000000000000000000000000038d7ea4c68000', // [5] 0.001 PHRS ✅ UPDATED!
    '0000000000000000000000000000000000000000000000000000000000000100', // [6]
    '000000000000000000000000000000000000000000000000000000000000000e', // [7] ✅ UPDATED! (was 0x01)
    '676f6f676c65206163636f756e74000000000000000000000000000000000000', // [8] ✅ UPDATED! "google account"
    '0000000000000000000000000000000000000000000000000000000000000012', // [9] ✅ UPDATED! (length 18)
    '6a6f6b6f73616e7340676d61696c2e636f6d0000000000000000000000000000', // [10] ✅ UPDATED! "jokosant@gmail.com"
    '0000000000000000000000000000000000000000000000000000000000000000'  // [11]
  ];

  const data = methodID + params.join('');
  const tx = {
    to: TIP_CONTRACT,
    data,
    gasLimit: 150000, // Based on successful tx: 146,183 limit, 136,620 used
    maxPriorityFeePerGas: ethers.utils.parseUnits('3', 'gwei'), // ✅ UPDATED! (was 1 gwei)
    maxFeePerGas: ethers.utils.parseUnits('4', 'gwei'), // ✅ UPDATED! (was 2 gwei)
    value: ethers.utils.parseEther('0.001'), // ✅ UPDATED! (was 0.0001)
  };

  try {
    console.log(`${colors.cyan}[⟳] Sending tip via PrimusTip (google account)...${colors.reset}`);
    console.log(`${colors.gray}Amount: 0.001 PHRS | Gas: 3 Gwei | To: jokosant@gmail.com${colors.reset}`);
    const sentTx = await wallet.sendTransaction(tx);
    console.log(`${colors.green}[✓] Tip Tx: ${sentTx.hash}${colors.reset}`);
    
    const receipt = await sentTx.wait();
    if (receipt.status === 1) {
      console.log(`${colors.green}[+] Tip confirmed ✅${colors.reset}`);
      console.log(`${colors.cyan}[↗] Explorer: https://testnet.monad.xyz/tx/${receipt.transactionHash}${colors.reset}`);
    } else {
      console.log(`${colors.red}[✗] Tip failed${colors.reset}`);
    }
  } catch (err) {
    console.error(`${colors.red}[✗] Tip error: ${err.message}${colors.reset}`);
  }
};

// VARIATIONS BASED ON NEW SUCCESSFUL PATTERN
const tipFunctionVariation = async () => {
  const methodID = '0x8e57fa5d';
  
  // Array of tip variations with same structure as latest successful tx
  const tipVariations = [
    {
      // Original latest successful pattern - "google account" + "jokosant@gmail.com"
      params: [
        '0000000000000000000000000000000000000000000000000000000000000001',
        '0000000000000000000000000000000000000000000000000000000000000000',
        '0000000000000000000000000000000000000000000000000000000000000060',
        '0000000000000000000000000000000000000000000000000000000000000080',
        '00000000000000000000000000000000000000000000000000000000000000c0',
        '00000000000000000000000000000000000000000000000000038d7ea4c68000', // 0.001 PHRS
        '0000000000000000000000000000000000000000000000000000000000000100',
        '000000000000000000000000000000000000000000000000000000000000000e', // length 14
        '676f6f676c65206163636f756e74000000000000000000000000000000000000', // "google account"
        '0000000000000000000000000000000000000000000000000000000000000012', // length 18
        '6a6f6b6f73616e7340676d61696c2e636f6d0000000000000000000000000000', // "jokosant@gmail.com"
        '0000000000000000000000000000000000000000000000000000000000000000'
      ],
      amount: '0.001',
      title: 'google account',
      email: 'jokosant@gmail.com'
    },
    {
      // Variation 1 - "crypto wallet" + "test@gmail.com"
      params: [
        '0000000000000000000000000000000000000000000000000000000000000001',
        '0000000000000000000000000000000000000000000000000000000000000000',
        '0000000000000000000000000000000000000000000000000000000000000060',
        '0000000000000000000000000000000000000000000000000000000000000080',
        '00000000000000000000000000000000000000000000000000000000000000c0',
        '00000000000000000000000000000000000000000000000000038d7ea4c68000', // 0.001 PHRS
        '0000000000000000000000000000000000000000000000000000000000000100',
        '000000000000000000000000000000000000000000000000000000000000000d', // length 13
        '63727970746f2077616c6c6574000000000000000000000000000000000000000', // "crypto wallet"
        '000000000000000000000000000000000000000000000000000000000000000e', // length 14
        '7465737440676d61696c2e636f6d000000000000000000000000000000000000', // "test@gmail.com"
        '0000000000000000000000000000000000000000000000000000000000000000'
      ],
      amount: '0.001',
      title: 'crypto wallet',
      email: 'test@gmail.com'
    },
    {
      // Variation 2 - "gaming setup" + "game@gmail.com"
      params: [
        '0000000000000000000000000000000000000000000000000000000000000001',
        '0000000000000000000000000000000000000000000000000000000000000000',
        '0000000000000000000000000000000000000000000000000000000000000060',
        '0000000000000000000000000000000000000000000000000000000000000080',
        '00000000000000000000000000000000000000000000000000000000000000c0',
        '00000000000000000000000000000000000000000000000000038d7ea4c68000', // 0.001 PHRS
        '0000000000000000000000000000000000000000000000000000000000000100',
        '000000000000000000000000000000000000000000000000000000000000000c', // length 12
        '67616d696e6720736574757000000000000000000000000000000000000000000', // "gaming setup"
        '000000000000000000000000000000000000000000000000000000000000000e', // length 14
        '67616d6540676d61696c2e636f6d000000000000000000000000000000000000', // "game@gmail.com"
        '0000000000000000000000000000000000000000000000000000000000000000'
      ],
      amount: '0.001',
      title: 'gaming setup',
      email: 'game@gmail.com'
    },
    {
      // Variation 3 - "monad testnet" + "dev@gmail.com"
      params: [
        '0000000000000000000000000000000000000000000000000000000000000001',
        '0000000000000000000000000000000000000000000000000000000000000000',
        '0000000000000000000000000000000000000000000000000000000000000060',
        '0000000000000000000000000000000000000000000000000000000000000080',
        '00000000000000000000000000000000000000000000000000000000000000c0',
        '00000000000000000000000000000000000000000000000000038d7ea4c68000', // 0.001 PHRS
        '0000000000000000000000000000000000000000000000000000000000000100',
        '000000000000000000000000000000000000000000000000000000000000000c', // length 12
        '6d6f6e6164207465737473656e65740000000000000000000000000000000000', // "monad testnet"
        '000000000000000000000000000000000000000000000000000000000000000d', // length 13
        '64657640676d61696c2e636f6d0000000000000000000000000000000000000', // "dev@gmail.com"
        '0000000000000000000000000000000000000000000000000000000000000000'
      ],
      amount: '0.001',
      title: 'monad testnet',
      email: 'dev@gmail.com'
    },
    {
      // Variation 4 - "web3 project" + "web3@gmail.com"
      params: [
        '0000000000000000000000000000000000000000000000000000000000000001',
        '0000000000000000000000000000000000000000000000000000000000000000',
        '0000000000000000000000000000000000000000000000000000000000000060',
        '0000000000000000000000000000000000000000000000000000000000000080',
        '00000000000000000000000000000000000000000000000000000000000000c0',
        '00000000000000000000000000000000000000000000000000038d7ea4c68000', // 0.001 PHRS
        '0000000000000000000000000000000000000000000000000000000000000100',
        '000000000000000000000000000000000000000000000000000000000000000c', // length 12
        '776562332070726f6a656374000000000000000000000000000000000000000', // "web3 project"
        '000000000000000000000000000000000000000000000000000000000000000e', // length 14
        '7765623340676d61696c2e636f6d000000000000000000000000000000000000', // "web3@gmail.com"
        '0000000000000000000000000000000000000000000000000000000000000000'
      ],
      amount: '0.001',
      title: 'web3 project',
      email: 'web3@gmail.com'
    }
  ];
  
  // Random select from working variations
  const randomTip = tipVariations[Math.floor(Math.random() * tipVariations.length)];
  
  const data = methodID + randomTip.params.join('');
  const tx = {
    to: TIP_CONTRACT,
    data,
    gasLimit: 150000,
    maxPriorityFeePerGas: ethers.utils.parseUnits('3', 'gwei'),
    maxFeePerGas: ethers.utils.parseUnits('4', 'gwei'),
    value: ethers.utils.parseEther(randomTip.amount),
  };

  try {
    console.log(`${colors.cyan}[⟳] Tip "${randomTip.title}" to ${randomTip.email} (${randomTip.amount} PHRS)...${colors.reset}`);
    
    const sentTx = await wallet.sendTransaction(tx);
    console.log(`${colors.green}[✓] Tip Tx: ${sentTx.hash}${colors.reset}`);
    
    const receipt = await sentTx.wait();
    if (receipt.status === 1) {
      console.log(`${colors.green}[+] Tip confirmed ✅${colors.reset}`);
      console.log(`${colors.cyan}[↗] Explorer: https://testnet.monad.xyz/tx/${receipt.transactionHash}${colors.reset}`);
    } else {
      console.log(`${colors.red}[✗] Tip failed with status: ${receipt.status}${colors.reset}`);
    }
  } catch (err) {
    console.error(`${colors.red}[✗] Tip variation error: ${err.message}${colors.reset}`);
    
    // Fallback to original successful tip
    console.log(`${colors.yellow}[🔄] Fallback to original successful tip...${colors.reset}`);
    await tipFunction();
  }
};

// Simple tip function with guaranteed success pattern (latest version)
const simpleTipOnly = async () => {
  const methodID = '0x8e57fa5d';
  
  // Use exact latest successful pattern
  const params = [
    '0000000000000000000000000000000000000000000000000000000000000001',
    '0000000000000000000000000000000000000000000000000000000000000000',
    '0000000000000000000000000000000000000000000000000000000000000060',
    '0000000000000000000000000000000000000000000000000000000000000080',
    '00000000000000000000000000000000000000000000000000000000000000c0',
    '00000000000000000000000000000000000000000000000000038d7ea4c68000', // 0.001 PHRS
    '0000000000000000000000000000000000000000000000000000000000000100',
    '000000000000000000000000000000000000000000000000000000000000000e', // length 14
    '676f6f676c65206163636f756e74000000000000000000000000000000000000', // "google account"
    '0000000000000000000000000000000000000000000000000000000000000012', // length 18
    '6a6f6b6f73616e7340676d61696c2e636f6d0000000000000000000000000000', // "jokosant@gmail.com"
    '0000000000000000000000000000000000000000000000000000000000000000'
  ];
  
  const data = methodID + params.join('');
  
  const tx = {
    to: TIP_CONTRACT,
    data,
    gasLimit: 150000,
    maxPriorityFeePerGas: ethers.utils.parseUnits('3', 'gwei'),
    maxFeePerGas: ethers.utils.parseUnits('4', 'gwei'),
    value: ethers.utils.parseEther('0.001'),
  };

  try {
    console.log(`${colors.cyan}[⟳] Simple tip (latest successful pattern)...${colors.reset}`);
    const sentTx = await wallet.sendTransaction(tx);
    console.log(`${colors.green}[✓] Tip Tx: ${sentTx.hash}${colors.reset}`);
    
    const receipt = await sentTx.wait();
    if (receipt.status === 1) {
      console.log(`${colors.green}[+] Tip confirmed ✅${colors.reset}`);
    }
  } catch (err) {
    console.error(`${colors.red}[✗] Simple tip error: ${err.message}${colors.reset}`);
  }
};

const askLoopCount = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`${colors.cyan}Mau tx berapa kali brow? ${colors.reset}`, (answer) => {
      rl.close();
      const loopCount = parseInt(answer);
      if (isNaN(loopCount) || loopCount <= 0) {
        console.log(`${colors.yellow}Input tidak valid, default loop 1${colors.reset}`);
        resolve(1);
      } else {
        resolve(loopCount);
      }
    });
  });
};

// Enhanced main function with latest successful pattern focus
const main = async () => {
  try {
    const balance = await provider.getBalance(wallet.address);
    console.log(`${colors.gray}Balance: ${ethers.utils.formatEther(balance)} PHRS${colors.reset}\n`);
    
    const loopCount = await askLoopCount();
    console.log(`${colors.green}Loop count: ${loopCount}${colors.reset}\n`);

    for (let i = 0; i < loopCount; i++) {
      console.log(`${colors.cyan}=== Loop ke-${i + 1} ===${colors.reset}`);
      
      // Focus on latest proven successful tip patterns (0.001 PHRS + 3 Gwei)
      console.log(`${colors.gray}[1/5] Latest successful tip pattern...${colors.reset}`);
      await tipFunction(); // Latest successful pattern
      await new Promise(r => setTimeout(r, 300));
      console.log(`${colors.gray}[1/5] Latest successful tip pattern...${colors.reset}`);
      await tipFunction(); // Latest successful pattern
      await new Promise(r => setTimeout(r, 300));
      console.log(`${colors.gray}[1/5] Latest successful tip pattern...${colors.reset}`);
      await tipFunction(); // Latest successful pattern
      await new Promise(r => setTimeout(r, 300));
      console.log(`${colors.gray}[1/5] Latest successful tip pattern...${colors.reset}`);
      await tipFunction(); // Latest successful pattern
      await new Promise(r => setTimeout(r, 300));
      console.log(`${colors.gray}[1/5] Latest successful tip pattern...${colors.reset}`);
      await tipFunction(); // Latest successful pattern
      await new Promise(r => setTimeout(r, 300));
      
      
      
      console.log(`${colors.green}[✓] Loop ke-${i + 1} selesai!${colors.reset}\n`);
      
      if (i < loopCount - 1) {
        const delay = Math.floor(Math.random() * 5000) + 3000; // 3-8 seconds
        console.log(`${colors.gray}[⏳] Waiting ${delay/1000}s for next loop...${colors.reset}\n`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
    
    console.log(`${colors.green}🎉 Semua transaksi selesai!${colors.reset}`);
    console.log(`${colors.cyan}📊 Total loops completed: ${loopCount}${colors.reset}`);
    console.log(`${colors.cyan}💰 Total tips sent: ${loopCount * 5} x 0.001 PHRS = ${(loopCount * 5 * 0.001).toFixed(3)} PHRS${colors.reset}`);
    
    // Show final balance
    const finalBalance = await provider.getBalance(wallet.address);
    console.log(`${colors.gray}Final balance: ${ethers.utils.formatEther(finalBalance)} PHRS${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}[✗] Main error: ${error.message}${colors.reset}`);
  }
};

main().catch(console.error);