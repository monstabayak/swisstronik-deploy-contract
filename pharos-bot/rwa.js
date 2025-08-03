require('dotenv').config();
const { ethers } = require('ethers');

const RPC_URL = 'https://api.zan.top/node/v1/pharos/testnet/ed6c5bbb3d9e421d95d932f30f330aba';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const AQUAFLUX_CONTRACT = '0xcc8cf44e196cab28dba2d514dc7353af0efb370e';

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

console.log(`=== FINAL SOLUTION - TOKEN ACQUISITION ONLY ===`);
console.log(`Wallet: ${wallet.address}`);
console.log(`🎯 Strategy: Auto Steps 1-2, Manual Step 3`);

const finalSolution = async () => {
  try {
    console.log('\n💰 Initial balance check...');
    const balance = await provider.getBalance(wallet.address);
    console.log(`MON balance: ${ethers.utils.formatEther(balance)}`);
    
    // Multiple rounds of token acquisition for maximum tokens
    const rounds = 90; // Get more tokens
    
    for (let round = 1; round <= rounds; round++) {
      console.log(`\n🔄 === ROUND ${round}/${rounds} ===`);
      
      // Step 1: Get P+C+S tokens
      console.log(`\n[${round}.1] Getting P+C+S tokens...`);
      const step1Tx = {
        to: AQUAFLUX_CONTRACT,
        data: '0x48c54b9d',
        gasLimit: 500000,
        maxPriorityFeePerGas: ethers.utils.parseUnits('5', 'gwei'),
        maxFeePerGas: ethers.utils.parseUnits('5', 'gwei'),
        value: ethers.utils.parseEther('0'),
      };
      
      try {
        const step1 = await wallet.sendTransaction(step1Tx);
        console.log(`   Tx: ${step1.hash}`);
        
        await step1.wait();
        console.log(`   ✅ Round ${round} Step 1 completed`);
      } catch (err) {
        console.log(`   ❌ Round ${round} Step 1 failed: ${err.message.slice(0, 50)}`);
        if (err.message.includes('already claimed')) {
          console.log(`   💡 Already claimed - skipping to next round`);
          break;
        }
      }
      
      // Wait between steps
      console.log(`   ⏳ Waiting 10 seconds...`);
      await new Promise(r => setTimeout(r, 1000));
      
      // Step 2: Convert to PC tokens
      console.log(`\n[${round}.2] Converting to PC tokens...`);
      const step2Tx = {
        to: AQUAFLUX_CONTRACT,
        data: '0x7905642a0000000000000000000000000000000000000000000000056bc75e2d63100000',
        gasLimit: 500000,
        maxPriorityFeePerGas: ethers.utils.parseUnits('5', 'gwei'),
        maxFeePerGas: ethers.utils.parseUnits('5', 'gwei'),
        value: ethers.utils.parseEther('0'),
      };
      
      try {
        const step2 = await wallet.sendTransaction(step2Tx);
        console.log(`   Tx: ${step2.hash}`);
        
        await step2.wait();
        console.log(`   ✅ Round ${round} Step 2 completed`);
      } catch (err) {
        console.log(`   ❌ Round ${round} Step 2 failed: ${err.message.slice(0, 50)}`);
      }
      
      // Wait between rounds
      if (round < rounds) {
        console.log(`   ⏳ Waiting 15 seconds before next round...`);
        await new Promise(r => setTimeout(r, 1500));
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🎯 TOKEN ACQUISITION COMPLETED!');
    console.log('='.repeat(70));
    console.log('');
    console.log('📋 NEXT STEPS FOR MANUAL NFT MINT:');
    console.log('');
    console.log('1. 📱 Open MetaMask in your browser');
    console.log('2. 🌐 Go to: https://testnet.dplabs-internal.com');
    console.log('3. 🔗 Connect to AquafluxNFT contract:');
    console.log(`   📝 Contract: ${AQUAFLUX_CONTRACT}`);
    console.log('4. 🎨 Find "Mint NFT" or "claimNFT" function');
    console.log('5. ⏳ WAIT AT LEAST 5 MINUTES from last Step 2');
    console.log('6. 🚀 Execute manual mint via MetaMask');
    console.log('');
    console.log('💡 WHY MANUAL WORKS BUT AUTOMATED FAILS:');
    console.log('   - Contract may detect automated vs manual transactions');
    console.log('   - MetaMask adds specific headers/signatures');
    console.log('   - Anti-bot protection mechanisms');
    console.log('   - Specific timing/state requirements');
    console.log('');
    console.log('🔍 ALTERNATIVE: Use browser console method:');
    console.log('');
    console.log('// Paste this in browser console after connecting MetaMask:');
    console.log('const contract = "0xCc8cF44E196CaB28DBA2d514dc7353af0eFb370E";');
    console.log('const timestamp = Math.floor(Date.now() / 1000);');
    console.log('const message = ethereum.selectedAddress.toLowerCase();');
    console.log('const signature = await ethereum.request({');
    console.log('  method: "personal_sign",');
    console.log('  params: [message, ethereum.selectedAddress]');
    console.log('});');
    console.log('// Then use signature in contract call');
    console.log('');
    console.log('='.repeat(70));
    
    // Check final balances
    console.log('\n💰 Final balance check...');
    const finalBalance = await provider.getBalance(wallet.address);
    console.log(`MON balance: ${ethers.utils.formatEther(finalBalance)}`);
    
    // Try to estimate token balances (this might not work but worth trying)
    console.log('\n📊 Attempting to check token balances...');
    try {
      // Try to call a balance function (this is a guess)
      const balanceData = '0x70a08231' + wallet.address.slice(2).padStart(64, '0');
      
      // Check NFT balance
      const nftBalance = await provider.call({
        to: AQUAFLUX_CONTRACT,
        data: balanceData
      });
      console.log(`NFT balance: ${parseInt(nftBalance, 16)}`);
      
    } catch (err) {
      console.log('Cannot determine token balances directly');
    }
    
    console.log('\n🎉 TOKEN ACQUISITION SCRIPT COMPLETED!');
    console.log('📱 Now proceed with MANUAL NFT mint via MetaMask');
    
  } catch (err) {
    console.log(`💥 Fatal error: ${err.message}`);
  }
};

// Run final solution
finalSolution();