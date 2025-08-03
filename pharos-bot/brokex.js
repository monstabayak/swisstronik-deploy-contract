require('dotenv').config();
const { ethers } = require('ethers');
const readline = require('readline');

// MONAD TESTNET CONFIG
const RPC_URL = 'https://testnet.dplabs-internal.com';
const CHAIN_ID = 688688;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// BROKEX CONTRACT ADDRESS (from transaction request)
const BROKEX_CONTRACT = '0xde897635870b3dd2e097c09f1cd08841dbc3976a'; // Complete this address

// COLORS FOR CONSOLE
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// SETUP PROVIDER & WALLET
const provider = new ethers.providers.JsonRpcProvider(RPC_URL, CHAIN_ID);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

console.log(`${colors.cyan}🚀 BROKEX AUTO BUY BOT${colors.reset}`);
console.log(`${colors.gray}Wallet: ${wallet.address}${colors.reset}`);
console.log(`${colors.gray}Contract: ${BROKEX_CONTRACT}${colors.reset}\n`);

// CHECK BALANCE
const checkBalance = async () => {
  try {
    const balance = await provider.getBalance(wallet.address);
    console.log(`${colors.green}💰 Balance: ${ethers.utils.formatEther(balance)} PHRS${colors.reset}`);
    return balance;
  } catch (err) {
    console.log(`${colors.red}❌ Balance check failed: ${err.message}${colors.reset}`);
    return null;
  }
};

// ORIGINAL BUY TRANSACTION (from transaction request)
const originalBuyTransaction = async () => {
  try {
    console.log(`${colors.cyan}📈 ORIGINAL BUY TRANSACTION...${colors.reset}`);
    
    // EXACT DATA dari transaction request yang lu kasih
    const buyData = '0xb0b6a2500000000000000000000000000000000000000000000000000000000000001779000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000190000000000000000000000000000000000000000000000011e7002a50410000000000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000008ac7230489e80000000000000000000000000000000000000000000000000001a055690d9db80000';
    
    console.log(`${colors.gray}🔍 Data: ${buyData.substring(0, 50)}...${colors.reset}`);
    console.log(`${colors.gray}🔍 Length: ${buyData.length} chars${colors.reset}`);
    
    const tx = await wallet.sendTransaction({
      to: BROKEX_CONTRACT,
      data: buyData,
      gasLimit: 300000,
      maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei'),
      maxFeePerGas: ethers.utils.parseUnits('4', 'gwei')
    });
    
    console.log(`${colors.green}✅ Buy TX: ${tx.hash}${colors.reset}`);
    console.log(`${colors.cyan}🔍 Explorer: https://testnet.monad.xyz/tx/${tx.hash}${colors.reset}`);
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}✅ Buy transaction SUCCESS!${colors.reset}`);
      console.log(`${colors.gray}⛽ Gas Used: ${receipt.gasUsed.toString()}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}❌ Buy transaction FAILED!${colors.reset}`);
      return false;
    }
  } catch (err) {
    console.log(`${colors.red}❌ Buy transaction failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// PARSE TRANSACTION DATA
const parseTransactionData = () => {
  const data = '0xb0b6a2500000000000000000000000000000000000000000000000000000000000001779000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000190000000000000000000000000000000000000000000000011e7002a50410000000000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000008ac7230489e80000000000000000000000000000000000000000000000000001a055690d9db80000';
  
  console.log(`${colors.cyan}🔍 PARSING TRANSACTION DATA...${colors.reset}`);
  
  // Break down the data
  let pos = 0;
  const methodId = data.substring(pos, pos + 10); pos += 10;
  console.log(`${colors.gray}Method ID: ${methodId}${colors.reset}`);
  
  const param1 = data.substring(pos, pos + 64); pos += 64;
  const param2 = data.substring(pos, pos + 64); pos += 64;
  const param3 = data.substring(pos, pos + 64); pos += 64;
  const param4 = data.substring(pos, pos + 64); pos += 64;
  const param5 = data.substring(pos, pos + 64); pos += 64;
  const param6 = data.substring(pos, pos + 64); pos += 64;
  const param7 = data.substring(pos, pos + 64); pos += 64;
  
  console.log(`${colors.gray}Param 1: ${param1} = ${parseInt(param1, 16)}${colors.reset}`);
  console.log(`${colors.gray}Param 2: ${param2} = ${parseInt(param2, 16)}${colors.reset}`);
  console.log(`${colors.gray}Param 3: ${param3} = ${parseInt(param3, 16)}${colors.reset}`);
  console.log(`${colors.gray}Param 4: ${param4} = ${parseInt(param4, 16)} wei${colors.reset}`);
  console.log(`${colors.gray}Param 5: ${param5} = ${parseInt(param5, 16)}${colors.reset}`);
  console.log(`${colors.gray}Param 6: ${param6} = ${parseInt(param6, 16)} wei${colors.reset}`);
  console.log(`${colors.gray}Param 7: ${param7} = ${parseInt(param7, 16)} wei${colors.reset}`);
  
  return {
    methodId,
    params: [param1, param2, param3, param4, param5, param6, param7]
  };
};

// DYNAMIC BUY WITH VARIATIONS
const dynamicBuyTransaction = async (multiplier = 1) => {
  try {
    console.log(`${colors.cyan}📈 DYNAMIC BUY (${multiplier}x multiplier)...${colors.reset}`);
    
    const methodId = '0xb0b6a250';
    
    // Base parameters from original transaction
    const baseParams = [
      '0000000000000000000000000000000000000000000000000000000000001779', // param1: 6009
      '0000000000000000000000000000000000000000000000000000000000000001', // param2: 1
      '0000000000000000000000000000000000000000000000000000000000000019', // param3: 25
      '0000000000000000000000000000000000000000000000011e7002a504100000', // param4: amount
      '0000000000000000000000000000000000000000000000000000000000989680', // param5: 10000000
      '0000000000000000000000000000000000000000000000008ac7230489e80000', // param6: amount
      '0000000000000000000000000000000000000000000000001a055690d9db80000'  // param7: amount
    ];
    
    // Apply multiplier to amount parameters (4, 6, 7)
    const newParams = [...baseParams];
    
    if (multiplier !== 1) {
      // Multiply param4 (main amount)
      const param4Value = parseInt(baseParams[3], 16);
      const newParam4 = (param4Value * multiplier).toString(16).padStart(64, '0');
      newParams[3] = newParam4;
      
      // Multiply param6
      const param6Value = parseInt(baseParams[5], 16);
      const newParam6 = (param6Value * multiplier).toString(16).padStart(64, '0');
      newParams[5] = newParam6;
      
      // Multiply param7
      const param7Value = parseInt(baseParams[6], 16);
      const newParam7 = (param7Value * multiplier).toString(16).padStart(64, '0');
      newParams[6] = newParam7;
      
      console.log(`${colors.yellow}🔄 Applied ${multiplier}x multiplier to amount parameters${colors.reset}`);
    }
    
    const buyData = methodId + newParams.join('');
    
    console.log(`${colors.gray}🔍 Dynamic data: ${buyData.substring(0, 50)}...${colors.reset}`);
    console.log(`${colors.gray}🔍 Length: ${buyData.length} chars${colors.reset}`);
    
    const tx = await wallet.sendTransaction({
      to: BROKEX_CONTRACT,
      data: buyData,
      gasLimit: 300000,
      maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei'),
      maxFeePerGas: ethers.utils.parseUnits('4', 'gwei')
    });
    
    console.log(`${colors.green}✅ Dynamic Buy TX: ${tx.hash}${colors.reset}`);
    console.log(`${colors.cyan}🔍 Explorer: https://testnet.monad.xyz/tx/${tx.hash}${colors.reset}`);
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}✅ Dynamic buy SUCCESS!${colors.reset}`);
      console.log(`${colors.gray}⛽ Gas Used: ${receipt.gasUsed.toString()}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}❌ Dynamic buy FAILED!${colors.reset}`);
      return false;
    }
  } catch (err) {
    console.log(`${colors.red}❌ Dynamic buy failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// RAPID BUY MODE
const rapidBuyMode = async (count = 10) => {
  try {
    console.log(`${colors.cyan}🚀 RAPID BUY MODE (${count} transactions)...${colors.reset}`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < count; i++) {
      console.log(`${colors.gray}[${i + 1}/${count}] Rapid buy...${colors.reset}`);
      
      // Alternate between original and dynamic buy
      const success = i % 2 === 0 ? 
        await originalBuyTransaction() : 
        await dynamicBuyTransaction(0.8 + Math.random() * 0.4); // 0.8x - 1.2x random multiplier
      
      if (success) {
        successCount++;
        console.log(`${colors.green}✅ Success ${successCount}/${i + 1}${colors.reset}`);
      } else {
        failCount++;
        console.log(`${colors.red}❌ Failed ${failCount}/${i + 1}${colors.reset}`);
      }
      
      // Short delay between transactions
      if (i < count - 1) {
        const delay = 500 + Math.random() * 1000; // 0.5-1.5s random delay
        console.log(`${colors.gray}⏳ Waiting ${(delay/1000).toFixed(1)}s...${colors.reset}`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
    
    console.log(`${colors.cyan}📊 RAPID BUY SUMMARY:${colors.reset}`);
    console.log(`${colors.green}✅ Success: ${successCount}/${count}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${failCount}/${count}${colors.reset}`);
    console.log(`${colors.yellow}📈 Success rate: ${((successCount/count)*100).toFixed(1)}%${colors.reset}`);
    
  } catch (err) {
    console.log(`${colors.red}❌ Rapid buy mode failed: ${err.message}${colors.reset}`);
  }
};

// AUTO BUY WITH STRATEGY
const autoBuyStrategy = async (targetCount = 50, interval = 3000) => {
  try {
    console.log(`${colors.cyan}🎯 AUTO BUY STRATEGY...${colors.reset}`);
    console.log(`${colors.gray}Target: ${targetCount} transactions${colors.reset}`);
    console.log(`${colors.gray}Interval: ${interval/1000}s between transactions${colors.reset}\n`);
    
    let successCount = 0;
    let failCount = 0;
    const startTime = Date.now();
    
    for (let i = 0; i < targetCount; i++) {
      console.log(`${colors.cyan}=== Buy ${i + 1}/${targetCount} ===${colors.reset}`);
      
      // Check balance every 10 transactions
      if (i % 10 === 0) {
        const balance = await checkBalance();
        if (balance && balance.lt(ethers.utils.parseEther('0.01'))) {
          console.log(`${colors.red}⚠️ Low balance! Stopping auto buy...${colors.reset}`);
          break;
        }
      }
      
      // Strategy: Mix different buy types
      let success = false;
      
      if (i % 5 === 0) {
        // Every 5th transaction: original buy
        success = await originalBuyTransaction();
      } else if (i % 3 === 0) {
        // Every 3rd transaction: dynamic buy with random multiplier
        const multiplier = 0.5 + Math.random() * 1.0; // 0.5x - 1.5x
        success = await dynamicBuyTransaction(multiplier);
      } else {
        // Regular: original buy
        success = await originalBuyTransaction();
      }
      
      if (success) {
        successCount++;
        console.log(`${colors.green}✅ Buy ${i + 1} SUCCESS! (${successCount}/${i + 1})${colors.reset}`);
      } else {
        failCount++;
        console.log(`${colors.red}❌ Buy ${i + 1} FAILED! (${failCount}/${i + 1})${colors.reset}`);
      }
      
      // Wait before next transaction
      if (i < targetCount - 1) {
        const randomDelay = interval + (Math.random() * 1000 - 500); // ±0.5s variation
        console.log(`${colors.gray}⏳ Waiting ${(randomDelay/1000).toFixed(1)}s for next buy...\n${colors.reset}`);
        await new Promise(r => setTimeout(r, randomDelay));
      }
    }
    
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    
    console.log(`${colors.cyan}🏁 AUTO BUY STRATEGY COMPLETE!${colors.reset}`);
    console.log(`${colors.green}✅ Successful: ${successCount}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${failCount}${colors.reset}`);
    console.log(`${colors.yellow}📈 Success rate: ${((successCount/(successCount+failCount))*100).toFixed(1)}%${colors.reset}`);
    console.log(`${colors.gray}⏱️ Total time: ${totalTime.toFixed(1)}s${colors.reset}`);
    console.log(`${colors.gray}📊 Average: ${(totalTime/(successCount+failCount)).toFixed(1)}s per transaction${colors.reset}`);
    
  } catch (err) {
    console.log(`${colors.red}❌ Auto buy strategy failed: ${err.message}${colors.reset}`);
  }
};

// NUKE BUY MODE (UNLIMITED)
const nukeBuyMode = async () => {
  console.log(`${colors.red}💥 NUKE BUY MODE - UNLIMITED UNTIL DEATH!${colors.reset}`);
  console.log(`${colors.yellow}⚠️ This will keep buying until stopped or wallet is empty!${colors.reset}`);
  console.log(`${colors.gray}Press Ctrl+C to stop at any time...${colors.reset}\n`);
  
  let totalBuys = 0;
  let successCount = 0;
  let failCount = 0;
  const startTime = Date.now();
  
  try {
    while (true) {
      totalBuys++;
      console.log(`${colors.red}💥 NUKE BUY #${totalBuys}${colors.reset}`);
      
      // Check balance every 5 buys
      if (totalBuys % 5 === 0) {
        const balance = await checkBalance();
        if (balance && balance.lt(ethers.utils.parseEther('0.005'))) {
          console.log(`${colors.red}💀 WALLET DEPLETED! NUKE COMPLETE!${colors.reset}`);
          break;
        }
      }
      
      // Random strategy
      const strategy = Math.random();
      let success = false;
      
      if (strategy < 0.6) {
        success = await originalBuyTransaction();
      } else {
        const multiplier = 0.3 + Math.random() * 1.4; // 0.3x - 1.7x
        success = await dynamicBuyTransaction(multiplier);
      }
      
      if (success) {
        successCount++;
        console.log(`${colors.green}✅ NUKE SUCCESS! (${successCount}/${totalBuys})${colors.reset}`);
      } else {
        failCount++;
        console.log(`${colors.red}❌ NUKE FAILED! (${failCount}/${totalBuys})${colors.reset}`);
      }
      
      // Fast delay for maximum spam
      const delay = 200 + Math.random() * 300; // 0.2-0.5s
      await new Promise(r => setTimeout(r, delay));
    }
  } catch (err) {
    console.log(`${colors.red}💥 NUKE INTERRUPTED: ${err.message}${colors.reset}`);
  }
  
  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000;
  
  console.log(`${colors.red}💥 NUKE BUY COMPLETE!${colors.reset}`);
  console.log(`${colors.cyan}📊 NUKE STATS:${colors.reset}`);
  console.log(`${colors.green}✅ Successful: ${successCount}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failCount}${colors.reset}`);
  console.log(`${colors.yellow}💥 Total nukes: ${totalBuys}${colors.reset}`);
  console.log(`${colors.gray}⏱️ Nuke time: ${totalTime.toFixed(1)}s${colors.reset}`);
  console.log(`${colors.gray}🚀 Nuke rate: ${(totalBuys/totalTime*60).toFixed(1)} buys/minute${colors.reset}`);
};

// ADD TOKEN FUNCTIONS
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// SMART CONTRACT DIAGNOSTICS
const diagnoseContract = async () => {
  try {
    console.log(`${colors.cyan}🔍 DIAGNOSING BROKEX CONTRACT...${colors.reset}`);
    
    // Try to get contract info
    const code = await provider.getCode(BROKEX_CONTRACT);
    console.log(`${colors.gray}Contract code length: ${code.length} chars${colors.reset}`);
    
    if (code === '0x') {
      console.log(`${colors.red}❌ Contract not found at address!${colors.reset}`);
      return false;
    }
    
    console.log(`${colors.green}✅ Contract exists${colors.reset}`);
    
    // Parse the successful transaction to understand what we need
    console.log(`${colors.cyan}🔍 SUCCESSFUL TX ANALYSIS:${colors.reset}`);
    console.log(`${colors.gray}TX Hash: 0xde27af8a6bc5d7031e3830c0d5db5135da7e0333c90f0364736c136c649b7ea3${colors.reset}`);
    console.log(`${colors.gray}Gas Used: 438,903 (our limit: 300,000) ❌${colors.reset}`);
    console.log(`${colors.gray}Token Transfer: 1 Unknown Token → 10 BXL Token${colors.reset}`);
    
    return true;
  } catch (err) {
    console.log(`${colors.red}❌ Contract diagnosis failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// IMPROVED BUY WITH HIGHER GAS
const improvedBuyTransaction = async () => {
  try {
    console.log(`${colors.cyan}📈 IMPROVED BUY (Higher Gas + Better Handling)...${colors.reset}`);
    
    // EXACT DATA dari transaction berhasil
    const buyData = '0xb0b6a2500000000000000000000000000000000000000000000000000000000000001779000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000190000000000000000000000000000000000000000000000011e7002a50410000000000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000008ac7230489e80000000000000000000000000000000000000000000000000001a055690d9db80000';
    
    console.log(`${colors.gray}🔍 Data: ${buyData.substring(0, 50)}...${colors.reset}`);
    console.log(`${colors.gray}🔍 Length: ${buyData.length} chars${colors.reset}`);
    
    // HIGHER GAS LIMIT based on successful TX
    const tx = await wallet.sendTransaction({
      to: BROKEX_CONTRACT,
      data: buyData,
      gasLimit: 500000, // ✅ Increased from 300k to 500k
      maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei'),
      maxFeePerGas: ethers.utils.parseUnits('4', 'gwei')
    });
    
    console.log(`${colors.green}✅ Improved Buy TX: ${tx.hash}${colors.reset}`);
    console.log(`${colors.cyan}🔍 Explorer: https://testnet.monad.xyz/tx/${tx.hash}${colors.reset}`);
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}✅ Improved buy SUCCESS!${colors.reset}`);
      console.log(`${colors.gray}⛽ Gas Used: ${receipt.gasUsed.toString()}/${receipt.gasLimit.toString()}${colors.reset}`);
      console.log(`${colors.gray}📊 Gas Efficiency: ${((receipt.gasUsed.toNumber()/receipt.gasLimit.toNumber())*100).toFixed(1)}%${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}❌ Improved buy FAILED! Status: ${receipt.status}${colors.reset}`);
      return false;
    }
  } catch (err) {
    console.log(`${colors.red}❌ Improved buy failed: ${err.message}${colors.reset}`);
    
    // Enhanced error handling
    if (err.message.includes('insufficient funds')) {
      console.log(`${colors.yellow}💡 Suggestion: Check PHRS balance for gas${colors.reset}`);
    } else if (err.message.includes('execution reverted')) {
      console.log(`${colors.yellow}💡 Suggestion: Transaction reverted, check token allowances${colors.reset}`);
    } else if (err.message.includes('gas')) {
      console.log(`${colors.yellow}💡 Suggestion: Try higher gas limit${colors.reset}`);
    }
    
    return false;
  }
};

// SMART BUY WITH AUTO GAS ESTIMATION
const smartBuyTransaction = async () => {
  try {
    console.log(`${colors.cyan}📈 SMART BUY (Auto Gas Estimation)...${colors.reset}`);
    
    const buyData = '0xb0b6a2500000000000000000000000000000000000000000000000000000000000001779000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000190000000000000000000000000000000000000000000000011e7002a50410000000000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000008ac7230489e80000000000000000000000000000000000000000000000000001a055690d9db80000';
    
    // Auto estimate gas
    let estimatedGas;
    try {
      estimatedGas = await provider.estimateGas({
        to: BROKEX_CONTRACT,
        from: wallet.address,
        data: buyData
      });
      console.log(`${colors.gray}🔍 Estimated gas: ${estimatedGas.toString()}${colors.reset}`);
    } catch (estimateErr) {
      console.log(`${colors.yellow}⚠️ Gas estimation failed: ${estimateErr.message}${colors.reset}`);
      console.log(`${colors.gray}🔧 Using safe default: 500,000${colors.reset}`);
      estimatedGas = ethers.BigNumber.from('500000');
    }
    
    // Add 20% buffer to estimated gas
    const gasLimit = estimatedGas.mul(120).div(100);
    console.log(`${colors.gray}🔧 Gas limit (with buffer): ${gasLimit.toString()}${colors.reset}`);
    
    const tx = await wallet.sendTransaction({
      to: BROKEX_CONTRACT,
      data: buyData,
      gasLimit: gasLimit,
      maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei'),
      maxFeePerGas: ethers.utils.parseUnits('4', 'gwei')
    });
    
    console.log(`${colors.green}✅ Smart Buy TX: ${tx.hash}${colors.reset}`);
    console.log(`${colors.cyan}🔍 Explorer: https://testnet.monad.xyz/tx/${tx.hash}${colors.reset}`);
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}✅ Smart buy SUCCESS!${colors.reset}`);
      console.log(`${colors.gray}⛽ Gas Used: ${receipt.gasUsed.toString()}/${gasLimit.toString()}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}❌ Smart buy FAILED!${colors.reset}`);
      return false;
    }
  } catch (err) {
    console.log(`${colors.red}❌ Smart buy failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// MINIMAL BUY TEST (exactly like successful TX)
const minimalBuyTest = async () => {
  try {
    console.log(`${colors.cyan}📈 MINIMAL BUY TEST (Exact Copy of Successful TX)...${colors.reset}`);
    
    // EXACT COPY dari TX yang berhasil
    const exactData = '0xb0b6a2500000000000000000000000000000000000000000000000000000000000001779000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000190000000000000000000000000000000000000000000000011e7002a50410000000000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000008ac7230489e80000000000000000000000000000000000000000000000000001a055690d9db80000';
    
    // EXACT GAS dari TX yang berhasil: 462,209 limit + buffer
    const exactGasLimit = 570000; // Slightly higher than successful TX
    
    console.log(`${colors.gray}🔍 Using exact gas limit: ${exactGasLimit}${colors.reset}`);
    console.log(`${colors.gray}🔍 Data matches successful TX: ✅${colors.reset}`);
    
    const tx = await wallet.sendTransaction({
      to: BROKEX_CONTRACT,
      data: exactData,
      gasLimit: exactGasLimit,
      maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei'),
      maxFeePerGas: ethers.utils.parseUnits('2', 'gwei') // Same as successful TX
    });
    
    console.log(`${colors.green}✅ Minimal Test TX: ${tx.hash}${colors.reset}`);
    console.log(`${colors.cyan}🔍 Explorer: https://testnet.monad.xyz/tx/${tx.hash}${colors.reset}`);
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}✅ MINIMAL TEST SUCCESS!${colors.reset}`);
      console.log(`${colors.gray}⛽ Gas Used: ${receipt.gasUsed.toString()}${colors.reset}`);
      console.log(`${colors.green}🎉 Now we know the exact working parameters!${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}❌ Minimal test failed with status: ${receipt.status}${colors.reset}`);
      return false;
    }
  } catch (err) {
    console.log(`${colors.red}❌ Minimal test failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// UPDATE USER OPTIONS
const askUserChoice = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    console.log(`${colors.cyan}🎯 BROKEX AUTO BUY OPTIONS (IMPROVED):${colors.reset}`);
    console.log(`${colors.gray}1. Diagnose contract${colors.reset}`);
    console.log(`${colors.gray}2. Minimal buy test (exact copy)${colors.reset}`);
    console.log(`${colors.gray}3. Improved buy (higher gas)${colors.reset}`);
    console.log(`${colors.gray}4. Smart buy (auto gas estimation)${colors.reset}`);
    console.log(`${colors.gray}5. Parse transaction data${colors.reset}`);
    console.log(`${colors.gray}6. Rapid buy mode (10 improved buys)${colors.reset}`);
    console.log(`${colors.gray}7. Auto buy strategy (improved)${colors.reset}`);
    console.log(`${colors.gray}8. Custom auto buy${colors.reset}\n`);
    
    rl.question(`${colors.yellow}Choose option (1-8): ${colors.reset}`, (answer) => {
      rl.close();
      resolve(parseInt(answer));
    });
  });
};

// ADD MISSING IMPROVED FUNCTIONS

// RAPID BUY MODE IMPROVED
const rapidBuyModeImproved = async (count = 90) => {
  try {
    console.log(`${colors.cyan}🚀 RAPID BUY MODE IMPROVED (${count} transactions)...${colors.reset}`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < count; i++) {
      console.log(`${colors.gray}[${i + 1}/${count}] Rapid improved buy...${colors.reset}`);
      
      // Alternate between improved buy strategies
      let success = false;
      
      if (i % 3 === 0) {
        // Every 3rd: minimal buy test
        success = await minimalBuyTest();
      } else if (i % 2 === 0) {
        // Every 2nd: smart buy
        success = await minimalBuyTest();
      } else {
        // Regular: improved buy
        success = await minimalBuyTest();
      }
      
      if (success) {
        successCount++;
        console.log(`${colors.green}✅ Rapid Success ${successCount}/${i + 1}${colors.reset}`);
      } else {
        failCount++;
        console.log(`${colors.red}❌ Rapid Failed ${failCount}/${i + 1}${colors.reset}`);
      }
      
      // Short delay between transactions
      if (i < count - 1) {
        const delay = 300 + Math.random() * 500; // 0.3-0.8s random delay
        console.log(`${colors.gray}⏳ Waiting ${(delay/1000).toFixed(1)}s...${colors.reset}`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
    
    console.log(`${colors.cyan}📊 RAPID BUY IMPROVED SUMMARY:${colors.reset}`);
    console.log(`${colors.green}✅ Success: ${successCount}/${count}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${failCount}/${count}${colors.reset}`);
    console.log(`${colors.yellow}📈 Success rate: ${((successCount/count)*100).toFixed(1)}%${colors.reset}`);
    
  } catch (err) {
    console.log(`${colors.red}❌ Rapid buy improved failed: ${err.message}${colors.reset}`);
  }
};

// AUTO BUY STRATEGY IMPROVED
const autoBuyStrategyImproved = async (targetCount = 50, interval = 3000) => {
  try {
    console.log(`${colors.cyan}🎯 AUTO BUY STRATEGY IMPROVED...${colors.reset}`);
    console.log(`${colors.gray}Target: ${targetCount} transactions${colors.reset}`);
    console.log(`${colors.gray}Interval: ${interval/1000}s between transactions${colors.reset}`);
    console.log(`${colors.gray}Strategy: Using improved gas limits & smart estimation${colors.reset}\n`);
    
    let successCount = 0;
    let failCount = 0;
    const startTime = Date.now();
    
    for (let i = 0; i < targetCount; i++) {
      console.log(`${colors.cyan}=== Improved Buy ${i + 1}/${targetCount} ===${colors.reset}`);
      
      // Check balance every 10 transactions
      if (i % 10 === 0) {
        const balance = await checkBalance();
        if (balance && balance.lt(ethers.utils.parseEther('0.01'))) {
          console.log(`${colors.red}⚠️ Low balance! Stopping auto buy...${colors.reset}`);
          break;
        }
      }
      
      // IMPROVED STRATEGY: Smart rotation of working methods
      let success = false;
      
      if (i % 5 === 0) {
        // Every 5th transaction: minimal buy test (proven to work)
        console.log(`${colors.gray}🎯 Using minimal buy test (proven)...${colors.reset}`);
        success = await minimalBuyTest();
      } else if (i % 3 === 0) {
        // Every 3rd transaction: smart buy with auto gas estimation
        console.log(`${colors.gray}🧠 Using smart buy (auto gas)...${colors.reset}`);
        success = await smartBuyTransaction();
      } else {
        // Regular: improved buy with higher gas
        console.log(`${colors.gray}⚡ Using improved buy (higher gas)...${colors.reset}`);
        success = await improvedBuyTransaction();
      }
      
      if (success) {
        successCount++;
        console.log(`${colors.green}✅ Improved Buy ${i + 1} SUCCESS! (${successCount}/${i + 1})${colors.reset}`);
      } else {
        failCount++;
        console.log(`${colors.red}❌ Improved Buy ${i + 1} FAILED! (${failCount}/${i + 1})${colors.reset}`);
      }
      
      // Dynamic delay based on success rate
      if (i < targetCount - 1) {
        const successRate = successCount / (i + 1);
        let baseDelay = interval;
        
        // If success rate is high, reduce delay
        if (successRate > 0.8) {
          baseDelay = interval * 0.7; // 30% faster
        } else if (successRate < 0.5) {
          baseDelay = interval * 1.3; // 30% slower
        }
        
        const randomDelay = baseDelay + (Math.random() * 1000 - 500); // ±0.5s variation
        console.log(`${colors.gray}⏳ Waiting ${(randomDelay/1000).toFixed(1)}s (success rate: ${(successRate*100).toFixed(1)}%)...\n${colors.reset}`);
        await new Promise(r => setTimeout(r, randomDelay));
      }
    }
    
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    const totalTransactions = successCount + failCount;
    
    console.log(`${colors.cyan}🏁 AUTO BUY STRATEGY IMPROVED COMPLETE!${colors.reset}`);
    console.log(`${colors.green}✅ Successful: ${successCount}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${failCount}${colors.reset}`);
    console.log(`${colors.yellow}📈 Success rate: ${((successCount/totalTransactions)*100).toFixed(1)}%${colors.reset}`);
    console.log(`${colors.gray}⏱️ Total time: ${totalTime.toFixed(1)}s${colors.reset}`);
    console.log(`${colors.gray}📊 Average: ${(totalTime/totalTransactions).toFixed(1)}s per transaction${colors.reset}`);
    console.log(`${colors.cyan}🚀 Buy rate: ${(totalTransactions/totalTime*60).toFixed(1)} buys/minute${colors.reset}`);
    
    // FINAL STATS
    if (successCount > 0) {
      console.log(`${colors.green}🎉 AUTOMATION SUCCESS! ${successCount} buys completed!${colors.reset}`);
    }
    
  } catch (err) {
    console.log(`${colors.red}❌ Auto buy strategy improved failed: ${err.message}${colors.reset}`);
  }
};

// NUKE BUY MODE IMPROVED (ULTIMATE SPAM)
const nukeBuyModeImproved = async () => {
  console.log(`${colors.red}💥 NUKE BUY MODE IMPROVED - ULTIMATE SPAM!${colors.reset}`);
  console.log(`${colors.yellow}⚠️ This will spam buy transactions until wallet is empty!${colors.reset}`);
  console.log(`${colors.gray}Using all improved methods for maximum success rate...${colors.reset}`);
  console.log(`${colors.gray}Press Ctrl+C to stop at any time...${colors.reset}\n`);
  
  let totalBuys = 0;
  let successCount = 0;
  let failCount = 0;
  const startTime = Date.now();
  
  try {
    while (true) {
      totalBuys++;
      console.log(`${colors.red}💥 NUKE IMPROVED #${totalBuys}${colors.reset}`);
      
      // Check balance every 3 buys (more frequent)
      if (totalBuys % 3 === 0) {
        const balance = await checkBalance();
        if (balance && balance.lt(ethers.utils.parseEther('0.003'))) {
          console.log(`${colors.red}💀 WALLET ALMOST EMPTY! NUKE COMPLETE!${colors.reset}`);
          break;
        }
      }
      
      // IMPROVED NUKE STRATEGY - use proven working methods
      let success = false;
      const strategy = Math.random();
      
      if (strategy < 0.4) {
        // 40%: minimal buy test (highest success rate)
        success = await minimalBuyTest();
      } else if (strategy < 0.7) {
        // 30%: smart buy with auto gas
        success = await smartBuyTransaction();
      } else {
        // 30%: improved buy with higher gas
        success = await improvedBuyTransaction();
      }
      
      if (success) {
        successCount++;
        console.log(`${colors.green}✅ NUKE SUCCESS! (${successCount}/${totalBuys})${colors.reset}`);
      } else {
        failCount++;
        console.log(`${colors.red}❌ NUKE FAILED! (${failCount}/${totalBuys})${colors.reset}`);
      }
      
      // Very fast delay for maximum spam
      const delay = 100 + Math.random() * 200; // 0.1-0.3s ultra fast
      await new Promise(r => setTimeout(r, delay));
    }
  } catch (err) {
    console.log(`${colors.red}💥 NUKE IMPROVED INTERRUPTED: ${err.message}${colors.reset}`);
  }
  
  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000;
  
  console.log(`${colors.red}💥 NUKE BUY IMPROVED COMPLETE!${colors.reset}`);
  console.log(`${colors.cyan}📊 ULTIMATE NUKE STATS:${colors.reset}`);
  console.log(`${colors.green}✅ Successful: ${successCount}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failCount}${colors.reset}`);
  console.log(`${colors.yellow}💥 Total nukes: ${totalBuys}${colors.reset}`);
  console.log(`${colors.yellow}📈 Success rate: ${((successCount/totalBuys)*100).toFixed(1)}%${colors.reset}`);
  console.log(`${colors.gray}⏱️ Nuke time: ${totalTime.toFixed(1)}s${colors.reset}`);
  console.log(`${colors.gray}🚀 Nuke rate: ${(totalBuys/totalTime*60).toFixed(1)} buys/minute${colors.reset}`);
  console.log(`${colors.cyan}⚡ Average: ${(totalTime/totalBuys).toFixed(2)}s per nuke${colors.reset}`);
};

// UPDATE USER CHOICES WITH NUKE IMPROVED
// const askUserChoice = () => {
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
//   });

//   return new Promise(resolve => {
//     console.log(`${colors.cyan}🎯 BROKEX AUTO BUY OPTIONS (FULLY IMPROVED):${colors.reset}`);
//     console.log(`${colors.gray}1. Diagnose contract${colors.reset}`);
//     console.log(`${colors.gray}2. Minimal buy test (exact copy) ✅ PROVEN${colors.reset}`);
//     console.log(`${colors.gray}3. Improved buy (higher gas) ✅ PROVEN${colors.reset}`);
//     console.log(`${colors.gray}4. Smart buy (auto gas estimation) ✅ PROVEN${colors.reset}`);
//     console.log(`${colors.gray}5. Parse transaction data${colors.reset}`);
//     console.log(`${colors.gray}6. Rapid buy mode (10 improved buys)${colors.reset}`);
//     console.log(`${colors.gray}7. Auto buy strategy (improved)${colors.reset}`);
//     console.log(`${colors.gray}8. Custom auto buy${colors.reset}`);
//     console.log(`${colors.red}9. NUKE BUY MODE IMPROVED (ultimate spam)${colors.reset}\n`);
    
//     rl.question(`${colors.yellow}Choose option (1-9): ${colors.reset}`, (answer) => {
//       rl.close();
//       resolve(parseInt(answer));
//     });
//   });
// };

// UPDATE MAIN FUNCTION
const main = async () => {
  try {
    await checkBalance();
    console.log('');
    
    const choice = await askUserChoice();
    
    switch (choice) {
      case 1:
        await diagnoseContract();
        break;
        
      case 2:
        await minimalBuyTest();
        await minimalBuyTest();
        await minimalBuyTest();
        await minimalBuyTest();
        await minimalBuyTest();
        break;
        
      case 3:
        await improvedBuyTransaction();
        break;
        
      case 4:
        await smartBuyTransaction();
        break;
        
      case 5:
        parseTransactionData();
        break;
        
      case 6:
        console.log(`${colors.cyan}🚀 Rapid mode with improved settings...${colors.reset}`);
        await rapidBuyModeImproved(90);
        break;
        
      case 7:
        await autoBuyStrategyImproved(50, 3000);
        break;
        
      case 8:
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const count = await new Promise(resolve => {
          rl.question(`${colors.yellow}How many buys? ${colors.reset}`, resolve);
        });
        
        const interval = await new Promise(resolve => {
          rl.question(`${colors.yellow}Interval (seconds)? ${colors.reset}`, resolve);
        });
        
        rl.close();
        await autoBuyStrategyImproved(parseInt(count), parseInt(interval) * 1000);
        break;
        
      case 9:
        await nukeBuyModeImproved();
        break;
        
      default:
        console.log(`${colors.red}Invalid choice!${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ Main error: ${error.message}${colors.reset}`);
  }
};

// RUN THE BOT
main();