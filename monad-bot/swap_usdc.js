require('dotenv').config();
const { ethers } = require('ethers');
const readline = require('readline');

// UPDATED CONTRACT ADDRESSES BASED ON SUCCESSFUL TX
const CONTRACT_ADDRESS = '0xD3AF145f1Aa1A471b5f0F62c52Cf8fcdc9AB55D3'; // Main swap contract
const CONTRACT_ADDRESS_SMON = '0x06243d3f4be67c40a75CFd4f23D27dA6fD81924c';
const CONTRACT_ADDRESS_WBTC = '0xa824fa44346e3591ec84577cFfBe0730B83C51D9';
const CONTRACT_ADDRESS_BEAN = '0x94a82E5e8AaDA853Dd38d357058742897eE35d15';
const CONTRACT_ADDRESS_DAK = '0x94B72620e65577De5FB2b8a8B93328CAf6Ca161b';
const CONTRACT_ADDRESS_FBC = '0x81Fd0E189B86174147e0fC506Dc55B5C5FaEB6D7';
const CONTRACT_ADDRESS_KUR = '0xE65696A6918C25C09FbC5ae195d25CE29e4e9c8d';

// NETWORK CONFIG - UPDATED TO MATCH SUCCESSFUL TX
const RPC_URL = 'https://rpc.ankr.com/monad_testnet';
const CHAIN_ID = 10143;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const provider = new ethers.providers.JsonRpcProvider(RPC_URL, CHAIN_ID);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// UPDATED AMOUNTS BASED ON SUCCESSFUL TX
const swapAmount = '0.0001'; // Successful amount from TX
const sMonAmount = '0.0001';  // Updated to match successful pattern
const dakAmount = '0.0001';   // Updated to match successful pattern

// Colors for console output
const colors = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
  reset: '\x1b[0m'
};

// MAIN SWAP FUNCTION - BASED ON SUCCESSFUL TX: 0x91dc2f9fe6d8242c791b686cc10ed2d122b71d8b1ef1c0cbb51b8bbf7014574f
const swapMonadToUsdc = async () => {
  // EXACT INPUT DATA FROM SUCCESSFUL TX
  const data = '0x532c46db00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000012700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001';
  
  const tx = {
    to: CONTRACT_ADDRESS, // 0xD3AF145f1Aa1A471b5f0F62c52Cf8fcdc9AB55D3
    data,
    gasLimit: 300000, // INCREASED! Original used 245,267
    maxPriorityFeePerGas: ethers.utils.parseUnits('15', 'gwei'), // INCREASED
    maxFeePerGas: ethers.utils.parseUnits('70', 'gwei'), // INCREASED
    value: ethers.utils.parseEther(swapAmount), // 0.0001 MON like successful TX
  };

  try {
    console.log(`${colors.cyan}[⟳] Swapping MONAD → USDC: ${swapAmount} MON${colors.reset}`);
    console.log(`${colors.gray}🔍 Contract: ${CONTRACT_ADDRESS}${colors.reset}`);
    console.log(`${colors.gray}🔍 Gas Limit: ${tx.gasLimit} | Priority: ${ethers.utils.formatUnits(tx.maxPriorityFeePerGas, 'gwei')} Gwei${colors.reset}`);
    
    const sentTx = await wallet.sendTransaction(tx);
    console.log(`${colors.green}[✓] Tx sent: ${sentTx.hash}${colors.reset}`);
    
    const receipt = await sentTx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}[+] Tx confirmed ✅${colors.reset}`);
      console.log(`${colors.gray}⛽ Gas Used: ${receipt.gasUsed.toString()} | Block: ${receipt.blockNumber}${colors.reset}`);
      console.log(`${colors.cyan}[↗] Explorer: https://testnet.monadexplorer.com/tx/${receipt.transactionHash}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}[✗] Tx reverted ❌ (status 0)${colors.reset}`);
      return false;
    }
  } catch (err) {
    console.error(`${colors.red}[✗] swapMonadToUsdc failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// FIXED USDC TO MONAD SWAP - SHORTENED DATA
const swapUsdcToMonad = async () => {
  // FIXED: Shortened data to avoid RLP error
  const data = '0x7c51d6cf00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000012700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001';
  
  const tx = {
    to: CONTRACT_ADDRESS,
    data,
    gasLimit: 300000, // INCREASED
    maxPriorityFeePerGas: ethers.utils.parseUnits('15', 'gwei'),
    maxFeePerGas: ethers.utils.parseUnits('70', 'gwei'),
    value: 0, // No MON value for USDC->MON swap
  };

  try {
    console.log(`${colors.cyan}[⟳] Swapping USDC → MONAD...${colors.reset}`);
    const sentTx = await wallet.sendTransaction(tx);
    console.log(`${colors.green}[✓] Tx sent: ${sentTx.hash}${colors.reset}`);
    
    const receipt = await sentTx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}[+] Tx confirmed ✅${colors.reset}`);
      console.log(`${colors.gray}⛽ Gas Used: ${receipt.gasUsed.toString()}${colors.reset}`);
      console.log(`${colors.cyan}[↗] Explorer: https://testnet.monadexplorer.com/tx/${receipt.transactionHash}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}[✗] Tx reverted ❌${colors.reset}`);
      return false;
    }
  } catch (err) {
    console.error(`${colors.red}[✗] swapUsdcToMonad failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// SIMPLIFIED OTHER SWAP FUNCTIONS - USING SUCCESSFUL PATTERN
const swapMonadToSmon = async () => {
  // SIMPLIFIED DATA - SAME PATTERN AS SUCCESSFUL TX
  const data = '0x532c46db00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000012700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001';
  
  const tx = {
    to: CONTRACT_ADDRESS_SMON,
    data,
    gasLimit: 300000, // INCREASED
    maxPriorityFeePerGas: ethers.utils.parseUnits('15', 'gwei'),
    maxFeePerGas: ethers.utils.parseUnits('70', 'gwei'),
    value: ethers.utils.parseEther(sMonAmount),
  };

  try {
    console.log(`${colors.cyan}[⟳] Swapping MONAD → SMON: ${sMonAmount} MON${colors.reset}`);
    const sentTx = await wallet.sendTransaction(tx);
    const receipt = await sentTx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}[✓] Tx sent: ${sentTx.hash}${colors.reset}`);
      console.log(`${colors.green}[+] Tx confirmed ✅${colors.reset}`);
      console.log(`${colors.cyan}[↗] Explorer: https://testnet.monadexplorer.com/tx/${receipt.transactionHash}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}[✗] Tx reverted ❌${colors.reset}`);
      return false;
    }
  } catch (err) {
    console.error(`${colors.red}[✗] swapMonadToSmon failed: ${err.message}${colors.reset}`);
    return false;
  }
};

const swapMonadToWbtc = async () => {
  const data = '0x532c46db00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000012700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001';
  
  const tx = {
    to: CONTRACT_ADDRESS_WBTC,
    data,
    gasLimit: 300000,
    maxPriorityFeePerGas: ethers.utils.parseUnits('15', 'gwei'),
    maxFeePerGas: ethers.utils.parseUnits('70', 'gwei'),
    value: ethers.utils.parseEther(sMonAmount),
  };

  try {
    console.log(`${colors.cyan}[⟳] Swapping MONAD → WBTC: ${sMonAmount} MON${colors.reset}`);
    const sentTx = await wallet.sendTransaction(tx);
    const receipt = await sentTx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}[✓] Tx sent: ${sentTx.hash}${colors.reset}`);
      console.log(`${colors.green}[+] Tx confirmed ✅${colors.reset}`);
      console.log(`${colors.cyan}[↗] Explorer: https://testnet.monadexplorer.com/tx/${receipt.transactionHash}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}[✗] Tx reverted ❌${colors.reset}`);
      return false;
    }
  } catch (err) {
    console.error(`${colors.red}[✗] swapMonadToWbtc failed: ${err.message}${colors.reset}`);
    return false;
  }
};

const swapMonadToBean = async () => {
  const data = '0x532c46db00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000012700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001';
  
  const tx = {
    to: CONTRACT_ADDRESS_BEAN,
    data,
    gasLimit: 300000,
    maxPriorityFeePerGas: ethers.utils.parseUnits('15', 'gwei'),
    maxFeePerGas: ethers.utils.parseUnits('70', 'gwei'),
    value: ethers.utils.parseEther(sMonAmount),
  };

  try {
    console.log(`${colors.cyan}[⟳] Swapping MONAD → BEAN: ${sMonAmount} MON${colors.reset}`);
    const sentTx = await wallet.sendTransaction(tx);
    const receipt = await sentTx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}[✓] Tx sent: ${sentTx.hash}${colors.reset}`);
      console.log(`${colors.green}[+] Tx confirmed ✅${colors.reset}`);
      console.log(`${colors.cyan}[↗] Explorer: https://testnet.monadexplorer.com/tx/${receipt.transactionHash}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}[✗] Tx reverted ❌${colors.reset}`);
      return false;
    }
  } catch (err) {
    console.error(`${colors.red}[✗] swapMonadToBean failed: ${err.message}${colors.reset}`);
    return false;
  }
};

const swapMonadToDak = async () => {
  const data = '0x532c46db00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000012700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001';
  
  const tx = {
    to: CONTRACT_ADDRESS_DAK,
    data,
    gasLimit: 300000,
    maxPriorityFeePerGas: ethers.utils.parseUnits('15', 'gwei'),
    maxFeePerGas: ethers.utils.parseUnits('70', 'gwei'),
    value: ethers.utils.parseEther(sMonAmount),
  };

  try {
    console.log(`${colors.cyan}[⟳] Swapping MONAD → DAK: ${sMonAmount} MON${colors.reset}`);
    const sentTx = await wallet.sendTransaction(tx);
    const receipt = await sentTx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}[✓] Tx sent: ${sentTx.hash}${colors.reset}`);
      console.log(`${colors.green}[+] Tx confirmed ✅${colors.reset}`);
      console.log(`${colors.cyan}[↗] Explorer: https://testnet.monadexplorer.com/tx/${receipt.transactionHash}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}[✗] Tx reverted ❌${colors.reset}`);
      return false;
    }
  } catch (err) {
    console.error(`${colors.red}[✗] swapMonadToDak failed: ${err.message}${colors.reset}`);
    return false;
  }
};

const swapMonadToFbc = async () => {
  const data = '0x532c46db00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000012700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001';
  
  const tx = {
    to: CONTRACT_ADDRESS_FBC,
    data,
    gasLimit: 300000,
    maxPriorityFeePerGas: ethers.utils.parseUnits('15', 'gwei'),
    maxFeePerGas: ethers.utils.parseUnits('70', 'gwei'),
    value: ethers.utils.parseEther(sMonAmount),
  };

  try {
    console.log(`${colors.cyan}[⟳] Swapping MONAD → FBC: ${sMonAmount} MON${colors.reset}`);
    const sentTx = await wallet.sendTransaction(tx);
    const receipt = await sentTx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}[✓] Tx sent: ${sentTx.hash}${colors.reset}`);
      console.log(`${colors.green}[+] Tx confirmed ✅${colors.reset}`);
      console.log(`${colors.cyan}[↗] Explorer: https://testnet.monadexplorer.com/tx/${receipt.transactionHash}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}[✗] Tx reverted ❌${colors.reset}`);
      return false;
    }
  } catch (err) {
    console.error(`${colors.red}[✗] swapMonadToFbc failed: ${err.message}${colors.reset}`);
    return false;
  }
};

const swapMonToKur = async () => {
  const data = '0x532c46db00000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000012700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001';
  
  const tx = {
    to: CONTRACT_ADDRESS_KUR,
    data,
    gasLimit: 300000,
    maxPriorityFeePerGas: ethers.utils.parseUnits('15', 'gwei'),
    maxFeePerGas: ethers.utils.parseUnits('70', 'gwei'),
    value: ethers.utils.parseEther(dakAmount),
  };

  try {
    console.log(`${colors.cyan}[⟳] Swapping MONAD → KURU: ${dakAmount} MON${colors.reset}`);
    const sentTx = await wallet.sendTransaction(tx);
    const receipt = await sentTx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}[✓] Tx sent: ${sentTx.hash}${colors.reset}`);
      console.log(`${colors.green}[+] Tx confirmed ✅${colors.reset}`);
      console.log(`${colors.cyan}[↗] Explorer: https://testnet.monadexplorer.com/tx/${receipt.transactionHash}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}[✗] Tx reverted ❌${colors.reset}`);
      return false;
    }
  } catch (err) {
    console.error(`${colors.red}[✗] swapMonToKur failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// BALANCE CHECK FUNCTION
const checkBalance = async () => {
  try {
    const balance = await provider.getBalance(wallet.address);
    const formattedBalance = ethers.utils.formatEther(balance);
    console.log(`${colors.yellow}💰 Current MON Balance: ${formattedBalance}${colors.reset}`);
    
    const minRequired = parseFloat(swapAmount) * 8; // 8 swaps total
    if (parseFloat(formattedBalance) < minRequired) {
      console.log(`${colors.red}⚠️ Low balance! Need at least ${minRequired} MON for full cycle.${colors.reset}`);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error(`${colors.red}❌ Balance check failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// INTERACTIVE LOOP COUNT
const askLoopCount = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`${colors.cyan}🔁 Mau tx berapa kali brow? ${colors.reset}`, (answer) => {
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

// MAIN FUNCTION WITH UPDATED SUCCESS PATTERN
const main = async () => {
  console.log(`${colors.cyan}🚀 MONAD TESTNET SWAP BOT (FIXED)${colors.reset}`);
  console.log(`${colors.gray}Wallet: ${wallet.address}${colors.reset}`);
  console.log(`${colors.gray}Network: Monad Testnet (${CHAIN_ID})${colors.reset}\n`);
  
  // Check balance first
  const hasBalance = await checkBalance();
  if (!hasBalance) {
    console.log(`${colors.red}❌ Insufficient balance! Please add more MON.${colors.reset}`);
    return;
  }
  
  const loopCount = await askLoopCount();
  console.log(`${colors.green}Loop count: ${loopCount}${colors.reset}\n`);

  let successCount = 0;
  let totalTx = 0;

  for (let i = 0; i < loopCount; i++) {
    console.log(`${colors.cyan}\n=== Loop ke-${i + 1}/${loopCount} ===${colors.reset}`);
    
    // ONLY USE WORKING SWAPS (MONAD→USDC pattern)
    const swapFunctions = [
      { name: 'MONAD→USDC', func: swapMonadToUsdc },
    ];
    
    for (const swap of swapFunctions) {
      totalTx++;
      console.log(`${colors.gray}[${totalTx}] ${swap.name}...${colors.reset}`);
      
      const success = await swap.func();
      if (success) {
        successCount++;
      }
      
      // Random delay between swaps (2-4 seconds)
      const delay = 2000 + Math.random() * 2000;
      await new Promise(r => setTimeout(r, delay));
    }
    
    console.log(`${colors.green}[✓] Loop ke-${i + 1} selesai!${colors.reset}`);
    console.log(`${colors.yellow}📊 Success Rate: ${successCount}/${totalTx} (${(successCount/totalTx*100).toFixed(1)}%)${colors.reset}`);
    
    // Delay between loops (5-8 seconds)
    if (i < loopCount - 1) {
      const loopDelay = 5000 + Math.random() * 3000;
      console.log(`${colors.gray}⏳ Waiting ${(loopDelay/1000).toFixed(1)}s before next loop...${colors.reset}`);
      await new Promise(r => setTimeout(r, loopDelay));
    }
  }
  
  console.log(`\n${colors.cyan}🎉 ALL LOOPS COMPLETED!${colors.reset}`);
  console.log(`${colors.green}✅ Final Success Rate: ${successCount}/${totalTx} (${(successCount/totalTx*100).toFixed(1)}%)${colors.reset}`);
  
  // Final balance check
  await checkBalance();
};

main().catch(console.error);