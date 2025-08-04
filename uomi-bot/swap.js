require('dotenv').config();
const { ethers } = require('ethers');
const readline = require('readline');

// UOMI TESTNET CONFIG - FROM SUCCESSFUL TX
const RPC_URL = 'https://finney.uomi.ai'; // UOMI Testnet RPC
const CHAIN_ID = 4386; // UOMI Testnet Chain ID
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// CONTRACT ADDRESSES - CORRECTED FROM SUCCESSFUL TX: 0x54228357afd56d6dee1bbc63ae399a3bc98db42732b68bc57e2795194fe423b5
const UNIVERSAL_ROUTER = '0x197EEAd5Fe3DB82c4Cd55C5752Bc87AEdE11f230'; // CORRECT UniversalRouter from successful TX!
const WUOMI_ADDRESS = '0x5FCa78E132dF589c1c799F906dC867124a2567b2'; // WUOMI token
const SYN_ADDRESS = '0x2922B2Ca5EB6b02fc5E1EBE57Fc1972eBB99F7e0'; // SYN token

const provider = new ethers.providers.JsonRpcProvider(RPC_URL, CHAIN_ID);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// DEFAULT SWAP AMOUNTS - FROM SUCCESSFUL TX
const defaultUomiAmount = 0.1; // 0.1 UOMI (native token)
const defaultSlippage = 5; // 5% slippage tolerance

// Colors for console output
const colors = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// TOKEN ABI
const TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)"
];

const wuomiContract = new ethers.Contract(WUOMI_ADDRESS, TOKEN_ABI, wallet);
const synContract = new ethers.Contract(SYN_ADDRESS, TOKEN_ABI, wallet);

// EXACT COPY OF SUCCESSFUL TX - ONLY DEADLINE CHANGES
const uomiSwapExact = async () => {
  try {
    console.log(`${colors.cyan}[⟳] EXACT UOMI SWAP (copying successful TX)${colors.reset}`);
    console.log(`${colors.gray}   📍 Using CORRECT router: ${UNIVERSAL_ROUTER}${colors.reset}`);
    
    // Check balance first
    const uomiBalance = await provider.getBalance(wallet.address);
    const formattedUomiBalance = ethers.utils.formatEther(uomiBalance);
    console.log(`${colors.yellow}   💰 UOMI Balance: ${formattedUomiBalance}${colors.reset}`);
    
    if (parseFloat(formattedUomiBalance) < 0.11) {
      console.log(`${colors.red}   ❌ Need at least 0.11 UOMI!${colors.reset}`);
      return false;
    }
    
    const deadline = Math.floor(Date.now() / 1000) + 1200;
    const deadlineHex = ethers.BigNumber.from(deadline).toHexString().substring(2).padStart(64, '0');
    
    console.log(`${colors.gray}   🔍 New deadline: ${deadline} (${deadlineHex})${colors.reset}`);
    
    // EXACT RAW INPUT FROM SUCCESSFUL TX (only deadline changed)
    const txData = '0x3593564c' +
      '0000000000000000000000000000000000000000000000000000000000000060' +
      '00000000000000000000000000000000000000000000000000000000000000a0' +
      deadlineHex + // Only this changes from original: 688f63e3
      '0000000000000000000000000000000000000000000000000000000000000002' +
      '0b00000000000000000000000000000000000000000000000000000000000000' +
      '0000000000000000000000000000000000000000000000000000000000000002' +
      '0000000000000000000000000000000000000000000000000000000000000040' +
      '00000000000000000000000000000000000000000000000000000000000000a0' +
      '0000000000000000000000000000000000000000000000000000000000000040' +
      '0000000000000000000000000000000000000000000000000000000000000002' +
      '000000000000000000000000000000000000000000000000016345785d8a0000' +
      '0000000000000000000000000000000000000000000000000000000000000100' +
      '0000000000000000000000000000000000000000000000000000000000000001' +
      '000000000000000000000000000000000000000000000000016345785d8a0000' +
      '000000000000000000000000000000000000000000000000009c5210daa84b7e' +
      '00000000000000000000000000000000000000000000000000000000000000a0' +
      '0000000000000000000000000000000000000000000000000000000000000000' +
      '000000000000000000000000000000000000000000000000000000000000002b' +
      '5fca78e132df589c1c799f906dc867124a2567b2000bb82922b2ca5eb6b02fc5e1ebe57fc1972ebb99f7e0000000000000000000000000000000000000000000';
    
    console.log(`${colors.gray}   🔍 Using EXACT successful TX data${colors.reset}`);
    console.log(`${colors.gray}   🔍 Data length: ${txData.length} chars${colors.reset}`);
    
    const tx = {
      to: UNIVERSAL_ROUTER, // NOW USING CORRECT ADDRESS!
      data: txData,
      value: ethers.utils.parseEther('0.1'), // Exact same as successful TX
      gasLimit: 301560, // Exact same as successful TX
      maxPriorityFeePerGas: ethers.utils.parseUnits('6.8496', 'gwei'), // Exact same
      maxFeePerGas: ethers.utils.parseUnits('41.0976', 'gwei'), // Exact same
    };
    
    console.log(`${colors.green}   ✅ Using EXACT same parameters as successful TX${colors.reset}`);
    console.log(`${colors.gray}   🔍 Gas Limit: ${tx.gasLimit}${colors.reset}`);
    console.log(`${colors.gray}   🔍 Priority Fee: ${ethers.utils.formatUnits(tx.maxPriorityFeePerGas, 'gwei')} Gwei${colors.reset}`);
    console.log(`${colors.gray}   🔍 Max Fee: ${ethers.utils.formatUnits(tx.maxFeePerGas, 'gwei')} Gwei${colors.reset}`);
    
    const sentTx = await wallet.sendTransaction(tx);
    console.log(`${colors.green}   ✅ Tx sent: ${sentTx.hash}${colors.reset}`);
    
    const receipt = await sentTx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}   🎉 EXACT UOMI SWAP SUCCESS! ✅${colors.reset}`);
      console.log(`${colors.gray}   ⛽ Gas Used: ${receipt.gasUsed.toString()}${colors.reset}`);
      console.log(`${colors.gray}   📦 Block: ${receipt.blockNumber}${colors.reset}`);
      console.log(`${colors.cyan}   🔗 Explorer: https://explorer.uomi.ai/tx/${receipt.transactionHash}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}   ❌ EXACT COPY ALSO FAILED! Status: ${receipt.status}${colors.reset}`);
      console.log(`${colors.red}   🔍 Gas Used: ${receipt.gasUsed.toString()}${colors.reset}`);
      return false;
    }
    
  } catch (err) {
    console.error(`${colors.red}   ❌ Exact swap error: ${err.message}${colors.reset}`);
    return false;
  }
};

// FLEXIBLE AMOUNT SWAP WITH CORRECT ROUTER
const uomiSwap = async (uomiAmount = defaultUomiAmount) => {
  try {
    console.log(`${colors.cyan}[⟳] UOMI SWAP: ${uomiAmount} UOMI → SYN${colors.reset}`);
    console.log(`${colors.gray}   👤 ${wallet.address}${colors.reset}`);
    console.log(`${colors.gray}   📍 Router: ${UNIVERSAL_ROUTER}${colors.reset}`);
    
    // Check UOMI balance (native token)
    const uomiBalance = await provider.getBalance(wallet.address);
    const formattedUomiBalance = ethers.utils.formatEther(uomiBalance);
    
    console.log(`${colors.yellow}   💰 UOMI Balance: ${formattedUomiBalance}${colors.reset}`);
    
    if (parseFloat(formattedUomiBalance) < (uomiAmount + 0.01)) { // Reserve 0.01 for gas
      console.log(`${colors.red}   ❌ Insufficient UOMI! Need ${uomiAmount + 0.01}, have ${formattedUomiBalance}${colors.reset}`);
      return false;
    }
    
    const uomiAmountWei = ethers.utils.parseEther(uomiAmount.toString());
    const deadline = Math.floor(Date.now() / 1000) + 1200;
    
    // Calculate minimum output (successful TX had: 9c5210daa84b7e which is ~0.045602049102392833)
    // This suggests ~45.6% output for 0.1 input, so let's use 40% minimum for safety
    const minOutput = uomiAmountWei.mul(40).div(100); // 40% of input (60% slippage tolerance)
    
    console.log(`${colors.gray}   🔍 UOMI Amount Wei: ${uomiAmountWei.toString()}${colors.reset}`);
    console.log(`${colors.gray}   🔍 Min Output Wei: ${minOutput.toString()}${colors.reset}`);
    console.log(`${colors.gray}   🔍 Deadline: ${deadline}${colors.reset}`);
    
    const amountHex = uomiAmountWei.toHexString().substring(2).padStart(64, '0');
    const deadlineHex = ethers.BigNumber.from(deadline).toHexString().substring(2).padStart(64, '0');
    const minOutputHex = minOutput.toHexString().substring(2).padStart(64, '0');
    
    console.log(`${colors.yellow}   🎯 Using 60% slippage tolerance (40% min output)${colors.reset}`);
    
    // TRANSACTION DATA BASED ON SUCCESSFUL TX PATTERN
    const txData = '0x3593564c' +
      '0000000000000000000000000000000000000000000000000000000000000060' +
      '00000000000000000000000000000000000000000000000000000000000000a0' +
      deadlineHex +
      '0000000000000000000000000000000000000000000000000000000000000002' +
      '0b00000000000000000000000000000000000000000000000000000000000000' +
      '0000000000000000000000000000000000000000000000000000000000000002' +
      '0000000000000000000000000000000000000000000000000000000000000040' +
      '00000000000000000000000000000000000000000000000000000000000000a0' +
      '0000000000000000000000000000000000000000000000000000000000000040' +
      '0000000000000000000000000000000000000000000000000000000000000002' +
      amountHex +
      '0000000000000000000000000000000000000000000000000000000000000100' +
      '0000000000000000000000000000000000000000000000000000000000000001' +
      amountHex +
      minOutputHex +
      '00000000000000000000000000000000000000000000000000000000000000a0' +
      '0000000000000000000000000000000000000000000000000000000000000000' +
      '000000000000000000000000000000000000000000000000000000000000002b' +
      '5fca78e132df589c1c799f906dc867124a2567b2000bb82922b2ca5eb6b02fc5e1ebe57fc1972ebb99f7e0000000000000000000000000000000000000000000';
    
    const tx = {
      to: UNIVERSAL_ROUTER, // CORRECT ADDRESS NOW!
      data: txData,
      value: uomiAmountWei,
      gasLimit: 350000, // Higher than successful for safety
      maxPriorityFeePerGas: ethers.utils.parseUnits('6.8496', 'gwei'), // Same as successful
      maxFeePerGas: ethers.utils.parseUnits('41.0976', 'gwei'), // Same as successful
    };
    
    console.log(`${colors.gray}   🔍 Gas Limit: ${tx.gasLimit} | Priority: ${ethers.utils.formatUnits(tx.maxPriorityFeePerGas, 'gwei')} Gwei${colors.reset}`);
    
    const sentTx = await wallet.sendTransaction(tx);
    console.log(`${colors.green}   ✅ Tx sent: ${sentTx.hash}${colors.reset}`);
    
    const receipt = await sentTx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}   🎉 UOMI SWAP SUCCESS! ✅${colors.reset}`);
      console.log(`${colors.gray}   ⛽ Gas Used: ${receipt.gasUsed.toString()} / ${tx.gasLimit} (${(receipt.gasUsed/tx.gasLimit*100).toFixed(1)}%)${colors.reset}`);
      console.log(`${colors.gray}   📦 Block: ${receipt.blockNumber}${colors.reset}`);
      console.log(`${colors.cyan}   🔗 Explorer: https://explorer.uomi.ai/tx/${receipt.transactionHash}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}   ❌ UOMI SWAP FAILED! (status 0)${colors.reset}`);
      console.log(`${colors.red}   🔍 Gas Used: ${receipt.gasUsed.toString()}${colors.reset}`);
      return false;
    }
    
  } catch (err) {
    console.error(`${colors.red}   ❌ UOMI Swap error: ${err.message}${colors.reset}`);
    return false;
  }
};

// CHECK BALANCES
const checkBalances = async () => {
  try {
    console.log(`${colors.cyan}🔍 CHECKING BALANCES...${colors.reset}`);
    
    // UOMI Balance (native token)
    const uomiBalance = await provider.getBalance(wallet.address);
    const formattedUomi = ethers.utils.formatEther(uomiBalance);
    console.log(`${colors.yellow}💰 UOMI Balance: ${formattedUomi}${colors.reset}`);
    
    // WUOMI Balance
    try {
      const wuomiBalance = await wuomiContract.balanceOf(wallet.address);
      const formattedWuomi = ethers.utils.formatEther(wuomiBalance);
      console.log(`${colors.yellow}💰 WUOMI Balance: ${formattedWuomi}${colors.reset}`);
    } catch (err) {
      console.log(`${colors.gray}💰 WUOMI Balance: 0 (or contract error)${colors.reset}`);
    }
    
    // SYN Balance
    try {
      const synBalance = await synContract.balanceOf(wallet.address);
      const formattedSyn = ethers.utils.formatEther(synBalance);
      console.log(`${colors.yellow}💰 SYN Balance: ${formattedSyn}${colors.reset}`);
    } catch (err) {
      console.log(`${colors.gray}💰 SYN Balance: 0 (or contract error)${colors.reset}`);
    }
    
    return {
      uomi: parseFloat(formattedUomi)
    };
    
  } catch (err) {
    console.error(`${colors.red}❌ Balance check failed: ${err.message}${colors.reset}`);
    return null;
  }
};

// RAPID SWAP MODE
const rapidSwap = async (count, uomiAmount) => {
  console.log(`${colors.magenta}🚀 RAPID UOMI SWAP MODE: ${count} swaps${colors.reset}`);
  console.log(`${colors.gray}⟳ Each swap: ${uomiAmount} UOMI → SYN${colors.reset}`);
  console.log(`${colors.gray}📍 Router: ${UNIVERSAL_ROUTER}${colors.reset}\n`);
  
  let successCount = 0;
  let totalGasUsed = ethers.BigNumber.from(0);
  const startTime = Date.now();
  
  // Check initial balance
  const initialBalance = await provider.getBalance(wallet.address);
  console.log(`${colors.yellow}💰 Initial UOMI Balance: ${ethers.utils.formatEther(initialBalance)}${colors.reset}\n`);
  
  for (let i = 1; i <= count; i++) {
    const swapStartTime = Date.now();
    console.log(`${colors.cyan}[${i}/${count}] UOMI Swap #${i}...${colors.reset}`);
    
    // Check if we have enough balance for this swap + gas
    const currentBalance = await provider.getBalance(wallet.address);
    const neededAmount = ethers.utils.parseEther((uomiAmount + 0.01).toString()); // Amount + gas reserve
    
    if (currentBalance.lt(neededAmount)) {
      console.log(`${colors.red}   ❌ Insufficient balance! Need ${ethers.utils.formatEther(neededAmount)}, have ${ethers.utils.formatEther(currentBalance)}${colors.reset}`);
      break;
    }
    
    try {
      const success = await uomiSwap(uomiAmount);
      
      if (success) {
        successCount++;
        console.log(`${colors.green}   ✅ Swap #${i} SUCCESS!${colors.reset}`);
        
        // Get gas used from last transaction
        const latestBlock = await provider.getBlockNumber();
        const block = await provider.getBlockWithTransactions(latestBlock);
        const lastTx = block.transactions.find(tx => tx.from.toLowerCase() === wallet.address.toLowerCase());
        
        if (lastTx) {
          const receipt = await provider.getTransactionReceipt(lastTx.hash);
          totalGasUsed = totalGasUsed.add(receipt.gasUsed);
          console.log(`${colors.gray}   ⛽ Gas Used: ${receipt.gasUsed.toString()}${colors.reset}`);
        }
        
      } else {
        console.log(`${colors.red}   ❌ Swap #${i} FAILED!${colors.reset}`);
      }
      
    } catch (err) {
      console.log(`${colors.red}   ❌ Swap #${i} ERROR: ${err.message}${colors.reset}`);
    }
    
    const swapTime = ((Date.now() - swapStartTime) / 1000).toFixed(2);
    const successRate = (successCount / i * 100).toFixed(1);
    
    console.log(`${colors.yellow}📊 Progress: ${successCount}/${i} success (${successRate}%) | Time: ${swapTime}s${colors.reset}`);
    
    // Random delay between swaps (2-6 seconds)
    if (i < count) {
      const delay = 2000 + Math.random() * 4000;
      console.log(`${colors.gray}⏳ Waiting ${(delay/1000).toFixed(1)}s before next swap...\n${colors.reset}`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  
  // Final statistics
  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(2); // minutes
  const finalBalance = await provider.getBalance(wallet.address);
  const totalSpent = initialBalance.sub(finalBalance);
  
  console.log(`\n${colors.green}🎉 RAPID UOMI SWAP COMPLETED!${colors.reset}`);
  console.log(`${colors.green}✅ Final Success Rate: ${successCount}/${count} (${(successCount/count*100).toFixed(1)}%)${colors.reset}`);
  console.log(`${colors.gray}⏱️  Total Time: ${totalTime} minutes${colors.reset}`);
  console.log(`${colors.gray}⛽ Total Gas Used: ${totalGasUsed.toString()}${colors.reset}`);
  console.log(`${colors.gray}💸 Total UOMI Spent: ${ethers.utils.formatEther(totalSpent)}${colors.reset}`);
  console.log(`${colors.gray}💰 Final Balance: ${ethers.utils.formatEther(finalBalance)}${colors.reset}`);
  
  if (successCount > 0) {
    const avgTimePerSwap = (totalTime * 60 / successCount).toFixed(1);
    console.log(`${colors.cyan}📈 Average: ${avgTimePerSwap}s per successful swap${colors.reset}`);
  }
  
  return successCount;
};

// TIME-BASED RAPID SWAP
const timeBasedRapidSwap = async (totalSwaps, timeframeMinutes, uomiAmount = defaultUomiAmount) => {
  const intervalMs = (timeframeMinutes * 60 * 1000) / totalSwaps;
  
  console.log(`${colors.magenta}⏰ TIME-BASED RAPID UOMI SWAP${colors.reset}`);
  console.log(`${colors.gray}📊 ${totalSwaps} swaps over ${timeframeMinutes} minutes${colors.reset}`);
  console.log(`${colors.gray}⏱️  Interval: ${(intervalMs / 1000 / 60).toFixed(2)} minutes per swap${colors.reset}`);
  console.log(`${colors.gray}💧 Amount per swap: ${uomiAmount} UOMI${colors.reset}\n`);
  
  let successCount = 0;
  let totalGasUsed = ethers.BigNumber.from(0);
  
  for (let i = 1; i <= totalSwaps; i++) {
    const currentTime = new Date().toLocaleTimeString();
    
    console.log(`${colors.blue}🕐 [${currentTime}] Time-based Swap ${i}/${totalSwaps}${colors.reset}`);
    
    try {
      const success = await uomiSwap(uomiAmount);
      
      if (success) {
        successCount++;
        console.log(`${colors.green}   ✅ Time-based swap SUCCESS!${colors.reset}`);
      } else {
        console.log(`${colors.red}   ❌ Time-based swap FAILED!${colors.reset}`);
      }
      
    } catch (err) {
      console.log(`${colors.red}   ❌ Time-based swap ERROR: ${err.message}${colors.reset}`);
    }
    
    const successRate = (successCount / i * 100).toFixed(1);
    console.log(`${colors.yellow}📈 Progress: ${successCount}/${i} (${successRate}% success)${colors.reset}`);
    
    // Wait for next interval (except for last swap)
    if (i < totalSwaps) {
      const nextTime = new Date(Date.now() + intervalMs).toLocaleTimeString();
      console.log(`${colors.gray}⏳ Next swap scheduled at ${nextTime}...\n${colors.reset}`);
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  console.log(`\n${colors.green}🎉 TIME-BASED RAPID SWAPS COMPLETED!${colors.reset}`);
  console.log(`${colors.green}✅ Final: ${successCount}/${totalSwaps} (${(successCount/totalSwaps*100).toFixed(1)}%)${colors.reset}`);
  
  return successCount;
};

// BURST SWAP MODE (very fast, minimal delays)
const burstSwap = async (count, uomiAmount, delayMs = 1000) => {
  console.log(`${colors.magenta}💥 BURST UOMI SWAP MODE: ${count} swaps${colors.reset}`);
  console.log(`${colors.gray}⚡ Super fast mode with ${delayMs}ms delays${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warning: This mode is very aggressive!${colors.reset}\n`);
  
  let successCount = 0;
  const promises = [];
  
  // Launch all swaps with minimal delays
  for (let i = 1; i <= count; i++) {
    console.log(`${colors.cyan}🚀 Launching burst swap #${i}...${colors.reset}`);
    
    const swapPromise = (async (swapId) => {
      try {
        // Small delay to prevent nonce conflicts
        await new Promise(r => setTimeout(r, delayMs * (swapId - 1)));
        
        const success = await uomiSwap(uomiAmount);
        
        if (success) {
          console.log(`${colors.green}⚡ Burst swap #${swapId} SUCCESS!${colors.reset}`);
          return 1;
        } else {
          console.log(`${colors.red}💥 Burst swap #${swapId} FAILED!${colors.reset}`);
          return 0;
        }
        
      } catch (err) {
        console.log(`${colors.red}💥 Burst swap #${swapId} ERROR: ${err.message}${colors.reset}`);
        return 0;
      }
    })(i);
    
    promises.push(swapPromise);
  }
  
  console.log(`${colors.yellow}⏳ Waiting for all ${count} burst swaps to complete...${colors.reset}\n`);
  
  // Wait for all swaps to complete
  const results = await Promise.all(promises);
  successCount = results.reduce((sum, result) => sum + result, 0);
  
  console.log(`\n${colors.green}🎉 BURST SWAP COMPLETED!${colors.reset}`);
  console.log(`${colors.green}⚡ Final Success Rate: ${successCount}/${count} (${(successCount/count*100).toFixed(1)}%)${colors.reset}`);
  
  return successCount;
};

// MAIN FUNCTION
const main = async () => {
  console.log(`${colors.cyan}🚀 UOMI SWAP BOT (UOMI TESTNET) - FIXED VERSION${colors.reset}`);
  console.log(`${colors.gray}Wallet: ${wallet.address}${colors.reset}`);
  console.log(`${colors.gray}Network: UOMI Testnet (${CHAIN_ID})${colors.reset}`);
  console.log(`${colors.green}✅ CORRECT UniversalRouter: ${UNIVERSAL_ROUTER}${colors.reset}\n`);
  
  const args = process.argv.slice(2);
  
  if (args[0] === 'balance') {
    await checkBalances();
    return;
  }
  
  if (args[0] === 'exact') {
    await uomiSwapExact();
    return;
  }
  
  if (args[0] === 'single') {
    const uomiAmount = parseFloat(args[1]) || defaultUomiAmount;
    await uomiSwap(uomiAmount);
    return;
  }
  
  if (args[0] === 'rapid') {
    const count = parseInt(args[1]) || 5;
    const uomiAmount = parseFloat(args[2]) || defaultUomiAmount;
    await rapidSwap(count, uomiAmount);
    return;
  }
  
  if (args[0] === 'time') {
    const swaps = parseInt(args[1]) || 10;
    const minutes = parseInt(args[2]) || 60;
    const uomiAmount = parseFloat(args[3]) || defaultUomiAmount;
    await timeBasedRapidSwap(swaps, minutes, uomiAmount);
    return;
  }
  
  if (args[0] === 'burst') {
    const count = parseInt(args[1]) || 3;
    const uomiAmount = parseFloat(args[2]) || defaultUomiAmount;
    const delay = parseInt(args[3]) || 1000;
    await burstSwap(count, uomiAmount, delay);
    return;
  }
  
  // Interactive mode
  const balances = await checkBalances();
  if (!balances) {
    console.log(`${colors.red}❌ Cannot check balances! Check RPC connection.${colors.reset}`);
    return;
  }
  
  if (balances.uomi < 0.11) {
    console.log(`${colors.red}❌ Low UOMI balance! Need at least 0.11 UOMI.${colors.reset}`);
    return;
  }
  
  await uomiSwapExact(); // Try exact copy first
  
  // Final balance check
  console.log(`\n${colors.cyan}🔍 FINAL BALANCES:${colors.reset}`);
  await checkBalances();
};

// Show help
if (process.argv.length === 2) {
  console.log(`
${colors.cyan}🚀 UOMI SWAP BOT COMMANDS (FIXED VERSION):${colors.reset}

${colors.green}📊 INFORMATION:${colors.reset}
node uomi_swap.js balance                   - Check balances

${colors.green}⟳ SINGLE SWAPS:${colors.reset}
node uomi_swap.js exact                     - Exact copy of successful TX
node uomi_swap.js single                    - Single swap with default amount
node uomi_swap.js single 0.2                - Single swap: 0.2 UOMI → SYN

${colors.green}🚀 RAPID SWAP MODES:${colors.reset}
node uomi_swap.js rapid 10                  - 10 rapid swaps (default amount)
node uomi_swap.js rapid 5 0.1               - 5 rapid swaps of 0.1 UOMI each
node uomi_swap.js rapid 20 0.05             - 20 rapid swaps of 0.05 UOMI each

${colors.green}⏰ TIME-BASED SWAPS:${colors.reset}
node uomi_swap.js time 10 60                - 10 swaps over 60 minutes
node uomi_swap.js time 20 120 0.05          - 20 swaps over 120 min, 0.05 UOMI each

${colors.green}💥 BURST SWAPS (AGGRESSIVE):${colors.reset}
node uomi_swap.js burst 5                   - 5 burst swaps (1s delay)
node uomi_swap.js burst 3 0.1 500           - 3 burst swaps, 0.1 UOMI, 500ms delay

${colors.green}🎮 INTERACTIVE MODE:${colors.reset}
node uomi_swap.js                           - Interactive mode (tries exact first)

${colors.cyan}📋 RAPID SWAP FEATURES:${colors.reset}
${colors.gray}✅ Random delays between swaps (2-6 seconds)${colors.reset}
${colors.gray}✅ Real-time success rate tracking${colors.reset}
${colors.gray}✅ Gas usage monitoring${colors.reset}
${colors.gray}✅ Balance protection (stops if insufficient funds)${colors.reset}
${colors.gray}✅ Detailed statistics and timing${colors.reset}

${colors.cyan}⚡ BURST MODE WARNING:${colors.reset}
${colors.yellow}⚠️  Burst mode is very aggressive and may cause nonce conflicts!${colors.reset}
${colors.yellow}⚠️  Use smaller counts (3-5) for burst mode${colors.reset}
  `);
} else {
  main().catch(console.error);
}