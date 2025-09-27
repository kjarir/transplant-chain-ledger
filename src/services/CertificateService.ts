import { CertificateData } from './TransactionService';

export interface CertificateTemplate {
  title: string;
  subtitle: string;
  content: string;
  footer: string;
  backgroundImage?: string;
  logo?: string;
}

class CertificateService {
  private readonly CONTRACT_ADDRESS = '0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B';

  /**
   * Generate certificate data
   */
  generateCertificateData(transaction: any, patientName: string, donorName: string, doctorName: string): CertificateData {
    const certificateNumber = this.generateCertificateNumber();
    
    return {
      transactionId: transaction.txHash,
      patientName: patientName,
      donorName: donorName,
      organType: this.formatOrganType(transaction.organType),
      transplantDate: new Date(transaction.transplantDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      hospitalName: transaction.hospitalName,
      doctorName: doctorName,
      blockchainHash: transaction.txHash,
      certificateNumber: certificateNumber,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate HTML certificate
   */
  generateHTMLCertificate(data: CertificateData): string {
    const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Organ Transplant Certificate - ${data.certificateNumber}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@300;400;600&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Open Sans', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .certificate {
            background: white;
            width: 800px;
            height: 600px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 40px;
        }
        
        .certificate::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
            pointer-events: none;
        }
        
        .header {
            margin-bottom: 30px;
            position: relative;
            z-index: 1;
        }
        
        .title {
            font-family: 'Playfair Display', serif;
            font-size: 2.5rem;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .subtitle {
            font-size: 1.1rem;
            color: #7f8c8d;
            font-weight: 300;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        
        .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
            z-index: 1;
            max-width: 600px;
        }
        
        .main-text {
            font-size: 1.3rem;
            line-height: 1.8;
            color: #34495e;
            margin-bottom: 30px;
            font-weight: 400;
        }
        
        .highlight {
            font-weight: 600;
            color: #2c3e50;
            font-size: 1.4rem;
        }
        
        .details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
            width: 100%;
        }
        
        .detail-item {
            text-align: left;
            padding: 15px;
            background: rgba(102, 126, 234, 0.05);
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        
        .detail-label {
            font-size: 0.9rem;
            color: #7f8c8d;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }
        
        .detail-value {
            font-size: 1.1rem;
            color: #2c3e50;
            font-weight: 500;
        }
        
        .blockchain-info {
            margin-top: 20px;
            padding: 15px;
            background: rgba(46, 204, 113, 0.1);
            border-radius: 10px;
            border-left: 4px solid #2ecc71;
            width: 100%;
        }
        
        .blockchain-label {
            font-size: 0.9rem;
            color: #27ae60;
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .blockchain-hash {
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            color: #2c3e50;
            word-break: break-all;
        }
        
        .footer {
            margin-top: 20px;
            position: relative;
            z-index: 1;
        }
        
        .certificate-number {
            font-size: 0.9rem;
            color: #7f8c8d;
            margin-bottom: 10px;
        }
        
        .timestamp {
            font-size: 0.8rem;
            color: #95a5a6;
        }
        
        .logo {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: #667eea;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
            font-weight: bold;
        }
        
        .watermark {
            position: absolute;
            bottom: 20px;
            left: 20px;
            font-size: 0.7rem;
            color: rgba(0, 0, 0, 0.1);
            transform: rotate(-90deg);
            transform-origin: left bottom;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .certificate {
                box-shadow: none;
                border: 2px solid #ddd;
            }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="logo">TC</div>
        <div class="watermark">TransplantChain</div>
        
        <div class="header">
            <div class="title">Certificate of Organ Transplant</div>
            <div class="subtitle">Blockchain Verified Transaction</div>
        </div>
        
        <div class="content">
            <div class="main-text">
                This certifies that a <span class="highlight">${data.organType}</span> transplant 
                was successfully performed and recorded on the blockchain between 
                <span class="highlight">${data.donorName}</span> (donor) and 
                <span class="highlight">${data.patientName}</span> (recipient).
            </div>
            
            <div class="details">
                <div class="detail-item">
                    <div class="detail-label">Organ Type</div>
                    <div class="detail-value">${data.organType}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Transplant Date</div>
                    <div class="detail-value">${data.transplantDate}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Hospital</div>
                    <div class="detail-value">${data.hospitalName}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Doctor</div>
                    <div class="detail-value">${data.doctorName}</div>
                </div>
            </div>
            
            <div class="blockchain-info">
                <div class="blockchain-label">Blockchain Transaction Hash</div>
                <div class="blockchain-hash">${data.blockchainHash}</div>
            </div>
        </div>
        
        <div class="footer">
            <div class="certificate-number">Certificate #${data.certificateNumber}</div>
            <div class="timestamp">Generated on ${new Date(data.timestamp).toLocaleString()}</div>
        </div>
    </div>
</body>
</html>`;

    return template;
  }

  /**
   * Generate PDF certificate (using browser print functionality)
   */
  generatePDFCertificate(data: CertificateData): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const html = this.generateHTMLCertificate(data);
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          reject(new Error('Failed to create iframe document'));
          return;
        }
        
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
        
        iframe.onload = () => {
          setTimeout(() => {
            try {
              iframe.contentWindow?.print();
              document.body.removeChild(iframe);
              resolve(new Blob([html], { type: 'text/html' }));
            } catch (error) {
              reject(error);
            }
          }, 1000);
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate certificate number
   */
  private generateCertificateNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `TC-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Format organ type for display
   */
  private formatOrganType(organType: string | number): string {
    if (typeof organType === 'number') {
      const organTypes = ['Heart', 'Kidney', 'Liver', 'Lung', 'Pancreas', 'Cornea', 'Bone', 'Skin'];
      return organTypes[organType] || 'Unknown';
    }
    return organType.charAt(0).toUpperCase() + organType.slice(1);
  }
}

export default CertificateService;
