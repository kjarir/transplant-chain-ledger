import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

class PinataUploader {
  constructor() {
    this.apiKey = process.env.PINATA_API_KEY;
    this.secretKey = process.env.PINATA_SECRET_API_KEY;
    this.gateway = 'https://gateway.pinata.cloud/ipfs/';
    
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Pinata API keys not found. Please set PINATA_API_KEY and PINATA_SECRET_API_KEY in your .env file');
    }
  }

  async uploadFile(filePath, metadata = {}) {
    try {
      console.log(`📤 Uploading file: ${filePath}`);
      
      const formData = new FormData();
      const fileStream = fs.createReadStream(filePath);
      
      formData.append('file', fileStream);
      formData.append('pinataMetadata', JSON.stringify({
        name: metadata.name || path.basename(filePath),
        keyvalues: {
          type: metadata.type || 'documentation',
          project: 'transplant-chain-ledger',
          version: metadata.version || '1.0.0',
          ...metadata.keyvalues
        }
      }));
      
      formData.append('pinataOptions', JSON.stringify({
        cidVersion: 0
      }));

      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.secretKey,
          ...formData.getHeaders()
        }
      });

      const { IpfsHash, PinSize, Timestamp } = response.data;
      
      console.log('✅ File uploaded successfully!');
      console.log(`🔗 IPFS Hash: ${IpfsHash}`);
      console.log(`📏 Size: ${PinSize} bytes`);
      console.log(`🌐 Access URL: ${this.gateway}${IpfsHash}`);
      
      return {
        hash: IpfsHash,
        size: PinSize,
        timestamp: Timestamp,
        url: `${this.gateway}${IpfsHash}`
      };
      
    } catch (error) {
      console.error('❌ Upload failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async uploadJSON(data, metadata = {}) {
    try {
      console.log('📤 Uploading JSON data...');
      
      const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        pinataContent: data,
        pinataMetadata: {
          name: metadata.name || 'data.json',
          keyvalues: {
            type: metadata.type || 'json',
            project: 'transplant-chain-ledger',
            ...metadata.keyvalues
          }
        },
        pinataOptions: {
          cidVersion: 0
        }
      }, {
        headers: {
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.secretKey,
          'Content-Type': 'application/json'
        }
      });

      const { IpfsHash, PinSize, Timestamp } = response.data;
      
      console.log('✅ JSON uploaded successfully!');
      console.log(`🔗 IPFS Hash: ${IpfsHash}`);
      console.log(`🌐 Access URL: ${this.gateway}${IpfsHash}`);
      
      return {
        hash: IpfsHash,
        size: PinSize,
        timestamp: Timestamp,
        url: `${this.gateway}${IpfsHash}`
      };
      
    } catch (error) {
      console.error('❌ JSON upload failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async createPDFFromMarkdown(markdownPath) {
    try {
      console.log('📄 Converting Markdown to PDF...');
      
      // For this example, we'll create a simple PDF generation
      // In a real implementation, you might use libraries like puppeteer or pdfkit
      const markdownContent = fs.readFileSync(markdownPath, 'utf8');
      
      // Create a simple HTML version for PDF conversion
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Transplant Chain Ledger Documentation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; }
        h2 { color: #34495e; margin-top: 30px; }
        h3 { color: #7f8c8d; }
        code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background-color: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #3498db; margin: 0; padding-left: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    ${markdownContent.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}
</body>
</html>`;

      const htmlPath = path.join(path.dirname(markdownPath), 'documentation.html');
      fs.writeFileSync(htmlPath, htmlContent);
      
      console.log('📄 HTML version created:', htmlPath);
      
      // For now, we'll upload the HTML version
      // In production, you'd convert this to PDF using puppeteer or similar
      const uploadResult = await this.uploadFile(htmlPath, {
        name: 'transplant-chain-ledger-documentation.html',
        type: 'documentation',
        version: '1.0.0'
      });
      
      return uploadResult;
      
    } catch (error) {
      console.error('❌ PDF generation failed:', error.message);
      throw error;
    }
  }

  async uploadProjectFiles() {
    try {
      console.log('🚀 Starting project file upload to Pinata...');
      
      const uploadResults = [];
      const docsDir = path.join(__dirname, '../docs');
      const contractsDir = path.join(__dirname, '../contracts');
      
      // Upload documentation
      const docPath = path.join(docsDir, 'TransplantChainLedger-Documentation.md');
      if (fs.existsSync(docPath)) {
        const docResult = await this.createPDFFromMarkdown(docPath);
        uploadResults.push({
          type: 'documentation',
          file: 'TransplantChainLedger-Documentation.md',
          ...docResult
        });
      }
      
      // Upload smart contract
      const contractPath = path.join(contractsDir, 'TransplantChainLedger.sol');
      if (fs.existsSync(contractPath)) {
        const contractResult = await this.uploadFile(contractPath, {
          name: 'TransplantChainLedger.sol',
          type: 'smart-contract',
          version: '1.0.0'
        });
        uploadResults.push({
          type: 'smart-contract',
          file: 'TransplantChainLedger.sol',
          ...contractResult
        });
      }
      
      // Create project metadata
      const projectMetadata = {
        name: 'Transplant Chain Ledger',
        description: 'Blockchain-based organ donation and transplant tracking system',
        version: '1.0.0',
        technology: ['Solidity', 'React', 'TypeScript', 'Supabase', 'IPFS'],
        networks: ['Ethereum', 'Polygon', 'BSC'],
        uploadDate: new Date().toISOString(),
        files: uploadResults
      };
      
      const metadataResult = await this.uploadJSON(projectMetadata, {
        name: 'project-metadata.json',
        type: 'metadata'
      });
      
      uploadResults.push({
        type: 'metadata',
        file: 'project-metadata.json',
        ...metadataResult
      });
      
      // Save upload results
      const resultsPath = path.join(__dirname, '../deployments', 'pinata-uploads.json');
      const deploymentsDir = path.dirname(resultsPath);
      if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
      }
      
      fs.writeFileSync(resultsPath, JSON.stringify({
        uploadDate: new Date().toISOString(),
        results: uploadResults
      }, null, 2));
      
      console.log('\n🎉 All files uploaded successfully!');
      console.log('📋 Upload Summary:');
      uploadResults.forEach(result => {
        console.log(`   ${result.type}: ${result.url}`);
      });
      
      console.log(`\n💾 Upload results saved to: ${resultsPath}`);
      
      return uploadResults;
      
    } catch (error) {
      console.error('❌ Project upload failed:', error.message);
      throw error;
    }
  }

  async verifyUpload(hash) {
    try {
      console.log(`🔍 Verifying upload: ${hash}`);
      
      const response = await axios.get(`https://api.pinata.cloud/data/pinList?hashContains=${hash}`, {
        headers: {
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.secretKey
        }
      });
      
      const pins = response.data.rows;
      if (pins.length > 0) {
        console.log('✅ Upload verified successfully!');
        console.log(`📊 Pinned files: ${pins.length}`);
        pins.forEach(pin => {
          console.log(`   - ${pin.metadata.name}: ${pin.ipfs_pin_hash}`);
        });
        return true;
      } else {
        console.log('❌ Upload not found');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Verification failed:', error.response?.data || error.message);
      return false;
    }
  }
}

async function main() {
  try {
    const uploader = new PinataUploader();
    
    // Generate documentation first
    const { generateDocumentation } = await import('./generate-documentation.js');
    const docPath = generateDocumentation();
    
    // Upload all project files
    const results = await uploader.uploadProjectFiles();
    
    // Verify uploads
    console.log('\n🔍 Verifying uploads...');
    for (const result of results) {
      await uploader.verifyUpload(result.hash);
    }
    
    console.log('\n✨ Process completed successfully!');
    
  } catch (error) {
    console.error('❌ Process failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { PinataUploader };
