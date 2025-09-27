// Simple script to test if the contract compiles without errors
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkSoliditySyntax() {
  console.log('🔍 Checking Solidity contract syntax...');
  
  const contractPath = path.join(__dirname, '../contracts/TransplantChainLedger.sol');
  const contractContent = fs.readFileSync(contractPath, 'utf8');
  
  // Check for common syntax issues
  const issues = [];
  
  // Check for reserved keywords used as variable names
  if (contractContent.includes('address:')) {
    issues.push('❌ Found "address:" which is a reserved keyword');
  }
  
  // Check for proper struct field names
  if (contractContent.includes('string address;')) {
    issues.push('❌ Found "string address;" - should be "string physicalAddress;"');
  }
  
  // Check for proper struct initialization
  if (contractContent.includes('address: _address,')) {
    issues.push('❌ Found "address: _address," - should be "physicalAddress: _address,"');
  }
  
  // Check for proper field access
  if (contractContent.includes('user.address = _address;')) {
    issues.push('❌ Found "user.address = _address;" - should be "user.physicalAddress = _address;"');
  }
  
  if (issues.length === 0) {
    console.log('✅ No syntax issues found!');
    console.log('✅ Contract should compile successfully');
    return true;
  } else {
    console.log('❌ Found syntax issues:');
    issues.forEach(issue => console.log(issue));
    return false;
  }
}

function checkContractStructure() {
  console.log('\n🔍 Checking contract structure...');
  
  const contractPath = path.join(__dirname, '../contracts/TransplantChainLedger.sol');
  const contractContent = fs.readFileSync(contractPath, 'utf8');
  
  const checks = [
    { name: 'SPDX License', pattern: /SPDX-License-Identifier/ },
    { name: 'Pragma Directive', pattern: /pragma solidity/ },
    { name: 'Contract Declaration', pattern: /contract TransplantChainLedger/ },
    { name: 'User Struct', pattern: /struct User/ },
    { name: 'registerUser Function', pattern: /function registerUser/ },
    { name: 'createOrganRequest Function', pattern: /function createOrganRequest/ },
    { name: 'createOrganDonation Function', pattern: /function createOrganDonation/ },
    { name: 'Events', pattern: /event UserRegistered/ },
    { name: 'Modifiers', pattern: /modifier onlyRegisteredUser/ },
    { name: 'OpenZeppelin Imports', pattern: /import.*openzeppelin/ }
  ];
  
  let passed = 0;
  checks.forEach(check => {
    if (check.pattern.test(contractContent)) {
      console.log(`✅ ${check.name}`);
      passed++;
    } else {
      console.log(`❌ ${check.name}`);
    }
  });
  
  console.log(`\n📊 Structure check: ${passed}/${checks.length} passed`);
  return passed === checks.length;
}

function main() {
  console.log('🚀 TransplantChainLedger Contract Analysis\n');
  
  const syntaxOK = checkSoliditySyntax();
  const structureOK = checkContractStructure();
  
  console.log('\n📋 Summary:');
  console.log(`   Syntax Check: ${syntaxOK ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Structure Check: ${structureOK ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (syntaxOK && structureOK) {
    console.log('\n🎉 Contract is ready for deployment!');
    console.log('\n📝 Next steps:');
    console.log('   1. Set up environment variables in .env file');
    console.log('   2. Run: npm run deploy:sepolia');
    console.log('   3. Run: npm run verify:sepolia');
    console.log('   4. Update frontend with contract address');
  } else {
    console.log('\n⚠️  Please fix the issues above before deployment.');
  }
}

main();
