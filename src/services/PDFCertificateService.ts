import jsPDF from 'jspdf';

export interface CertificateData {
  certificateNumber: string;
  patientName: string;
  donorName: string;
  organType: string;
  transplantDate: string;
  hospitalName: string;
  doctorName: string;
  transactionHash: string;
  contractAddress: string;
  patientEmail?: string;
  donorEmail?: string;
}

export interface PDFCertificateResult {
  pdfBlob: Blob;
  pdfUrl: string;
  certificateData: CertificateData;
}

class PDFCertificateService {
  /**
   * Generate a professional PDF certificate for organ transplant
   */
  async generateCertificate(certificateData: CertificateData): Promise<PDFCertificateResult> {
    try {
      console.log('📄 Generating PDF certificate...');
      
      // Create new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Set font
      pdf.setFont('helvetica');
      
      // Background color
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Header section with gradient effect
      pdf.setFillColor(59, 130, 246); // Blue color
      pdf.rect(0, 0, pageWidth, 60, 'F');
      
      // White border
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(2);
      pdf.rect(5, 5, pageWidth - 10, pageHeight - 10);
      
      // Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ORGAN TRANSPLANT CERTIFICATE', pageWidth / 2, 25, { align: 'center' });
      
      // Subtitle
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Blockchain-Verified Medical Document', pageWidth / 2, 35, { align: 'center' });
      
      // Certificate number
      pdf.setFontSize(10);
      pdf.text(`Certificate #: ${certificateData.certificateNumber}`, pageWidth / 2, 45, { align: 'center' });
      
      // Main content area
      pdf.setTextColor(31, 41, 55);
      let yPosition = 80;
      
      // Certificate details box
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(229, 231, 235);
      pdf.rect(20, yPosition, pageWidth - 40, 120, 'FD');
      
      yPosition += 20;
      
      // Main heading
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CERTIFICATE OF ORGAN TRANSPLANT', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;
      
      // Certificate text
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const certificateText = `This is to certify that a successful organ transplant procedure has been performed`;
      pdf.text(certificateText, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
      
      // Patient information
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Patient Information:', 30, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Name: ${certificateData.patientName}`, 30, yPosition + 8);
      pdf.text(`Email: ${certificateData.patientEmail || 'Not provided'}`, 30, yPosition + 16);
      
      // Donor information
      pdf.text('Donor Information:', pageWidth / 2 + 10, yPosition);
      pdf.text(`Name: ${certificateData.donorName}`, pageWidth / 2 + 10, yPosition + 8);
      pdf.text(`Email: ${certificateData.donorEmail || 'Not provided'}`, pageWidth / 2 + 10, yPosition + 16);
      
      yPosition += 35;
      
      // Transplant details
      pdf.setFont('helvetica', 'bold');
      pdf.text('Transplant Details:', 30, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Organ Type: ${certificateData.organType.toUpperCase()}`, 30, yPosition + 8);
      pdf.text(`Date: ${new Date(certificateData.transplantDate).toLocaleDateString()}`, 30, yPosition + 16);
      pdf.text(`Hospital: ${certificateData.hospitalName}`, 30, yPosition + 24);
      pdf.text(`Doctor: ${certificateData.doctorName}`, 30, yPosition + 32);
      
      yPosition += 50;
      
      // Blockchain verification section
      pdf.setFillColor(240, 253, 244);
      pdf.setDrawColor(34, 197, 94);
      pdf.rect(20, yPosition, pageWidth - 40, 40, 'FD');
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(34, 197, 94);
      pdf.text('🔗 BLOCKCHAIN VERIFICATION', pageWidth / 2, yPosition + 12, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(31, 41, 55);
      pdf.text(`Transaction Hash: ${certificateData.transactionHash}`, pageWidth / 2, yPosition + 22, { align: 'center' });
      pdf.text(`Contract Address: ${certificateData.contractAddress}`, pageWidth / 2, yPosition + 30, { align: 'center' });
      
      yPosition += 50;
      
      // Verification QR code placeholder
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('VERIFICATION QR CODE', pageWidth / 2, yPosition, { align: 'center' });
      
      // QR code box
      pdf.setDrawColor(229, 231, 235);
      pdf.setFillColor(249, 250, 251);
      pdf.rect(pageWidth / 2 - 20, yPosition + 5, 40, 40, 'FD');
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Scan to verify', pageWidth / 2, yPosition + 50, { align: 'center' });
      pdf.text('certificate', pageWidth / 2, yPosition + 56, { align: 'center' });
      
      // Footer
      yPosition = pageHeight - 30;
      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      pdf.text('This certificate is cryptographically verified and stored on the blockchain', pageWidth / 2, yPosition, { align: 'center' });
      pdf.text('Transplant Chain Ledger - Decentralized Medical Records', pageWidth / 2, yPosition + 8, { align: 'center' });
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition + 16, { align: 'center' });
      
      // Generate PDF blob
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      console.log('✅ PDF certificate generated successfully');
      console.log(`📄 PDF size: ${pdfBlob.size} bytes`);
      
      return {
        pdfBlob,
        pdfUrl,
        certificateData
      };
      
    } catch (error: any) {
      console.error('❌ Error generating PDF certificate:', error);
      throw new Error(`Failed to generate PDF certificate: ${error.message}`);
    }
  }
  
  /**
   * Download the PDF certificate
   */
  downloadCertificate(pdfBlob: Blob, certificateNumber: string): void {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transplant-certificate-${certificateNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`📥 Downloaded certificate: ${certificateNumber}`);
  }
  
  /**
   * Generate verification URL for the certificate
   */
  generateVerificationUrl(ipfsHash: string, contractAddress: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/verify/${ipfsHash}?contract=${contractAddress}`;
  }
}

export default PDFCertificateService;
