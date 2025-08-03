require('dotenv').config();
const { ethers } = require('ethers');
const readline = require('readline');

// SEPOLIA TESTNET CONFIG - FROM SUCCESSFUL TX
const RPC_URL = 'https://eth-sepolia.g.alchemy.com/public'; // Replace with your RPC
const CHAIN_ID = 11155111; // Sepolia
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// CONTRACT ADDRESSES - FROM SUCCESSFUL TX
const R2_SWAP_CONTRACT = '0x9e8FF356D35a2Da385C546d6Bf1D77ff85133365'; // Main swap contract
const USDC_ADDRESS = '0x8BEbFCBe5468F146533C182dF3DFbF5ff9BE00E2'; // From transfer logs
const R2USD_ADDRESS = '0x000000000000000000000000000000000000000000'; // Minted token

const provider = new ethers.providers.JsonRpcProvider(RPC_URL, CHAIN_ID);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// SWAP AMOUNTS
const swapAmount = 10; // 10 USDC like successful TX

// Colors for console output
const colors = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

// USDC CONTRACT ABI (for approve)
const USDC_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, wallet);

// R2 SWAP FUNCTION - BASED ON SUCCESSFUL TX: 0x9a5b6563ecebbfac7c25200aa105e71d1752ddb636e1810ff38574837aa03458
const r2Swap = async (amount = swapAmount) => {
  try {
    console.log(`${colors.cyan}[⟳] R2 Swap: ${amount} USDC → R2USD${colors.reset}`);
    
    // Check USDC balance first
    const usdcBalance = await usdcContract.balanceOf(wallet.address);
    const formattedBalance = ethers.utils.formatUnits(usdcBalance, 6); // USDC has 6 decimals
    
    console.log(`${colors.yellow}💰 USDC Balance: ${formattedBalance}${colors.reset}`);
    
    if (parseFloat(formattedBalance) < amount) {
      console.log(`${colors.red}❌ Insufficient USDC! Need ${amount}, have ${formattedBalance}${colors.reset}`);
      return false;
    }
    
    // Check allowance
    const allowance = await usdcContract.allowance(wallet.address, R2_SWAP_CONTRACT);
    const formattedAllowance = ethers.utils.formatUnits(allowance, 6);
    
    console.log(`${colors.gray}🔍 Current allowance: ${formattedAllowance} USDC${colors.reset}`);
    
    if (parseFloat(formattedAllowance) < amount) {
      console.log(`${colors.yellow}⚠️ Need approval first...${colors.reset}`);
      const success = await approveUSDC(amount * 2); // Approve double for future use
      if (!success) {
        console.log(`${colors.red}❌ Approval failed!${colors.reset}`);
        return false;
      }
    }
    
    // EXACT INPUT DATA FROM SUCCESSFUL TX
    const data = '0x095e7a95000000000000000000000000936ef30fb39c71f767da67bf32bf73cb6b61b777000000000000000000000000000000000000000000000000000000000098968000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
    
    // Build dynamic data with actual wallet address and amount
    const amountWei = ethers.utils.parseUnits(amount.toString(), 6); // USDC 6 decimals
    const amountHex = amountWei.toHexString().substring(2).padStart(64, '0'); // 64 chars (32 bytes)
    const walletHex = wallet.address.toLowerCase().substring(2).padStart(64, '0'); // 64 chars
    
    // Dynamic data construction
    const dynamicData = '0x095e7a95' + // function selector
      walletHex + // recipient address (64 chars)
      amountHex + // amount in wei (64 chars)
      '0000000000000000000000000000000000000000000000000000000000000000' + // param 3 (zero)
      '0000000000000000000000000000000000000000000000000000000000000000' + // param 4 (zero)
      '0000000000000000000000000000000000000000000000000000000000000000' + // param 5 (zero)
      '0000000000000000000000000000000000000000000000000000000000000000' + // param 6 (zero)
      '0000000000000000000000000000000000000000000000000000000000000000' + // param 7 (zero)
      '0000000000000000000000000000000000000000000000000000000000000000'; // param 8 (zero)
    
    console.log(`${colors.gray}🔍 Contract: ${R2_SWAP_CONTRACT}${colors.reset}`);
    console.log(`${colors.gray}🔍 Amount Wei: ${amountWei.toString()}${colors.reset}`);
    console.log(`${colors.gray}🔍 Amount Hex: ${amountHex}${colors.reset}`);
    console.log(`${colors.gray}🔍 Wallet Hex: ${walletHex}${colors.reset}`);
    
    const tx = {
      to: R2_SWAP_CONTRACT,
      data: dynamicData,
      gasLimit: 100000, // Higher than successful 81,811
      maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei'), // Higher than successful 1.5
      maxFeePerGas: ethers.utils.parseUnits('5', 'gwei'), // Higher than successful 2.464
      value: 0, // No ETH value
    };
    
    console.log(`${colors.gray}🔍 Gas Limit: ${tx.gasLimit} | Priority: ${ethers.utils.formatUnits(tx.maxPriorityFeePerGas, 'gwei')} Gwei${colors.reset}`);
    
    const sentTx = await wallet.sendTransaction(tx);
    console.log(`${colors.green}[✓] Tx sent: ${sentTx.hash}${colors.reset}`);
    
    const receipt = await sentTx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}[+] R2 Swap SUCCESS! ✅${colors.reset}`);
      console.log(`${colors.gray}⛽ Gas Used: ${receipt.gasUsed.toString()} / ${tx.gasLimit} (${(receipt.gasUsed/tx.gasLimit*100).toFixed(1)}%)${colors.reset}`);
      console.log(`${colors.gray}📦 Block: ${receipt.blockNumber}${colors.reset}`);
      console.log(`${colors.cyan}[↗] Explorer: https://sepolia.etherscan.io/tx/${receipt.transactionHash}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}[✗] R2 Swap FAILED! ❌ (status 0)${colors.reset}`);
      return false;
    }
    
  } catch (err) {
    console.error(`${colors.red}[✗] R2 Swap failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// APPROVE USDC FUNCTION
const approveUSDC = async (amount) => {
  try {
    console.log(`${colors.cyan}🔓 Approving ${amount} USDC...${colors.reset}`);
    
    const amountWei = ethers.utils.parseUnits(amount.toString(), 6);
    
    const tx = await usdcContract.approve(R2_SWAP_CONTRACT, amountWei, {
      gasLimit: 60000,
      maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei'),
      maxFeePerGas: ethers.utils.parseUnits('5', 'gwei')
    });
    
    console.log(`${colors.green}[✓] Approval tx sent: ${tx.hash}${colors.reset}`);
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}[+] USDC Approval SUCCESS! ✅${colors.reset}`);
      console.log(`${colors.gray}⛽ Gas Used: ${receipt.gasUsed.toString()}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}[✗] USDC Approval FAILED! ❌${colors.reset}`);
      return false;
    }
    
  } catch (err) {
    console.error(`${colors.red}[✗] USDC Approval failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// CHECK BALANCES
const checkBalances = async () => {
  try {
    console.log(`${colors.cyan}🔍 CHECKING BALANCES...${colors.reset}`);
    
    // ETH Balance
    const ethBalance = await provider.getBalance(wallet.address);
    const formattedEth = ethers.utils.formatEther(ethBalance);
    console.log(`${colors.yellow}💰 ETH Balance: ${formattedEth}${colors.reset}`);
    
    // USDC Balance
    const usdcBalance = await usdcContract.balanceOf(wallet.address);
    const formattedUsdc = ethers.utils.formatUnits(usdcBalance, 6);
    console.log(`${colors.yellow}💰 USDC Balance: ${formattedUsdc}${colors.reset}`);
    
    // Check allowance
    const allowance = await usdcContract.allowance(wallet.address, R2_SWAP_CONTRACT);
    const formattedAllowance = ethers.utils.formatUnits(allowance, 6);
    console.log(`${colors.yellow}📝 USDC Allowance: ${formattedAllowance}${colors.reset}`);
    
    return {
      eth: parseFloat(formattedEth),
      usdc: parseFloat(formattedUsdc),
      allowance: parseFloat(formattedAllowance)
    };
    
  } catch (err) {
    console.error(`${colors.red}❌ Balance check failed: ${err.message}${colors.reset}`);
    return null;
  }
};

// INTERACTIVE LOOP COUNT
const askLoopCount = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`${colors.cyan}🔁 Berapa kali mau swap R2? ${colors.reset}`, (answer) => {
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

// INTERACTIVE AMOUNT
const askSwapAmount = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`${colors.cyan}💱 Berapa USDC mau di-swap? (default: ${swapAmount}) ${colors.reset}`, (answer) => {
      rl.close();
      const amount = parseFloat(answer);
      if (isNaN(amount) || amount <= 0) {
        console.log(`${colors.yellow}Input tidak valid, menggunakan default ${swapAmount} USDC${colors.reset}`);
        resolve(swapAmount);
      } else {
        resolve(amount);
      }
    });
  });
};

// MASS APPROVE FUNCTION
const massApprove = async (amount) => {
  try {
    console.log(`${colors.cyan}🚀 MASS APPROVE: ${amount} USDC${colors.reset}`);
    
    const amountWei = ethers.utils.parseUnits(amount.toString(), 6);
    
    const tx = await usdcContract.approve(R2_SWAP_CONTRACT, amountWei, {
      gasLimit: 60000,
      maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei'),
      maxFeePerGas: ethers.utils.parseUnits('5', 'gwei')
    });
    
    console.log(`${colors.green}[✓] Mass approval tx: ${tx.hash}${colors.reset}`);
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}✅ Mass Approval SUCCESS!${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}❌ Mass Approval FAILED!${colors.reset}`);
      return false;
    }
    
  } catch (err) {
    console.error(`${colors.red}❌ Mass approve failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// RAPID SWAP MODE
const rapidSwap = async (count, amount) => {
  console.log(`${colors.magenta}🚀 RAPID SWAP MODE: ${count} swaps of ${amount} USDC each${colors.reset}`);
  
  let successCount = 0;
  
  for (let i = 1; i <= count; i++) {
    console.log(`${colors.cyan}\n[${i}/${count}] R2 Rapid Swap...${colors.reset}`);
    
    const success = await r2Swap(amount);
    if (success) {
      successCount++;
    }
    
    console.log(`${colors.yellow}📊 Progress: ${successCount}/${i} success (${(successCount/i*100).toFixed(1)}%)${colors.reset}`);
    
    // Random delay (1-3 seconds)
    if (i < count) {
      const delay = 1000 + Math.random() * 2000;
      console.log(`${colors.gray}⏳ Waiting ${(delay/1000).toFixed(1)}s...${colors.reset}`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  
  console.log(`\n${colors.green}🎉 RAPID SWAP COMPLETED!${colors.reset}`);
  console.log(`${colors.green}✅ Final Success Rate: ${successCount}/${count} (${(successCount/count*100).toFixed(1)}%)${colors.reset}`);
  
  return successCount;
};

// MAIN FUNCTION
const main = async () => {
  console.log(`${colors.cyan}🚀 R2 SWAP BOT (SEPOLIA TESTNET)${colors.reset}`);
  console.log(`${colors.gray}Wallet: ${wallet.address}${colors.reset}`);
  console.log(`${colors.gray}Network: Sepolia Testnet (${CHAIN_ID})${colors.reset}`);
  console.log(`${colors.gray}R2 Contract: ${R2_SWAP_CONTRACT}${colors.reset}\n`);
  
  const args = process.argv.slice(2);
  
  if (args[0] === 'balance') {
    await checkBalances();
    return;
  }
  
  if (args[0] === 'approve') {
    const amount = parseFloat(args[1]) || 1000;
    await massApprove(amount);
    return;
  }
  
  if (args[0] === 'single') {
    const amount = parseFloat(args[1]) || swapAmount;
    await r2Swap(amount);
    return;
  }
  
  if (args[0] === 'rapid') {
    const count = parseInt(args[1]) || 10;
    const amount = parseFloat(args[2]) || swapAmount;
    await rapidSwap(count, amount);
    return;
  }
  
  // Interactive mode
  const balances = await checkBalances();
  if (!balances) {
    console.log(`${colors.red}❌ Cannot check balances! Check RPC connection.${colors.reset}`);
    return;
  }
  
  if (balances.eth < 0.01) {
    console.log(`${colors.red}❌ Low ETH balance! Need at least 0.01 ETH for gas.${colors.reset}`);
    return;
  }
  
  if (balances.usdc < swapAmount) {
    console.log(`${colors.red}❌ Insufficient USDC! Need at least ${swapAmount} USDC.${colors.reset}`);
    return;
  }
  
  const amount = await askSwapAmount();
  const loopCount = await askLoopCount();
  
  console.log(`${colors.green}✅ Configuration:${colors.reset}`);
  console.log(`${colors.gray}   Amount per swap: ${amount} USDC${colors.reset}`);
  console.log(`${colors.gray}   Number of swaps: ${loopCount}${colors.reset}`);
  console.log(`${colors.gray}   Total USDC needed: ${amount * loopCount}${colors.reset}\n`);
  
  if (balances.usdc < (amount * loopCount)) {
    console.log(`${colors.red}❌ Insufficient USDC for all swaps!${colors.reset}`);
    return;
  }
  
  // Auto-approve if needed
  if (balances.allowance < (amount * loopCount)) {
    console.log(`${colors.yellow}⚠️ Need approval for ${amount * loopCount} USDC...${colors.reset}`);
    const approveSuccess = await massApprove(amount * loopCount * 2); // Approve double
    if (!approveSuccess) {
      console.log(`${colors.red}❌ Approval failed! Cannot continue.${colors.reset}`);
      return;
    }
  }
  
  await rapidSwap(loopCount, amount);
  
  // Final balance check
  console.log(`\n${colors.cyan}🔍 FINAL BALANCES:${colors.reset}`);
  await checkBalances();
};

// Show help if no args
if (process.argv.length === 2) {
  console.log(`
${colors.cyan}🚀 R2 SWAP BOT COMMANDS:${colors.reset}

${colors.green}📊 INFORMATION:${colors.reset}
node r2swap.js balance                    - Check ETH, USDC balances & allowance

${colors.green}🔓 APPROVAL:${colors.reset}
node r2swap.js approve 1000              - Approve 1000 USDC for swapping

${colors.green}💱 SINGLE SWAP:${colors.reset}
node r2swap.js single 10                 - Single swap: 10 USDC → R2USD

${colors.green}🚀 RAPID SWAPS:${colors.reset}
node r2swap.js rapid 20 5                - Rapid: 20 swaps of 5 USDC each
node r2swap.js rapid 50                  - Rapid: 50 swaps of default amount

${colors.green}🎮 INTERACTIVE MODE:${colors.reset}
node r2swap.js                           - Interactive mode (guided setup)

${colors.cyan}📋 REQUIREMENTS:${colors.reset}
${colors.gray}✅ Sepolia ETH for gas fees${colors.reset}
${colors.gray}✅ USDC tokens on Sepolia${colors.reset}
${colors.gray}✅ Valid RPC endpoint (Infura/Alchemy)${colors.reset}
  `);
} else {
  main().catch(console.error);
}