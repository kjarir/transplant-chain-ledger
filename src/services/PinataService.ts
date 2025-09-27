import axios from 'axios';

export interface PinataUploadResult {
  hash: string;
  size: number;
  timestamp: string;
  url: string;
}

class PinataService {
  private jwtToken: string;
  private apiKey: string;
  private secretKey: string;
  private gateway: string;

  constructor() {
    this.jwtToken = import.meta.env.VITE_PINATA_JWT || '';
    this.apiKey = import.meta.env.VITE_PINATA_API_KEY || '';
    this.secretKey = import.meta.env.VITE_PINATA_SECRET_API_KEY || '';
    this.gateway = 'https://gateway.pinata.cloud/ipfs/';
    
    console.log('Pinata JWT Token configured:', !!this.jwtToken);
    console.log('Pinata API Key configured:', !!this.apiKey);
    console.log('Pinata Secret Key configured:', !!this.secretKey);
    console.log('JWT Token preview:', this.jwtToken ? this.jwtToken.substring(0, 50) + '...' : 'Not set');
    console.log('API Key preview:', this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'Not set');
    console.log('Secret Key preview:', this.secretKey ? this.secretKey.substring(0, 10) + '...' : 'Not set');
    
    if (!this.jwtToken && (!this.apiKey || !this.secretKey)) {
      console.warn('Pinata credentials not configured. Certificate uploads will be disabled.');
    }
  }

  /**
   * Test Pinata authentication
   */
  async testAuthentication(): Promise<boolean> {
    try {
      let response;
      
      // Try API key + secret first (more reliable)
      if (this.apiKey && this.secretKey) {
        console.log('Testing API key + secret authentication...');
        response = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
          headers: {
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.secretKey
          }
        });
      } else if (this.jwtToken) {
        console.log('Testing JWT authentication...');
        response = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
          headers: {
            'Authorization': `Bearer ${this.jwtToken}`
          }
        });
      } else {
        throw new Error('No credentials available for testing');
      }
      
      console.log('✅ Pinata authentication test successful:', response.data);
      return true;
    } catch (error: any) {
      console.error('❌ Pinata authentication test failed:', error.response?.data || error.message);
      
      // Try fallback method
      if (this.apiKey && this.secretKey && this.jwtToken) {
        console.log('Trying fallback authentication method...');
        try {
          const fallbackResponse = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
            headers: {
              'Authorization': `Bearer ${this.jwtToken}`
            }
          });
          console.log('✅ Pinata fallback authentication successful:', fallbackResponse.data);
          return true;
        } catch (fallbackError: any) {
          console.error('❌ Pinata fallback authentication also failed:', fallbackError.response?.data || fallbackError.message);
        }
      }
      
      return false;
    }
  }

  /**
   * Upload certificate HTML to Pinata IPFS
   */
  async uploadCertificate(certificateHTML: string, metadata: {
    certificateNumber: string;
    patientName: string;
    donorName: string;
    organType: string;
    transactionHash: string;
    patientEmail?: string;
    donorEmail?: string;
  }): Promise<PinataUploadResult> {
    if (!this.jwtToken && (!this.apiKey || !this.secretKey)) {
      throw new Error('Pinata credentials not configured');
    }

    try {
      console.log('📤 Uploading certificate to Pinata IPFS...');
      
      // Test authentication first
      const authTest = await this.testAuthentication();
      if (!authTest) {
        throw new Error('Pinata authentication failed');
      }
      
      // Create FormData
      const formData = new FormData();
      
      // Convert HTML string to Blob
      const htmlBlob = new Blob([certificateHTML], { type: 'text/html' });
      
      console.log('Certificate HTML size:', htmlBlob.size, 'bytes');
      console.log('Certificate HTML preview:', certificateHTML.substring(0, 200) + '...');
      
      formData.append('file', htmlBlob, `certificate-${metadata.certificateNumber}.html`);
      
      // Add minimal metadata to avoid limits
      formData.append('pinataMetadata', JSON.stringify({
        name: `cert-${metadata.certificateNumber}`,
        keyvalues: {
          type: 'cert',
          tx: metadata.transactionHash
        }
      }));
      
      // Add options
      formData.append('pinataOptions', JSON.stringify({
        cidVersion: 0,
        wrapWithDirectory: false
      }));

      // Upload to Pinata - try JWT first, then fallback to API key + secret
      console.log('Uploading to Pinata with JWT token:', this.jwtToken ? 'Token present' : 'Token missing');
      console.log('FormData contents:', Array.from(formData.entries()).map(([key, value]) => ({ key, valueType: typeof value })));
      
      let response;
      if (this.apiKey && this.secretKey) {
        try {
          console.log('Using API key + secret authentication...');
          response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            headers: {
              'pinata_api_key': this.apiKey,
              'pinata_secret_api_key': this.secretKey
              // Content-Type will be set automatically by axios for FormData
            }
          });
        } catch (apiError: any) {
          if (apiError.response?.status === 401 && this.jwtToken) {
            console.log('API key + secret failed, falling back to JWT...');
            response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
              headers: {
                'Authorization': `Bearer ${this.jwtToken}`
                // Content-Type will be set automatically by axios for FormData
              }
            });
          } else {
            throw apiError;
          }
        }
      } else if (this.jwtToken) {
        console.log('Using JWT authentication...');
        response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
          headers: {
            'Authorization': `Bearer ${this.jwtToken}`
            // Content-Type will be set automatically by axios for FormData
          }
        });
      } else {
        throw new Error('No Pinata credentials configured');
      }

      const { IpfsHash, PinSize, Timestamp } = response.data;
      
      const result: PinataUploadResult = {
        hash: IpfsHash,
        size: PinSize,
        timestamp: Timestamp,
        url: `${this.gateway}${IpfsHash}`
      };

      console.log('✅ Certificate uploaded successfully!');
      console.log(`🔗 IPFS Hash: ${IpfsHash}`);
      console.log(`📏 Size: ${PinSize} bytes`);
      console.log(`🌐 Access URL: ${result.url}`);
      
      return result;
      
    } catch (error: any) {
      console.error('❌ Certificate upload failed:', error.response?.data || error.message);
      throw new Error(`Failed to upload certificate: ${error.message}`);
    }
  }

  /**
   * Upload certificate metadata as JSON
   */
  async uploadCertificateMetadata(certificateData: any, ipfsHash: string): Promise<PinataUploadResult> {
    if (!this.jwtToken && (!this.apiKey || !this.secretKey)) {
      throw new Error('Pinata credentials not configured');
    }

    try {
      console.log('📤 Uploading certificate metadata to Pinata IPFS...');
      
      const metadata = {
        ...certificateData,
        certificateHTMLUrl: `${this.gateway}${ipfsHash}`,
        uploadTimestamp: new Date().toISOString(),
        verified: true,
        blockchain: {
          contractAddress: '0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B',
          transactionHash: certificateData.blockchainHash,
          network: 'Deployed Network'
        }
      };

      let response;
      const requestData = {
        pinataContent: metadata,
        pinataMetadata: {
          name: `meta-${certificateData.certificateNumber}`,
          keyvalues: {
            type: 'meta',
            tx: certificateData.blockchainHash
          }
        },
        pinataOptions: {
          cidVersion: 0
        }
      };

      if (this.apiKey && this.secretKey) {
        try {
          console.log('Using API key + secret for JSON upload...');
          response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', requestData, {
            headers: {
              'pinata_api_key': this.apiKey,
              'pinata_secret_api_key': this.secretKey,
              'Content-Type': 'application/json'
            }
          });
        } catch (apiError: any) {
          if (apiError.response?.status === 401 && this.jwtToken) {
            console.log('API key + secret failed for JSON, falling back to JWT...');
            response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', requestData, {
              headers: {
                'Authorization': `Bearer ${this.jwtToken}`,
                'Content-Type': 'application/json'
              }
            });
          } else {
            throw apiError;
          }
        }
      } else if (this.jwtToken) {
        console.log('Using JWT for JSON upload...');
        response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', requestData, {
          headers: {
            'Authorization': `Bearer ${this.jwtToken}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        throw new Error('No Pinata credentials configured');
      }

      const { IpfsHash, PinSize, Timestamp } = response.data;
      
      const result: PinataUploadResult = {
        hash: IpfsHash,
        size: PinSize,
        timestamp: Timestamp,
        url: `${this.gateway}${IpfsHash}`
      };

      console.log('✅ Certificate metadata uploaded successfully!');
      console.log(`🔗 IPFS Hash: ${IpfsHash}`);
      console.log(`🌐 Access URL: ${result.url}`);
      
      return result;
      
    } catch (error: any) {
      console.error('❌ Certificate metadata upload failed:', error.response?.data || error.message);
      throw new Error(`Failed to upload certificate metadata: ${error.message}`);
    }
  }

  /**
   * Verify certificate upload
   */
  async verifyCertificateUpload(hash: string): Promise<boolean> {
    if (!this.apiKey || !this.secretKey) {
      return false;
    }

    try {
      const response = await axios.get(`https://api.pinata.cloud/data/pinList?hashContains=${hash}`, {
        headers: {
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.secretKey
        }
      });
      
      const pins = response.data.rows;
      return pins.length > 0;
      
    } catch (error) {
      console.error('❌ Certificate verification failed:', error);
      return false;
    }
  }

  /**
   * Get certificate from IPFS
   */
  async getCertificate(hash: string): Promise<string> {
    try {
      const response = await axios.get(`${this.gateway}${hash}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch certificate from IPFS:', error);
      throw new Error('Failed to fetch certificate from IPFS');
    }
  }

  /**
   * Get certificate metadata from IPFS
   */
  async getCertificateMetadata(hash: string): Promise<any> {
    try {
      const response = await axios.get(`${this.gateway}${hash}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch certificate metadata from IPFS:', error);
      throw new Error('Failed to fetch certificate metadata from IPFS');
    }
  }
}

export default PinataService;
