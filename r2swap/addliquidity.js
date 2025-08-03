require('dotenv').config();
const { ethers } = require('ethers');
const readline = require('readline');

// SEPOLIA TESTNET CONFIG - FROM SUCCESSFUL TX
const RPC_URL = 'https://eth-sepolia.g.alchemy.com/public';
const CHAIN_ID = 11155111;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// CONTRACT ADDRESSES - FROM NEW SUCCESSFUL TX: 0x250f84a7ca8c3d6bd5418c0ba585ac53cbbb245f69e03bb42d88afe1d802e83f
const UNISWAP_V2_ROUTER = '0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3'; // Uniswap V2 Router
const R2_TOKEN_ADDRESS = '0xb816bb88f836ea75ca4071b46ff285f690c43bb7'; // R2 token (tokenA)
const USDC_ADDRESS = '0x8BEbFCBe5468F146533C182dF3DFbF5ff9BE00E2'; // USDC token (tokenB)

const provider = new ethers.providers.JsonRpcProvider(RPC_URL, CHAIN_ID);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// DEFAULT AMOUNTS - FROM SUCCESSFUL TX
const defaultR2Amount = 4.999569404195710517; // R2 amount
const defaultUsdcAmount = 7.480571; // USDC amount

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

// TOKEN ABI
const TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)"
];

const r2Contract = new ethers.Contract(R2_TOKEN_ADDRESS, TOKEN_ABI, wallet);
const usdcContract = new ethers.Contract(USDC_ADDRESS, TOKEN_ABI, wallet);

// UNISWAP V2 ADD LIQUIDITY FUNCTION - BASED ON SUCCESSFUL TX: 0x250f84a7ca8c3d6bd5418c0ba585ac53cbbb245f69e03bb42d88afe1d802e83f
const addLiquidity = async (r2Amount = defaultR2Amount, usdcAmount = defaultUsdcAmount) => {
  try {
    console.log(`${colors.cyan}[💧] Uniswap V2 Add Liquidity: ${r2Amount} R2 + ${usdcAmount} USDC${colors.reset}`);
    
    // Check R2 balance first
    const r2Balance = await r2Contract.balanceOf(wallet.address);
    const formattedR2Balance = ethers.utils.formatUnits(r2Balance, 18); // R2 has 18 decimals
    
    console.log(`${colors.yellow}💰 R2 Balance: ${formattedR2Balance}${colors.reset}`);
    
    if (parseFloat(formattedR2Balance) < r2Amount) {
      console.log(`${colors.red}❌ Insufficient R2! Need ${r2Amount}, have ${formattedR2Balance}${colors.reset}`);
      return false;
    }
    
    // Check USDC balance
    const usdcBalance = await usdcContract.balanceOf(wallet.address);
    const formattedUsdcBalance = ethers.utils.formatUnits(usdcBalance, 6);
    
    console.log(`${colors.yellow}💰 USDC Balance: ${formattedUsdcBalance}${colors.reset}`);
    
    if (parseFloat(formattedUsdcBalance) < usdcAmount) {
      console.log(`${colors.red}❌ Insufficient USDC! Need ${usdcAmount}, have ${formattedUsdcBalance}${colors.reset}`);
      return false;
    }
    
    // Check R2 allowance
    const r2Allowance = await r2Contract.allowance(wallet.address, UNISWAP_V2_ROUTER);
    const formattedR2Allowance = ethers.utils.formatUnits(r2Allowance, 18);
    
    console.log(`${colors.gray}🔍 R2 allowance: ${formattedR2Allowance}${colors.reset}`);
    
    if (parseFloat(formattedR2Allowance) < r2Amount) {
      console.log(`${colors.yellow}⚠️ Need R2 approval first...${colors.reset}`);
      const success = await approveR2(r2Amount * 2); // Approve double
      if (!success) {
        console.log(`${colors.red}❌ R2 Approval failed!${colors.reset}`);
        return false;
      }
    }
    
    // Check USDC allowance
    const usdcAllowance = await usdcContract.allowance(wallet.address, UNISWAP_V2_ROUTER);
    const formattedUsdcAllowance = ethers.utils.formatUnits(usdcAllowance, 6);
    
    console.log(`${colors.gray}🔍 USDC allowance: ${formattedUsdcAllowance}${colors.reset}`);
    
    if (parseFloat(formattedUsdcAllowance) < usdcAmount) {
      console.log(`${colors.yellow}⚠️ Need USDC approval first...${colors.reset}`);
      const success = await approveUSDC(usdcAmount * 2); // Approve double
      if (!success) {
        console.log(`${colors.red}❌ USDC Approval failed!${colors.reset}`);
        return false;
      }
    }
    
    // BUILD UNISWAP V2 ADD LIQUIDITY TRANSACTION - EXACT PATTERN FROM SUCCESSFUL TX
    // Function: addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline)
    // MethodID: 0xe8e33700
    
    const r2AmountWei = ethers.utils.parseUnits(r2Amount.toString(), 18); // R2 (18 decimals)
    const usdcAmountWei = ethers.utils.parseUnits(usdcAmount.toString(), 6); // USDC (6 decimals)
    
    // Calculate minimum amounts (95% of desired amounts for slippage protection)
    const r2AmountMin = r2AmountWei.mul(95).div(100);
    const usdcAmountMin = usdcAmountWei.mul(95).div(100);
    
    // Deadline: current timestamp + 20 minutes
    const deadline = Math.floor(Date.now() / 1000) + 1200;
    
    console.log(`${colors.gray}🔍 Uniswap V2 Router: ${UNISWAP_V2_ROUTER}${colors.reset}`);
    console.log(`${colors.gray}🔍 R2 Wei: ${r2AmountWei.toString()}${colors.reset}`);
    console.log(`${colors.gray}🔍 USDC Wei: ${usdcAmountWei.toString()}${colors.reset}`);
    console.log(`${colors.gray}🔍 R2 Min: ${r2AmountMin.toString()}${colors.reset}`);
    console.log(`${colors.gray}🔍 USDC Min: ${usdcAmountMin.toString()}${colors.reset}`);
    console.log(`${colors.gray}🔍 Deadline: ${deadline}${colors.reset}`);
    
    // EXACT DATA CONSTRUCTION FROM SUCCESSFUL TX
    const methodId = '0xe8e33700'; // addLiquidity function selector
    
    // Convert addresses and amounts to hex (32 bytes each)
    const tokenAHex = R2_TOKEN_ADDRESS.toLowerCase().substring(2).padStart(64, '0');
    const tokenBHex = USDC_ADDRESS.toLowerCase().substring(2).padStart(64, '0');
    const amountADesiredHex = r2AmountWei.toHexString().substring(2).padStart(64, '0');
    const amountBDesiredHex = usdcAmountWei.toHexString().substring(2).padStart(64, '0');
    const amountAMinHex = r2AmountMin.toHexString().substring(2).padStart(64, '0');
    const amountBMinHex = usdcAmountMin.toHexString().substring(2).padStart(64, '0');
    const toHex = wallet.address.toLowerCase().substring(2).padStart(64, '0');
    const deadlineHex = ethers.BigNumber.from(deadline).toHexString().substring(2).padStart(64, '0');
    
    // Build transaction data - EXACT PATTERN FROM SUCCESSFUL TX
    const txData = methodId +
      tokenAHex +          // [0] tokenA (R2)
      tokenBHex +          // [1] tokenB (USDC)
      amountADesiredHex +  // [2] amountADesired (R2 amount)
      amountBDesiredHex +  // [3] amountBDesired (USDC amount)
      amountAMinHex +      // [4] amountAMin (R2 minimum)
      amountBMinHex +      // [5] amountBMin (USDC minimum)
      toHex +              // [6] to (recipient)
      deadlineHex;         // [7] deadline
    
    console.log(`${colors.gray}🔍 Transaction data length: ${txData.length} chars${colors.reset}`);
    
    const tx = {
      to: UNISWAP_V2_ROUTER,
      data: txData,
      gasLimit: 250000, // Higher than successful 127,054
      maxPriorityFeePerGas: ethers.utils.parseUnits('0.01', 'gwei'), // Higher than successful 0.004655574
      maxFeePerGas: ethers.utils.parseUnits('0.09', 'gwei'), // Higher than successful 0.080681751
      value: 0, // No ETH value
    };
    
    console.log(`${colors.gray}🔍 Gas Limit: ${tx.gasLimit} | Priority: ${ethers.utils.formatUnits(tx.maxPriorityFeePerGas, 'gwei')} Gwei${colors.reset}`);
    
    const sentTx = await wallet.sendTransaction(tx);
    console.log(`${colors.green}[✓] Tx sent: ${sentTx.hash}${colors.reset}`);
    
    const receipt = await sentTx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}[+] UNISWAP V2 ADD LIQUIDITY SUCCESS! ✅${colors.reset}`);
      console.log(`${colors.gray}⛽ Gas Used: ${receipt.gasUsed.toString()} / ${tx.gasLimit} (${(receipt.gasUsed/tx.gasLimit*100).toFixed(1)}%)${colors.reset}`);
      console.log(`${colors.gray}📦 Block: ${receipt.blockNumber}${colors.reset}`);
      console.log(`${colors.cyan}[↗] Explorer: https://sepolia.etherscan.io/tx/${receipt.transactionHash}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}[✗] UNISWAP V2 ADD LIQUIDITY FAILED! ❌ (status 0)${colors.reset}`);
      return false;
    }
    
  } catch (err) {
    console.error(`${colors.red}[✗] Add Liquidity failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// APPROVE R2 FUNCTION
const approveR2 = async (amount) => {
  try {
    console.log(`${colors.cyan}🔓 Approving ${amount} R2...${colors.reset}`);
    
    const amountWei = ethers.utils.parseUnits(amount.toString(), 18);
    
    const tx = await r2Contract.approve(UNISWAP_V2_ROUTER, amountWei, {
      gasLimit: 60000,
      maxPriorityFeePerGas: ethers.utils.parseUnits('0.01', 'gwei'),
      maxFeePerGas: ethers.utils.parseUnits('0.09', 'gwei')
    });
    
    console.log(`${colors.green}[✓] R2 Approval tx sent: ${tx.hash}${colors.reset}`);
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}[+] R2 Approval SUCCESS! ✅${colors.reset}`);
      console.log(`${colors.gray}⛽ Gas Used: ${receipt.gasUsed.toString()}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}[✗] R2 Approval FAILED! ❌${colors.reset}`);
      return false;
    }
    
  } catch (err) {
    console.error(`${colors.red}[✗] R2 Approval failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// APPROVE USDC FUNCTION
const approveUSDC = async (amount) => {
  try {
    console.log(`${colors.cyan}🔓 Approving ${amount} USDC...${colors.reset}`);
    
    const amountWei = ethers.utils.parseUnits(amount.toString(), 6);
    
    const tx = await usdcContract.approve(UNISWAP_V2_ROUTER, amountWei, {
      gasLimit: 60000,
      maxPriorityFeePerGas: ethers.utils.parseUnits('0.01', 'gwei'),
      maxFeePerGas: ethers.utils.parseUnits('0.09', 'gwei')
    });
    
    console.log(`${colors.green}[✓] USDC Approval tx sent: ${tx.hash}${colors.reset}`);
    
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
    
    // R2 Balance
    const r2Balance = await r2Contract.balanceOf(wallet.address);
    const formattedR2 = ethers.utils.formatUnits(r2Balance, 18);
    console.log(`${colors.yellow}💰 R2 Balance: ${formattedR2}${colors.reset}`);
    
    // USDC Balance
    const usdcBalance = await usdcContract.balanceOf(wallet.address);
    const formattedUsdc = ethers.utils.formatUnits(usdcBalance, 6);
    console.log(`${colors.yellow}💰 USDC Balance: ${formattedUsdc}${colors.reset}`);
    
    // Check allowances
    const r2Allowance = await r2Contract.allowance(wallet.address, UNISWAP_V2_ROUTER);
    const usdcAllowance = await usdcContract.allowance(wallet.address, UNISWAP_V2_ROUTER);
    
    const formattedR2Allowance = ethers.utils.formatUnits(r2Allowance, 18);
    const formattedUsdcAllowance = ethers.utils.formatUnits(usdcAllowance, 6);
    
    console.log(`${colors.yellow}📝 R2 Allowance: ${formattedR2Allowance}${colors.reset}`);
    console.log(`${colors.yellow}📝 USDC Allowance: ${formattedUsdcAllowance}${colors.reset}`);
    
    return {
      eth: parseFloat(formattedEth),
      r2: parseFloat(formattedR2),
      usdc: parseFloat(formattedUsdc),
      r2Allowance: parseFloat(formattedR2Allowance),
      usdcAllowance: parseFloat(formattedUsdcAllowance)
    };
    
  } catch (err) {
    console.error(`${colors.red}❌ Balance check failed: ${err.message}${colors.reset}`);
    return null;
  }
};

// INTERACTIVE AMOUNT
const askLiquidityAmounts = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`${colors.cyan}💧 R2 amount? (default: ${defaultR2Amount}) ${colors.reset}`, (r2Answer) => {
      rl.question(`${colors.cyan}💧 USDC amount? (default: ${defaultUsdcAmount}) ${colors.reset}`, (usdcAnswer) => {
        rl.close();
        
        const r2Amount = parseFloat(r2Answer) || defaultR2Amount;
        const usdcAmount = parseFloat(usdcAnswer) || defaultUsdcAmount;
        
        resolve({ r2Amount, usdcAmount });
      });
    });
  });
};

// MASS APPROVE FUNCTION
const massApprove = async (r2Amount, usdcAmount) => {
  try {
    console.log(`${colors.cyan}🚀 MASS APPROVE: ${r2Amount} R2 + ${usdcAmount} USDC${colors.reset}`);
    
    // Approve R2
    const r2AmountWei = ethers.utils.parseUnits(r2Amount.toString(), 18);
    const r2Tx = await r2Contract.approve(UNISWAP_V2_ROUTER, r2AmountWei, {
      gasLimit: 60000,
      maxPriorityFeePerGas: ethers.utils.parseUnits('0.01', 'gwei'),
      maxFeePerGas: ethers.utils.parseUnits('0.09', 'gwei')
    });
    await r2Tx.wait();
    console.log(`${colors.green}✅ R2 Approved!${colors.reset}`);
    
    // Approve USDC
    const usdcAmountWei = ethers.utils.parseUnits(usdcAmount.toString(), 6);
    const usdcTx = await usdcContract.approve(UNISWAP_V2_ROUTER, usdcAmountWei, {
      gasLimit: 60000,
      maxPriorityFeePerGas: ethers.utils.parseUnits('0.01', 'gwei'),
      maxFeePerGas: ethers.utils.parseUnits('0.09', 'gwei')
    });
    await usdcTx.wait();
    console.log(`${colors.green}✅ USDC Approved!${colors.reset}`);
    
    return true;
    
  } catch (err) {
    console.error(`${colors.red}❌ Mass approve failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// RAPID ADD LIQUIDITY MODE
const rapidAddLiquidity = async (count, r2Amount, usdcAmount) => {
  console.log(`${colors.magenta}🚀 RAPID ADD LIQUIDITY MODE: ${count} adds${colors.reset}`);
  console.log(`${colors.gray}💧 Each add: ${r2Amount} R2 + ${usdcAmount} USDC${colors.reset}`);
  
  let successCount = 0;
  
  for (let i = 1; i <= count; i++) {
    console.log(`${colors.cyan}\n[${i}/${count}] Add Liquidity...${colors.reset}`);
    
    const success = await addLiquidity(r2Amount, usdcAmount);
    if (success) {
      successCount++;
    }
    
    console.log(`${colors.yellow}📊 Progress: ${successCount}/${i} success (${(successCount/i*100).toFixed(1)}%)${colors.reset}`);
    
    // Random delay (2-4 seconds)
    if (i < count) {
      const delay = 2000 + Math.random() * 2000;
      console.log(`${colors.gray}⏳ Waiting ${(delay/1000).toFixed(1)}s...${colors.reset}`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  
  console.log(`\n${colors.green}🎉 RAPID ADD LIQUIDITY COMPLETED!${colors.reset}`);
  console.log(`${colors.green}✅ Final Success Rate: ${successCount}/${count} (${(successCount/count*100).toFixed(1)}%)${colors.reset}`);
  
  return successCount;
};

// MAIN FUNCTION
const main = async () => {
  console.log(`${colors.cyan}🚀 R2 UNISWAP V2 ADD LIQUIDITY BOT (SEPOLIA TESTNET)${colors.reset}`);
  console.log(`${colors.gray}Wallet: ${wallet.address}${colors.reset}`);
  console.log(`${colors.gray}Network: Sepolia Testnet (${CHAIN_ID})${colors.reset}`);
  console.log(`${colors.gray}Uniswap V2 Router: ${UNISWAP_V2_ROUTER}${colors.reset}\n`);
  
  const args = process.argv.slice(2);
  
  if (args[0] === 'balance') {
    await checkBalances();
    return;
  }
  
  if (args[0] === 'approve') {
    const r2Amount = parseFloat(args[1]) || 1000;
    const usdcAmount = parseFloat(args[2]) || 1000;
    await massApprove(r2Amount, usdcAmount);
    return;
  }
  
  if (args[0] === 'single') {
    const r2Amount = parseFloat(args[1]) || defaultR2Amount;
    const usdcAmount = parseFloat(args[2]) || defaultUsdcAmount;
    await addLiquidity(r2Amount, usdcAmount);
    return;
  }
  
  if (args[0] === 'rapid') {
    const count = parseInt(args[1]) || 5;
    const r2Amount = parseFloat(args[2]) || defaultR2Amount;
    const usdcAmount = parseFloat(args[3]) || defaultUsdcAmount;
    await rapidAddLiquidity(count, r2Amount, usdcAmount);
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
  
  if (balances.r2 < defaultR2Amount) {
    console.log(`${colors.red}❌ Insufficient R2! Need at least ${defaultR2Amount} R2.${colors.reset}`);
    return;
  }
  
  if (balances.usdc < defaultUsdcAmount) {
    console.log(`${colors.red}❌ Insufficient USDC! Need at least ${defaultUsdcAmount} USDC.${colors.reset}`);
    return;
  }
  
  const amounts = await askLiquidityAmounts();
  
  console.log(`${colors.green}✅ Configuration:${colors.reset}`);
  console.log(`${colors.gray}   R2 per add: ${amounts.r2Amount}${colors.reset}`);
  console.log(`${colors.gray}   USDC per add: ${amounts.usdcAmount}${colors.reset}\n`);
  
  // Auto-approve if needed
  const totalR2Needed = amounts.r2Amount * 2;
  const totalUsdcNeeded = amounts.usdcAmount * 2;
  
  if (balances.r2Allowance < totalR2Needed || balances.usdcAllowance < totalUsdcNeeded) {
    console.log(`${colors.yellow}⚠️ Need approvals...${colors.reset}`);
    const approveSuccess = await massApprove(totalR2Needed, totalUsdcNeeded);
    if (!approveSuccess) {
      console.log(`${colors.red}❌ Approval failed! Cannot continue.${colors.reset}`);
      return;
    }
  }
  
  await addLiquidity(amounts.r2Amount, amounts.usdcAmount);
  
  // Final balance check
  console.log(`\n${colors.cyan}🔍 FINAL BALANCES:${colors.reset}`);
  await checkBalances();
};

// Show help if no args
if (process.argv.length === 2) {
  console.log(`
${colors.cyan}🚀 R2 UNISWAP V2 ADD LIQUIDITY BOT COMMANDS:${colors.reset}

${colors.green}📊 INFORMATION:${colors.reset}
node r2addliquidity_sepolia.js balance              - Check balances & allowances

${colors.green}🔓 APPROVAL:${colors.reset}
node r2addliquidity_sepolia.js approve 100 100     - Approve 100 R2 + 100 USDC

${colors.green}💧 SINGLE ADD:${colors.reset}
node r2addliquidity_sepolia.js single              - Single add with default amounts
node r2addliquidity_sepolia.js single 5 7          - Single add: 5 R2 + 7 USDC

${colors.green}🚀 RAPID ADDS:${colors.reset}
node r2addliquidity_sepolia.js rapid 3             - 3 adds with default amounts
node r2addliquidity_sepolia.js rapid 5 2 3         - 5 adds: 2 R2 + 3 USDC each

${colors.green}🎮 INTERACTIVE MODE:${colors.reset}
node r2addliquidity_sepolia.js                     - Interactive mode

${colors.cyan}📋 SUCCESSFUL TX PATTERN:${colors.reset}
${colors.gray}✅ Function: addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline)${colors.reset}
${colors.gray}✅ MethodID: 0xe8e33700${colors.reset}
${colors.gray}✅ TokenA: R2 (${R2_TOKEN_ADDRESS})${colors.reset}
${colors.gray}✅ TokenB: USDC (${USDC_ADDRESS})${colors.reset}
${colors.gray}✅ Amounts: ${defaultR2Amount} R2 + ${defaultUsdcAmount} USDC${colors.reset}
${colors.gray}✅ Router: ${UNISWAP_V2_ROUTER}${colors.reset}
  `);
} else {
  main().catch(console.error);
}