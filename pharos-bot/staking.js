require('dotenv').config();
const { ethers } = require('ethers');

// MONAD TESTNET - UPDATED RPC
const RPC_URL = 'https://api.zan.top/node/v1/pharos/testnet/ed6c5bbb3d9e421d95d932f30f330aba';
const CHAIN_ID = 688688;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// CONTRACT ADDRESSES - UPDATED FROM SUCCESSFUL TX
const VAULT_ADDRESS = '0xA1538E3A13D2A5b460F1b6e87b493962FC791959';
const USDT_ADDRESS = '0xD4071393f8716661958F766DF660033b3d35fD29';
const MULTICALL_ADDRESS = '0x11cd3700b310339003641fdce57c1f9bd21ae015'; // VaultMulticall_v2

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

console.log(`${colors.cyan}🚀 VAULT STAKING BOT (UPDATED SUCCESSFUL PATTERNS)${colors.reset}`);
console.log(`${colors.gray}Wallet: ${wallet.address}${colors.reset}`);

// ERC20 ABI FOR BALANCE CHECK
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

const usdtContract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, wallet);

// CHECK BALANCES
const checkBalances = async () => {
  try {
    const ethBalance = await provider.getBalance(wallet.address);
    const usdtBalance = await usdtContract.balanceOf(wallet.address);
    
    console.log(`${colors.yellow}💰 PHRS Balance: ${ethers.utils.formatEther(ethBalance)}${colors.reset}`);
    console.log(`${colors.yellow}💰 USDT Balance: ${ethers.utils.formatUnits(usdtBalance, 6)}${colors.reset}`);
    
    return { ethBalance, usdtBalance };
  } catch (err) {
    console.log(`${colors.red}❌ Balance check failed: ${err.message}${colors.reset}`);
    return null;
  }
};

// APPROVE USDT WITH UPDATED GAS
const approveUSDT = async (amount) => {
  try {
    console.log(`${colors.cyan}📝 Approving ${ethers.utils.formatUnits(amount, 6)} USDT...${colors.reset}`);
    
    const tx = await usdtContract.approve(VAULT_ADDRESS, amount, {
      gasLimit: 100000,
      maxPriorityFeePerGas: ethers.utils.parseUnits('3', 'gwei'), // Updated to 3 Gwei
      maxFeePerGas: ethers.utils.parseUnits('4', 'gwei')
    });
    
    console.log(`${colors.green}✅ Approve TX: ${tx.hash}${colors.reset}`);
    await tx.wait();
    console.log(`${colors.green}✅ Approval confirmed!${colors.reset}`);
    return true;
  } catch (err) {
    console.log(`${colors.red}❌ Approval failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// UPDATED MULTICALL DEPOSIT BASED ON SUCCESSFUL TX: 0x657136fcea27f98925bce4d1f5d7a687d042295ea8b8d55167562b59038d76aa
const multicallDeposit = async () => {
  try {
    console.log(`${colors.cyan}📥 Multicall depositing (UPDATED SUCCESSFUL PATTERN)...${colors.reset}`);
    
    // Get current wallet address for dynamic insertion
    const walletAddressRaw = wallet.address.toLowerCase().substring(2); // Remove 0x
    const walletAddressHex = walletAddressRaw.padStart(40, '0');
    
    console.log(`${colors.gray}🔍 Using wallet: ${wallet.address}${colors.reset}`);
    console.log(`${colors.gray}🔍 Wallet hex: ${walletAddressHex}${colors.reset}`);
    console.log(`${colors.gray}🔍 Amount: 02161520 = ${parseInt('02161520', 16) / 1000000} USDT${colors.reset}`);
    
    // EXACT SUCCESSFUL DEPOSIT DATA FROM TX: 0x657136fcea27f98925bce4d1f5d7a687d042295ea8b8d55167562b59038d76aa
    const depositData = '0xac9650d8' +
      '0000000000000000000000000000000000000000000000000000000000000020' + // [0]
      '0000000000000000000000000000000000000000000000000000000000000001' + // [1]
      '0000000000000000000000000000000000000000000000000000000000000020' + // [2]
      '0000000000000000000000000000000000000000000000000000000000000064' + // [3]
      'f9984acd000000000000000000000000a1538e3a13d2a5b460f1b6e87b493962' + // [4] deposit function + vault
      'fc79195900000000000000000000000000000000000000000000000000000000' + // [5] vault address continuation
      '0216152000000000000000000000000095d1150c9364249db3dfcc2f029173c9' + // [6] amount + wallet start
      'c23c417500000000000000000000000000000000000000000000000000000000'; // [7] wallet end + padding
    
    console.log(`${colors.gray}🔍 Deposit data length: ${depositData.length} chars${colors.reset}`);
    console.log(`${colors.gray}🔍 Expected gas: ~144,222 (from successful tx)${colors.reset}`);
    
    const tx = await wallet.sendTransaction({
      to: MULTICALL_ADDRESS,
      data: depositData,
      gasLimit: 210000, // Higher than successful tx (206,329)
      maxPriorityFeePerGas: ethers.utils.parseUnits('3', 'gwei'), // Same as successful tx
      maxFeePerGas: ethers.utils.parseUnits('4', 'gwei')
    });
    
    console.log(`${colors.green}✅ Multicall Deposit TX: ${tx.hash}${colors.reset}`);
    console.log(`${colors.cyan}🔍 Explorer: https://testnet.monad.xyz/tx/${tx.hash}${colors.reset}`);
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}✅ Multicall deposit SUCCESS!${colors.reset}`);
      console.log(`${colors.gray}⛽ Gas Used: ${receipt.gasUsed.toString()} (limit: ${tx.gasLimit})${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}❌ Multicall deposit FAILED! Status: ${receipt.status}${colors.reset}`);
      return false;
    }
  } catch (err) {
    console.log(`${colors.red}❌ Multicall deposit failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// UPDATED MULTICALL WITHDRAW BASED ON SUCCESSFUL TX: 0x0906474adcee54b08468f3cac7293327430064208ac30c382f7a4635eb329551
const multicallWithdraw = async () => {
  try {
    console.log(`${colors.cyan}📤 Multicall withdrawing (UPDATED SUCCESSFUL PATTERN)...${colors.reset}`);
    
    // Get current wallet address for dynamic insertion
    const walletAddressRaw = wallet.address.toLowerCase().substring(2);
    const walletAddressHex = walletAddressRaw.padStart(40, '0');
    
    console.log(`${colors.gray}🔍 Using wallet: ${wallet.address}${colors.reset}`);
    console.log(`${colors.gray}🔍 Wallet hex: ${walletAddressHex}${colors.reset}`);
    console.log(`${colors.gray}🔍 Shares: 0216151f = ${parseInt('0216151f', 16) / 1000000} shares${colors.reset}`);
    
    // EXACT SUCCESSFUL WITHDRAW DATA FROM TX: 0x0906474adcee54b08468f3cac7293327430064208ac30c382f7a4635eb329551
    const withdrawData = '0xac9650d8' +
      '0000000000000000000000000000000000000000000000000000000000000020' + // [0]
      '0000000000000000000000000000000000000000000000000000000000000001' + // [1]
      '0000000000000000000000000000000000000000000000000000000000000020' + // [2]
      '0000000000000000000000000000000000000000000000000000000000000084' + // [3] ✅ Different length (0x84 vs 0x64)
      '0dfe90c0000000000000000000000000a1538e3a13d2a5b460f1b6e87b493962' + // [4] withdraw function + vault
      'fc79195900000000000000000000000000000000000000000000000000000000' + // [5] vault address continuation  
      '0216151f00000000000000000000000095d1150c9364249db3dfcc2f029173c9' + // [6] shares amount + wallet start
      'c23c417500000000000000000000000095d1150c9364249db3dfcc2f029173c9' + // [7] wallet (receiver) + wallet start (owner)
      'c23c417500000000000000000000000000000000000000000000000000000000'; // [8] wallet end (owner) + padding
    
    console.log(`${colors.gray}🔍 Withdraw data length: ${withdrawData.length} chars${colors.reset}`);
    console.log(`${colors.gray}🔍 Expected gas: ~92,245 (from successful tx)${colors.reset}`);
    
    const tx = await wallet.sendTransaction({
      to: MULTICALL_ADDRESS,
      data: withdrawData,
      gasLimit: 120000, // Higher than successful tx (103,573)
      maxPriorityFeePerGas: ethers.utils.parseUnits('3', 'gwei'), // Same as successful tx
      maxFeePerGas: ethers.utils.parseUnits('4', 'gwei')
    });
    
    console.log(`${colors.green}✅ Multicall Withdraw TX: ${tx.hash}${colors.reset}`);
    console.log(`${colors.cyan}🔍 Explorer: https://testnet.monad.xyz/tx/${tx.hash}${colors.reset}`);
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}✅ Multicall withdraw SUCCESS!${colors.reset}`);
      console.log(`${colors.gray}⛽ Gas Used: ${receipt.gasUsed.toString()} (limit: ${tx.gasLimit})${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}❌ Multicall withdraw FAILED! Status: ${receipt.status}${colors.reset}`);
      return false;
    }
  } catch (err) {
    console.log(`${colors.red}❌ Multicall withdraw failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// DYNAMIC DEPOSIT WITH CUSTOM AMOUNT
const dynamicDeposit = async (usdtAmount) => {
  try {
    const amountWei = ethers.utils.parseUnits(usdtAmount.toString(), 6);
    const amountHex = amountWei.toHexString().substring(2).padStart(64, '0');
    
    console.log(`${colors.cyan}📥 Dynamic deposit: ${usdtAmount} USDT${colors.reset}`);
    console.log(`${colors.gray}🔍 Amount hex: ${amountHex}${colors.reset}`);
    
    const walletAddressRaw = wallet.address.toLowerCase().substring(2);
    const walletAddressHex = walletAddressRaw.padStart(40, '0');
    
    // Build dynamic deposit data
    const dynamicDepositData = '0xac9650d8' +
      '0000000000000000000000000000000000000000000000000000000000000020' +
      '0000000000000000000000000000000000000000000000000000000000000001' +
      '0000000000000000000000000000000000000000000000000000000000000020' +
      '0000000000000000000000000000000000000000000000000000000000000064' +
      'f9984acd000000000000000000000000a1538e3a13d2a5b460f1b6e87b493962' +
      'fc791959' + amountHex.substring(0, 56) +
      '000000000000000000000000' + walletAddressHex +
      '00000000000000000000000000000000000000000000000000000000';
    
    const tx = await wallet.sendTransaction({
      to: MULTICALL_ADDRESS,
      data: dynamicDepositData,
      gasLimit: 210000,
      maxPriorityFeePerGas: ethers.utils.parseUnits('3', 'gwei'),
      maxFeePerGas: ethers.utils.parseUnits('4', 'gwei')
    });
    
    console.log(`${colors.green}✅ Dynamic Deposit TX: ${tx.hash}${colors.reset}`);
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}✅ Dynamic deposit SUCCESS! (${usdtAmount} USDT)${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}❌ Dynamic deposit FAILED!${colors.reset}`);
      return false;
    }
  } catch (err) {
    console.log(`${colors.red}❌ Dynamic deposit failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// SMART WITHDRAW (CHECK ACTUAL SHARES)
const smartWithdraw = async () => {
  try {
    console.log(`${colors.cyan}🧠 Smart withdraw (check actual shares)...${colors.reset}`);
    
    // Check vault shares first
    const VAULT_ABI = [
      "function balanceOf(address account) external view returns (uint256)"
    ];
    
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, wallet);
    const vaultShares = await vaultContract.balanceOf(wallet.address);
    
    console.log(`${colors.yellow}🏦 Current vault shares: ${ethers.utils.formatUnits(vaultShares, 6)}${colors.reset}`);
    
    if (vaultShares.eq(0)) {
      console.log(`${colors.red}❌ No vault shares to withdraw!${colors.reset}`);
      return false;
    }
    
    // Use actual shares amount
    const sharesHex = vaultShares.toHexString().substring(2).padStart(64, '0');
    const walletAddressRaw = wallet.address.toLowerCase().substring(2);
    const walletAddressHex = walletAddressRaw.padStart(40, '0');
    
    console.log(`${colors.gray}🔍 Shares hex: ${sharesHex}${colors.reset}`);
    console.log(`${colors.gray}🔍 Wallet hex: ${walletAddressHex}${colors.reset}`);
    
    // Build smart withdraw data with actual shares
    const smartWithdrawData = '0xac9650d8' +
      '0000000000000000000000000000000000000000000000000000000000000020' +
      '0000000000000000000000000000000000000000000000000000000000000001' +
      '0000000000000000000000000000000000000000000000000000000000000020' +
      '0000000000000000000000000000000000000000000000000000000000000084' +
      '0dfe90c0000000000000000000000000a1538e3a13d2a5b460f1b6e87b493962' +
      'fc791959' + sharesHex.substring(0, 56) +
      '000000000000000000000000' + walletAddressHex +
      '000000000000000000000000' + walletAddressHex +
      '00000000000000000000000000000000000000000000000000000000';
    
    const tx = await wallet.sendTransaction({
      to: MULTICALL_ADDRESS,
      data: smartWithdrawData,
      gasLimit: 120000,
      maxPriorityFeePerGas: ethers.utils.parseUnits('3', 'gwei'),
      maxFeePerGas: ethers.utils.parseUnits('4', 'gwei')
    });
    
    console.log(`${colors.green}✅ Smart Withdraw TX: ${tx.hash}${colors.reset}`);
    console.log(`${colors.cyan}🔍 Explorer: https://testnet.monad.xyz/tx/${tx.hash}${colors.reset}`);
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}✅ Smart withdraw SUCCESS!${colors.reset}`);
      console.log(`${colors.gray}⛽ Gas Used: ${receipt.gasUsed.toString()}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}❌ Smart withdraw FAILED! Status: ${receipt.status}${colors.reset}`);
      return false;
    }
  } catch (err) {
    console.log(`${colors.red}❌ Smart withdraw failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// DIAGNOSTIC CHECK
const diagnosticCheck = async () => {
  try {
    console.log(`${colors.cyan}🔍 DIAGNOSTIC CHECK...${colors.reset}`);
    
    // Check basic balances
    const ethBalance = await provider.getBalance(wallet.address);
    const usdtBalance = await usdtContract.balanceOf(wallet.address);
    
    console.log(`${colors.yellow}💰 PHRS Balance: ${ethers.utils.formatEther(ethBalance)}${colors.reset}`);
    console.log(`${colors.yellow}💰 USDT Balance: ${ethers.utils.formatUnits(usdtBalance, 6)}${colors.reset}`);
    
    // Check vault shares
    const VAULT_ABI = [
      "function balanceOf(address account) external view returns (uint256)",
      "function totalSupply() external view returns (uint256)"
    ];
    
    try {
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, wallet);
      const vaultShares = await vaultContract.balanceOf(wallet.address);
      console.log(`${colors.yellow}🏦 Vault Shares: ${ethers.utils.formatUnits(vaultShares, 6)}${colors.reset}`);
      
      const totalSupply = await vaultContract.totalSupply();
      console.log(`${colors.gray}📊 Total Supply: ${ethers.utils.formatUnits(totalSupply, 6)}${colors.reset}`);
    } catch (vaultErr) {
      console.log(`${colors.yellow}⚠️ Cannot check vault shares: ${vaultErr.message}${colors.reset}`);
    }
    
    // Check allowances
    const allowance = await usdtContract.allowance(wallet.address, VAULT_ADDRESS);
    console.log(`${colors.yellow}📝 USDT Allowance: ${ethers.utils.formatUnits(allowance, 6)}${colors.reset}`);
    
    return true;
  } catch (err) {
    console.log(`${colors.red}❌ Diagnostic failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// PERFECT CYCLE (DEPOSIT + SMART WITHDRAW)
const perfectCycle = async (cycles, waitTime) => {
  console.log(`${colors.cyan}💎 PERFECT CYCLE (UPDATED SUCCESSFUL PATTERNS)${colors.reset}`);
  console.log(`${colors.gray}Cycles: ${cycles} | Wait: ${waitTime}s between operations${colors.reset}\n`);
  
  let successDeposits = 0;
  let successWithdraws = 0;
  let totalTxCount = 0;
  
  for (let i = 1; i <= cycles; i++) {
    console.log(`\n${colors.cyan}=== PERFECT CYCLE ${i}/${cycles} ===${colors.reset}`);
    
    // Quick diagnostic
    await diagnosticCheck();
    
    // 1. UPDATED DEPOSIT
    console.log(`${colors.cyan}📥 [${i}] Executing updated deposit pattern...${colors.reset}`);
    const depositSuccess = await multicallDeposit();
    totalTxCount++;
    
    if (depositSuccess) {
      successDeposits++;
      console.log(`${colors.green}✅ Cycle ${i} deposit SUCCESS! (${successDeposits}/${i})${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Cycle ${i} deposit FAILED!${colors.reset}`);
      continue; // Skip withdraw if deposit failed
    }
    
    // Wait between operations
    console.log(`${colors.gray}⏳ Waiting ${waitTime}s before withdraw...${colors.reset}`);
    await new Promise(r => setTimeout(r, waitTime * 1000));
    
    // 2. UPDATED SMART WITHDRAW
    console.log(`${colors.cyan}📤 [${i}] Executing updated withdraw pattern...${colors.reset}`);
    const withdrawSuccess = await smartWithdraw();
    totalTxCount++;
    
    if (withdrawSuccess) {
      successWithdraws++;
      console.log(`${colors.green}✅ Cycle ${i} withdraw SUCCESS! (${successWithdraws}/${i})${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Cycle ${i} withdraw FAILED!${colors.reset}`);
      
      // Try fixed pattern withdraw as fallback
      console.log(`${colors.yellow}🔄 [${i}] Trying fixed pattern withdraw...${colors.reset}`);
      const fixedWithdrawSuccess = await multicallWithdraw();
      if (fixedWithdrawSuccess) {
        successWithdraws++;
        console.log(`${colors.green}✅ Cycle ${i} fixed withdraw SUCCESS!${colors.reset}`);
      }
    }
    
    // Show progress
    const successRate = ((successDeposits + successWithdraws) / (i * 2) * 100).toFixed(1);
    console.log(`${colors.yellow}📊 Cycle ${i} completed! D:${successDeposits}/${i} W:${successWithdraws}/${i} | Success: ${successRate}%${colors.reset}`);
    console.log(`${colors.gray}🎯 Total TX: ${totalTxCount}${colors.reset}`);
    
    // Wait between cycles
    if (i < cycles) {
      const cycleDelay = 2000 + Math.random() * 3000; // 2-5 seconds
      console.log(`${colors.gray}⏳ Waiting ${cycleDelay/1000}s before next cycle...${colors.reset}`);
      await new Promise(r => setTimeout(r, cycleDelay));
    }
  }
  
  console.log(`\n${colors.green}🎉 PERFECT CYCLE COMPLETED!${colors.reset}`);
  console.log(`${colors.cyan}📊 Final Results:${colors.reset}`);
  console.log(`${colors.green}✅ Successful Deposits: ${successDeposits}/${cycles} (${(successDeposits/cycles*100).toFixed(1)}%)${colors.reset}`);
  console.log(`${colors.green}✅ Successful Withdraws: ${successWithdraws}/${cycles} (${(successWithdraws/cycles*100).toFixed(1)}%)${colors.reset}`);
  console.log(`${colors.cyan}📈 Overall Success Rate: ${((successDeposits + successWithdraws) / (cycles * 2) * 100).toFixed(1)}%${colors.reset}`);
  console.log(`${colors.cyan}🎯 Total Transactions: ${totalTxCount}${colors.reset}`);
  
  // Final balance check
  await diagnosticCheck();
};

// RAPID CYCLE (FAST AUTOMATION)
const rapidCycle = async (count) => {
  console.log(`${colors.cyan}🚀 RAPID CYCLE: ${count} fast cycles${colors.reset}\n`);
  
  let successDeposits = 0;
  let successWithdraws = 0;
  let totalTxCount = 0;
  
  for (let i = 1; i <= count; i++) {
    console.log(`\n${colors.cyan}⚡ [${i}/${count}] Rapid cycle...${colors.reset}`);
    
    // Quick gas check
    const balance = await provider.getBalance(wallet.address);
    if (balance.lt(ethers.utils.parseEther('0.005'))) {
      console.log(`${colors.red}💀 LOW GAS! Stopping rapid cycle...${colors.reset}`);
      break;
    }
    
    // Rapid deposit
    const depositSuccess = await multicallDeposit();
    totalTxCount++;
    
    if (depositSuccess) {
      successDeposits++;
      console.log(`${colors.green}⚡ Rapid deposit ${i} SUCCESS!${colors.reset}`);
    } else {
      console.log(`${colors.red}💀 Rapid deposit ${i} FAILED!${colors.reset}`);
      continue;
    }
    
    // Minimal wait
    const rapidWait = 1000 + Math.random() * 1000; // 1-2 seconds
    await new Promise(r => setTimeout(r, rapidWait));
    
    // Rapid withdraw
    const withdrawSuccess = await smartWithdraw();
    totalTxCount++;
    
    if (withdrawSuccess) {
      successWithdraws++;
      console.log(`${colors.green}⚡ Rapid withdraw ${i} SUCCESS!${colors.reset}`);
    } else {
      console.log(`${colors.red}💀 Rapid withdraw ${i} FAILED!${colors.reset}`);
    }
    
    // Show progress every 5 cycles
    if (i % 5 === 0) {
      const successRate = ((successDeposits + successWithdraws) / (i * 2) * 100).toFixed(1);
      console.log(`${colors.yellow}⚡ Progress: ${i}/${count} | D:${successDeposits} W:${successWithdraws} | Success: ${successRate}%${colors.reset}`);
    }
    
    // Ultra short delay
    if (i < count) {
      const rapidCycleDelay = 500 + Math.random() * 1000; // 0.5-1.5 seconds
      await new Promise(r => setTimeout(r, rapidCycleDelay));
    }
  }
  
  console.log(`\n${colors.green}🚀 RAPID CYCLE COMPLETED!${colors.reset}`);
  console.log(`${colors.cyan}📊 Results: D:${successDeposits}/${count} W:${successWithdraws}/${count} | TX:${totalTxCount}${colors.reset}`);
};

// NUKE MODE (UNTIL DEATH)
const nukeMode = async () => {
  console.log(`${colors.red}💥 NUKE MODE ACTIVATED!${colors.reset}`);
  console.log(`${colors.red}💀 Will run until completely out of gas!${colors.reset}\n`);
  
  let count = 0;
  let successDeposits = 0;
  let successWithdraws = 0;
  
  while (true) {
    try {
      count++;
      console.log(`\n${colors.red}💥 NUKE CYCLE ${count}${colors.reset}`);
      
      // Critical gas check
      const balance = await provider.getBalance(wallet.address);
      if (balance.lt(ethers.utils.parseEther('0.002'))) {
        console.log(`${colors.red}💀 OUT OF GAS! Nuke mode terminated!${colors.reset}`);
        break;
      }
      
      // Nuke deposit
      const depositSuccess = await multicallDeposit();
      if (depositSuccess) {
        successDeposits++;
        console.log(`${colors.green}💥 Nuke deposit ${count} SUCCESS!${colors.reset}`);
      } else {
        console.log(`${colors.red}💀 Nuke deposit ${count} FAILED!${colors.reset}`);
        continue;
      }
      
      // Minimal wait
      await new Promise(r => setTimeout(r, 800));
      
      // Nuke withdraw
      const withdrawSuccess = await smartWithdraw();
      if (withdrawSuccess) {
        successWithdraws++;
        console.log(`${colors.green}💥 Nuke withdraw ${count} SUCCESS!${colors.reset}`);
      } else {
        console.log(`${colors.red}💀 Nuke withdraw ${count} FAILED!${colors.reset}`);
      }
      
      // Show stats every 3 cycles
      if (count % 3 === 0) {
        const successRate = ((successDeposits + successWithdraws) / (count * 2) * 100).toFixed(1);
        console.log(`${colors.red}💥 Nuke Stats: ${count} cycles | D:${successDeposits} W:${successWithdraws} | Success: ${successRate}%${colors.reset}`);
      }
      
      // Ultra minimal delay
      await new Promise(r => setTimeout(r, Math.random() * 800));
      
    } catch (err) {
      console.log(`${colors.red}💀 NUKE CYCLE ${count} ERROR: ${err.message}${colors.reset}`);
      
      if (err.message.includes('insufficient funds') || err.message.includes('gas')) {
        console.log(`${colors.red}💀 OUT OF GAS! Nuke mode terminated!${colors.reset}`);
        break;
      }
      
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  console.log(`\n${colors.red}💀 NUKE MODE COMPLETED!${colors.reset}`);
  console.log(`${colors.cyan}📊 Total: ${count} cycles | D:${successDeposits} W:${successWithdraws}${colors.reset}`);
};

// MAIN FUNCTION
const main = async () => {
  const args = process.argv.slice(2);
  
  console.log(`\n${colors.cyan}📍 Contract Info (UPDATED):${colors.reset}`);
  console.log(`${colors.gray}🏦 Vault: ${VAULT_ADDRESS}${colors.reset}`);
  console.log(`${colors.gray}💰 USDT: ${USDT_ADDRESS}${colors.reset}`);
  console.log(`${colors.gray}🔄 Multicall: ${MULTICALL_ADDRESS} (VaultMulticall_v2)${colors.reset}\n`);
  
  if (args[0] === 'balance') {
    await checkBalances();
  } else if (args[0] === 'diagnostic') {
    await diagnosticCheck();
  } else if (args[0] === 'approve') {
    const amount = args[1] || '100000';
    const amountWei = ethers.utils.parseUnits(amount, 6);
    await approveUSDT(amountWei);
  } else if (args[0] === 'deposit') {
    await multicallDeposit();
  } else if (args[0] === 'withdraw') {
    await smartWithdraw();
  } else if (args[0] === 'fixed-withdraw') {
    await multicallWithdraw();
  } else if (args[0] === 'dynamic-deposit') {
    const amount = parseFloat(args[1]) || 35;
    await dynamicDeposit(amount);
  } else if (args[0] === 'perfect-cycle') {
    const cycles = parseInt(args[1]) || 20;
    const waitTime = parseInt(args[2]) || 5;
    await perfectCycle(cycles, waitTime);
  } else if (args[0] === 'rapid-cycle') {
    const count = parseInt(args[1]) || 50;
    await rapidCycle(count);
  } else if (args[0] === 'nuke-mode') {
    await nukeMode();
  } else {
    console.log(`
${colors.cyan}🎮 UPDATED VAULT AUTOMATION BOT:${colors.reset}
node autostaking.js balance                    - Check balances & vault shares
node autostaking.js diagnostic                - Full diagnostic check
node autostaking.js approve 100000           - Approve 100k USDT

${colors.green}📥📤 SINGLE OPERATIONS:${colors.reset}
node autostaking.js deposit                   - Single deposit (35 USDT pattern)
node autostaking.js withdraw                  - Smart withdraw (actual shares)
node autostaking.js fixed-withdraw           - Fixed withdraw (successful pattern)
node autostaking.js dynamic-deposit 50       - Dynamic deposit (custom amount)

${colors.yellow}🔥 AUTOMATION MODES:${colors.reset}
node autostaking.js perfect-cycle 30 5       - Perfect cycle: 30 cycles, 5s wait
node autostaking.js rapid-cycle 100          - Rapid cycle: 100 fast cycles
node autostaking.js nuke-mode                - Nuke mode: until out of gas

${colors.cyan}📊 PATTERNS BASED ON SUCCESSFUL TRANSACTIONS:${colors.reset}
${colors.gray}✅ Deposit: 0x657136f... (35.001632 USDT, 144k gas)${colors.reset}
${colors.gray}✅ Withdraw: 0x0906474... (34.881081 shares, 92k gas)${colors.reset}
    `);
  }
};

main().catch(console.error);