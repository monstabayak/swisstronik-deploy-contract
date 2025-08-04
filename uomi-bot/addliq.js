require('dotenv').config();
const { ethers } = require('ethers');
const readline = require('readline');

// UOMI TESTNET CONFIG
const RPC_URL = 'https://finney.uomi.ai';
const CHAIN_ID = 4386;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// CONTRACT ADDRESSES - FROM SUCCESSFUL ADD LIQUIDITY TX
const NONFUNGIBLE_POSITION_MANAGER = '0x26d376829864543004A2f55e7d066Fa6e113b254'; // From successful TX
const WUOMI_ADDRESS = '0x5FCa78E132dF589c1c799F906dC867124a2567b2'; // WUOMI token
const SYN_ADDRESS = '0x2922B2Ca5EB6b02fc5E1EBE57Fc1972eBB99F7e0'; // SYN token

const provider = new ethers.providers.JsonRpcProvider(RPC_URL, CHAIN_ID);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// DEFAULT LIQUIDITY AMOUNTS - FROM SUCCESSFUL TX
const defaultWuomiAmount = 0.1; // ~0.1 WUOMI
const defaultSynAmount = 0.046; // ~0.046 SYN (ratio from successful TX)

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
  "function symbol() external view returns (string)",
  "function name() external view returns (string)"
];

// NONFUNGIBLE POSITION MANAGER ABI (simplified)
const POSITION_MANAGER_ABI = [
  "function mint((address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
  "function positions(uint256 tokenId) external view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string)"
];

const wuomiContract = new ethers.Contract(WUOMI_ADDRESS, TOKEN_ABI, wallet);
const synContract = new ethers.Contract(SYN_ADDRESS, TOKEN_ABI, wallet);
const positionManager = new ethers.Contract(NONFUNGIBLE_POSITION_MANAGER, POSITION_MANAGER_ABI, wallet);

// CHECK BALANCES AND ALLOWANCES
const checkBalances = async () => {
  try {
    console.log(`${colors.cyan}🔍 CHECKING BALANCES AND ALLOWANCES...${colors.reset}`);
    
    // Native UOMI Balance
    const uomiBalance = await provider.getBalance(wallet.address);
    const formattedUomi = ethers.utils.formatEther(uomiBalance);
    console.log(`${colors.yellow}💰 Native UOMI Balance: ${formattedUomi}${colors.reset}`);
    
    // WUOMI Balance
    let wuomiBalance = ethers.BigNumber.from(0);
    try {
      wuomiBalance = await wuomiContract.balanceOf(wallet.address);
      const formattedWuomi = ethers.utils.formatEther(wuomiBalance);
      console.log(`${colors.yellow}💰 WUOMI Balance: ${formattedWuomi}${colors.reset}`);
    } catch (err) {
      console.log(`${colors.gray}💰 WUOMI Balance: 0 (or contract error)${colors.reset}`);
    }
    
    // SYN Balance
    let synBalance = ethers.BigNumber.from(0);
    try {
      synBalance = await synContract.balanceOf(wallet.address);
      const formattedSyn = ethers.utils.formatEther(synBalance);
      console.log(`${colors.yellow}💰 SYN Balance: ${formattedSyn}${colors.reset}`);
    } catch (err) {
      console.log(`${colors.gray}💰 SYN Balance: 0 (or contract error)${colors.reset}`);
    }
    
    // Check Allowances
    try {
      const wuomiAllowance = await wuomiContract.allowance(wallet.address, NONFUNGIBLE_POSITION_MANAGER);
      const synAllowance = await synContract.allowance(wallet.address, NONFUNGIBLE_POSITION_MANAGER);
      
      console.log(`${colors.gray}🔒 WUOMI Allowance: ${ethers.utils.formatEther(wuomiAllowance)}${colors.reset}`);
      console.log(`${colors.gray}🔒 SYN Allowance: ${ethers.utils.formatEther(synAllowance)}${colors.reset}`);
      
      return {
        uomi: parseFloat(formattedUomi),
        wuomi: parseFloat(ethers.utils.formatEther(wuomiBalance)),
        syn: parseFloat(ethers.utils.formatEther(synBalance)),
        wuomiAllowance: parseFloat(ethers.utils.formatEther(wuomiAllowance)),
        synAllowance: parseFloat(ethers.utils.formatEther(synAllowance))
      };
    } catch (err) {
      console.log(`${colors.red}❌ Error checking allowances: ${err.message}${colors.reset}`);
      return {
        uomi: parseFloat(formattedUomi),
        wuomi: parseFloat(ethers.utils.formatEther(wuomiBalance)),
        syn: parseFloat(ethers.utils.formatEther(synBalance)),
        wuomiAllowance: 0,
        synAllowance: 0
      };
    }
    
  } catch (err) {
    console.error(`${colors.red}❌ Balance check failed: ${err.message}${colors.reset}`);
    return null;
  }
};

// APPROVE TOKENS
const approveTokens = async (wuomiAmount, synAmount) => {
  try {
    console.log(`${colors.cyan}🔓 APPROVING TOKENS...${colors.reset}`);
    
    const wuomiAmountWei = ethers.utils.parseEther(wuomiAmount.toString());
    const synAmountWei = ethers.utils.parseEther(synAmount.toString());
    
    // Check current allowances
    const wuomiAllowance = await wuomiContract.allowance(wallet.address, NONFUNGIBLE_POSITION_MANAGER);
    const synAllowance = await synContract.allowance(wallet.address, NONFUNGIBLE_POSITION_MANAGER);
    
    // Approve WUOMI if needed
    if (wuomiAllowance.lt(wuomiAmountWei)) {
      console.log(`${colors.yellow}   🔓 Approving WUOMI...${colors.reset}`);
      const wuomiApproveTx = await wuomiContract.approve(NONFUNGIBLE_POSITION_MANAGER, ethers.constants.MaxUint256);
      await wuomiApproveTx.wait();
      console.log(`${colors.green}   ✅ WUOMI approved!${colors.reset}`);
    } else {
      console.log(`${colors.green}   ✅ WUOMI already approved${colors.reset}`);
    }
    
    // Approve SYN if needed
    if (synAllowance.lt(synAmountWei)) {
      console.log(`${colors.yellow}   🔓 Approving SYN...${colors.reset}`);
      const synApproveTx = await synContract.approve(NONFUNGIBLE_POSITION_MANAGER, ethers.constants.MaxUint256);
      await synApproveTx.wait();
      console.log(`${colors.green}   ✅ SYN approved!${colors.reset}`);
    } else {
      console.log(`${colors.green}   ✅ SYN already approved${colors.reset}`);
    }
    
    return true;
    
  } catch (err) {
    console.error(`${colors.red}❌ Token approval failed: ${err.message}${colors.reset}`);
    return false;
  }
};

// ADD LIQUIDITY FUNCTION
const addLiquidity = async (wuomiAmount = defaultWuomiAmount, synAmount = defaultSynAmount) => {
  try {
    console.log(`${colors.cyan}[💧] ADD LIQUIDITY: ${wuomiAmount} WUOMI + ${synAmount} SYN${colors.reset}`);
    console.log(`${colors.gray}   👤 ${wallet.address}${colors.reset}`);
    console.log(`${colors.gray}   📍 Position Manager: ${NONFUNGIBLE_POSITION_MANAGER}${colors.reset}`);
    
    const wuomiAmountWei = ethers.utils.parseEther(wuomiAmount.toString());
    const synAmountWei = ethers.utils.parseEther(synAmount.toString());
    const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes
    
    console.log(`${colors.gray}   🔍 WUOMI Amount Wei: ${wuomiAmountWei.toString()}${colors.reset}`);
    console.log(`${colors.gray}   🔍 SYN Amount Wei: ${synAmountWei.toString()}${colors.reset}`);
    console.log(`${colors.gray}   🔍 Deadline: ${deadline}${colors.reset}`);
    
    // Determine token order (token0 should be lower address)
    const token0 = WUOMI_ADDRESS.toLowerCase() < SYN_ADDRESS.toLowerCase() ? WUOMI_ADDRESS : SYN_ADDRESS;
    const token1 = WUOMI_ADDRESS.toLowerCase() < SYN_ADDRESS.toLowerCase() ? SYN_ADDRESS : WUOMI_ADDRESS;
    
    const amount0Desired = token0 === WUOMI_ADDRESS ? wuomiAmountWei : synAmountWei;
    const amount1Desired = token0 === WUOMI_ADDRESS ? synAmountWei : wuomiAmountWei;
    
    // Minimum amounts (90% of desired for slippage protection)
    const amount0Min = amount0Desired.mul(90).div(100);
    const amount1Min = amount1Desired.mul(90).div(100);
    
    console.log(`${colors.gray}   🔍 Token0: ${token0} (${token0 === WUOMI_ADDRESS ? 'WUOMI' : 'SYN'})${colors.reset}`);
    console.log(`${colors.gray}   🔍 Token1: ${token1} (${token1 === WUOMI_ADDRESS ? 'WUOMI' : 'SYN'})${colors.reset}`);
    console.log(`${colors.gray}   🔍 Amount0: ${ethers.utils.formatEther(amount0Desired)}${colors.reset}`);
    console.log(`${colors.gray}   🔍 Amount1: ${ethers.utils.formatEther(amount1Desired)}${colors.reset}`);
    
    // Mint parameters (similar to Uniswap V3)
    const mintParams = {
      token0: token0,
      token1: token1,
      fee: 3000, // 0.3% fee tier (common for most pairs)
      tickLower: -887220, // Full range (approximately)
      tickUpper: 887220,  // Full range (approximately)
      amount0Desired: amount0Desired,
      amount1Desired: amount1Desired,
      amount0Min: amount0Min,
      amount1Min: amount1Min,
      recipient: wallet.address,
      deadline: deadline
    };
    
    console.log(`${colors.yellow}   🎯 Using full range liquidity (tick range: -887220 to 887220)${colors.reset}`);
    console.log(`${colors.yellow}   🎯 Fee tier: 0.3% (3000)${colors.reset}`);
    console.log(`${colors.yellow}   🎯 Slippage tolerance: 10%${colors.reset}`);
    
    // Check if we need to send ETH value (if one of the tokens is WETH)
    const ethValue = ethers.utils.parseEther('0.1'); // Send some ETH for wrapping if needed
    
    const tx = {
      gasLimit: 650000, // Higher than successful 388,425
      maxPriorityFeePerGas: ethers.utils.parseUnits('8.21952', 'gwei'), // Same as successful
      maxFeePerGas: ethers.utils.parseUnits('42.46752', 'gwei'), // Same as successful
      value: ethValue // Send ETH for potential wrapping
    };
    
    console.log(`${colors.gray}   🔍 Gas Limit: ${tx.gasLimit}${colors.reset}`);
    console.log(`${colors.gray}   🔍 Priority Fee: ${ethers.utils.formatUnits(tx.maxPriorityFeePerGas, 'gwei')} Gwei${colors.reset}`);
    console.log(`${colors.gray}   🔍 Max Fee: ${ethers.utils.formatUnits(tx.maxFeePerGas, 'gwei')} Gwei${colors.reset}`);
    console.log(`${colors.gray}   🔍 ETH Value: ${ethers.utils.formatEther(tx.value)} UOMI${colors.reset}`);
    
    const mintTx = await positionManager.mint(mintParams, tx);
    console.log(`${colors.green}   ✅ Add Liquidity tx sent: ${mintTx.hash}${colors.reset}`);
    
    const receipt = await mintTx.wait();
    
    if (receipt.status === 1) {
      console.log(`${colors.green}   🎉 ADD LIQUIDITY SUCCESS! ✅${colors.reset}`);
      console.log(`${colors.gray}   ⛽ Gas Used: ${receipt.gasUsed.toString()} / ${tx.gasLimit} (${(receipt.gasUsed/tx.gasLimit*100).toFixed(1)}%)${colors.reset}`);
      console.log(`${colors.gray}   📦 Block: ${receipt.blockNumber}${colors.reset}`);
      console.log(`${colors.cyan}   🔗 Explorer: https://explorer.uomi.ai/tx/${receipt.transactionHash}${colors.reset}`);
      
      // Try to extract token ID from logs
      try {
        const transferEvent = receipt.logs.find(log => 
          log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' && // Transfer topic
          log.address.toLowerCase() === NONFUNGIBLE_POSITION_MANAGER.toLowerCase()
        );
        
        if (transferEvent) {
          const tokenId = ethers.BigNumber.from(transferEvent.topics[3]).toString();
          console.log(`${colors.magenta}   🎫 NFT Token ID: ${tokenId}${colors.reset}`);
        }
      } catch (err) {
        console.log(`${colors.gray}   🎫 Could not extract NFT Token ID from logs${colors.reset}`);
      }
      
      return true;
    } else {
      console.log(`${colors.red}   ❌ ADD LIQUIDITY FAILED! (status 0)${colors.reset}`);
      console.log(`${colors.red}   🔍 Gas Used: ${receipt.gasUsed.toString()}${colors.reset}`);
      return false;
    }
    
  } catch (err) {
    console.error(`${colors.red}   ❌ Add Liquidity error: ${err.message}${colors.reset}`);
    return false;
  }
};

// LIST NFT POSITIONS
const listPositions = async () => {
  try {
    console.log(`${colors.cyan}🎫 LISTING NFT POSITIONS...${colors.reset}`);
    
    const balance = await positionManager.balanceOf(wallet.address);
    console.log(`${colors.yellow}📊 Total NFT Positions: ${balance.toString()}${colors.reset}`);
    
    if (balance.gt(0)) {
      for (let i = 0; i < balance; i++) {
        try {
          const tokenId = await positionManager.tokenOfOwnerByIndex(wallet.address, i);
          console.log(`${colors.green}   🎫 Position #${i + 1}: Token ID ${tokenId.toString()}${colors.reset}`);
          
          // Try to get position details
          try {
            const position = await positionManager.positions(tokenId);
            const token0Symbol = position.token0 === WUOMI_ADDRESS ? 'WUOMI' : 'SYN';
            const token1Symbol = position.token1 === WUOMI_ADDRESS ? 'WUOMI' : 'SYN';
            
            console.log(`${colors.gray}      💧 Pair: ${token0Symbol}/${token1Symbol}${colors.reset}`);
            console.log(`${colors.gray}      💧 Liquidity: ${position.liquidity.toString()}${colors.reset}`);
            console.log(`${colors.gray}      💧 Fee Tier: ${position.fee}${colors.reset}`);
          } catch (err) {
            console.log(`${colors.gray}      ❌ Could not fetch position details${colors.reset}`);
          }
          
        } catch (err) {
          console.log(`${colors.red}   ❌ Error fetching position #${i + 1}: ${err.message}${colors.reset}`);
        }
      }
    } else {
      console.log(`${colors.gray}   📭 No NFT positions found${colors.reset}`);
    }
    
  } catch (err) {
    console.error(`${colors.red}❌ List positions failed: ${err.message}${colors.reset}`);
  }
};

// RAPID ADD LIQUIDITY
const rapidAddLiquidity = async (count, wuomiAmount, synAmount) => {
  console.log(`${colors.magenta}🚀 RAPID ADD LIQUIDITY MODE: ${count} positions${colors.reset}`);
  console.log(`${colors.gray}💧 Each position: ${wuomiAmount} WUOMI + ${synAmount} SYN${colors.reset}\n`);
  
  let successCount = 0;
  
  for (let i = 1; i <= count; i++) {
    console.log(`${colors.cyan}[${i}/${count}] Adding Liquidity Position #${i}...${colors.reset}`);
    
    const success = await addLiquidity(wuomiAmount, synAmount);
    if (success) {
      successCount++;
    }
    
    console.log(`${colors.yellow}📊 Progress: ${successCount}/${i} success (${(successCount/i*100).toFixed(1)}%)${colors.reset}`);
    
    // Random delay (3-7 seconds)
    if (i < count) {
      const delay = 3000 + Math.random() * 4000;
      console.log(`${colors.gray}⏳ Waiting ${(delay/1000).toFixed(1)}s...\n${colors.reset}`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  
  console.log(`\n${colors.green}🎉 RAPID ADD LIQUIDITY COMPLETED!${colors.reset}`);
  console.log(`${colors.green}✅ Final Success Rate: ${successCount}/${count} (${(successCount/count*100).toFixed(1)}%)${colors.reset}`);
  
  return successCount;
};

// MAIN FUNCTION
const main = async () => {
  console.log(`${colors.cyan}🚀 UOMI ADD LIQUIDITY BOT (UOMI TESTNET)${colors.reset}`);
  console.log(`${colors.gray}Wallet: ${wallet.address}${colors.reset}`);
  console.log(`${colors.gray}Network: UOMI Testnet (${CHAIN_ID})${colors.reset}`);
  console.log(`${colors.gray}Position Manager: ${NONFUNGIBLE_POSITION_MANAGER}${colors.reset}\n`);
  
  const args = process.argv.slice(2);
  
  if (args[0] === 'balance') {
    await checkBalances();
    return;
  }
  
  if (args[0] === 'positions') {
    await listPositions();
    return;
  }
  
  if (args[0] === 'approve') {
    const wuomiAmount = parseFloat(args[1]) || defaultWuomiAmount;
    const synAmount = parseFloat(args[2]) || defaultSynAmount;
    await approveTokens(wuomiAmount, synAmount);
    return;
  }
  
  if (args[0] === 'add') {
    const wuomiAmount = parseFloat(args[1]) || defaultWuomiAmount;
    const synAmount = parseFloat(args[2]) || defaultSynAmount;
    
    // Check balances first
    const balances = await checkBalances();
    if (!balances || balances.wuomi < wuomiAmount || balances.syn < synAmount) {
      console.log(`${colors.red}❌ Insufficient token balances!${colors.reset}`);
      return;
    }
    
    // Approve tokens if needed
    await approveTokens(wuomiAmount, synAmount);
    
    // Add liquidity
    await addLiquidity(wuomiAmount, synAmount);
    return;
  }
  
  if (args[0] === 'rapid') {
    const count = parseInt(args[1]) || 3;
    const wuomiAmount = parseFloat(args[2]) || defaultWuomiAmount;
    const synAmount = parseFloat(args[3]) || defaultSynAmount;
    
    // Approve tokens first
    await approveTokens(wuomiAmount * count, synAmount * count);
    
    await rapidAddLiquidity(count, wuomiAmount, synAmount);
    return;
  }
  
  // Interactive mode
  const balances = await checkBalances();
  if (!balances) {
    console.log(`${colors.red}❌ Cannot check balances! Check RPC connection.${colors.reset}`);
    return;
  }
  
  console.log(`\n${colors.green}✅ Ready for Add Liquidity operations!${colors.reset}`);
  console.log(`${colors.gray}Default: ${defaultWuomiAmount} WUOMI + ${defaultSynAmount} SYN${colors.reset}`);
};

// Show help
if (process.argv.length === 2) {
  console.log(`
${colors.cyan}🚀 UOMI ADD LIQUIDITY BOT COMMANDS:${colors.reset}

${colors.green}📊 INFORMATION:${colors.reset}
node uomi_addliquidity.js balance           - Check token balances and allowances
node uomi_addliquidity.js positions         - List current NFT positions

${colors.green}🔓 APPROVALS:${colors.reset}
node uomi_addliquidity.js approve           - Approve default amounts
node uomi_addliquidity.js approve 0.2 0.1   - Approve custom amounts

${colors.green}💧 ADD LIQUIDITY:${colors.reset}
node uomi_addliquidity.js add               - Add liquidity with default amounts
node uomi_addliquidity.js add 0.1 0.05      - Add custom amounts (WUOMI SYN)

${colors.green}🚀 RAPID MODE:${colors.reset}
node uomi_addliquidity.js rapid 3           - Add 3 positions (default amounts)
node uomi_addliquidity.js rapid 5 0.05 0.025 - Add 5 positions (custom amounts)

${colors.cyan}📋 SUCCESSFUL TX PATTERN:${colors.reset}
${colors.gray}✅ Contract: NonfungiblePositionManager${colors.reset}
${colors.gray}✅ Method: mint()${colors.reset}
${colors.gray}✅ Pair: WUOMI/SYN${colors.reset}
${colors.gray}✅ Fee Tier: 0.3% (3000)${colors.reset}
${colors.gray}✅ Range: Full range liquidity${colors.reset}
${colors.gray}✅ NFT: Synthra V3 Positions NFT-V1${colors.reset}

${colors.cyan}🌐 NETWORK INFO:${colors.reset}
${colors.gray}Chain ID: ${CHAIN_ID} (UOMI Testnet)${colors.reset}
${colors.gray}RPC: ${RPC_URL}${colors.reset}
${colors.gray}Explorer: https://explorer.uomi.ai${colors.reset}
  `);
} else {
  main().catch(console.error);
}