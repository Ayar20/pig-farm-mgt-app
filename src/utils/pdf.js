import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// printTable(elementId) — adds print class, calls window.print(), removes class
export function printTable(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.classList.add('printing');
  window.print();
  el.classList.remove('printing');
}

// generateAnalyticsPDF(title, elementId) — uses jsPDF + html2canvas
export async function generateAnalyticsPDF(title, elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  
  // Save original styles if needed or let html2canvas capture the element
  // We can show a loading state or spinner if desired, but simple capture is fast enough
  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#111827', // Use standard slate/zinc dark background if it fits the theme
    });
    const imgData = canvas.toDataURL('image/png');
    
    // PDF layout setup: A4 Landscape
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Fit canvas to A4 aspect ratio and scale
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    const imgWidth = pdfWidth - 20; // 10mm margins on both sides
    const imgHeight = (canvasHeight * imgWidth) / canvasWidth;
    
    // Add Branding / Header
    pdf.setFillColor(17, 24, 39); // Match background
    pdf.rect(0, 0, pdfWidth, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`🐷 PigFarm Management System`, 12, 16);
    
    pdf.setTextColor(156, 163, 175);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Report: ${title} | Generated: ${new Date().toLocaleDateString()}`, pdfWidth - 12, 16, { align: 'right' });
    
    // Add image content below header
    // If the image is taller than the remaining page height, fit it within the page or adjust y
    const yPosition = 30;
    const maxImgHeight = pdfHeight - yPosition - 10;
    
    if (imgHeight > maxImgHeight) {
      // Fit to max height
      const adjustedWidth = (imgWidth * maxImgHeight) / imgHeight;
      const xOffset = (pdfWidth - adjustedWidth) / 2;
      pdf.addImage(imgData, 'PNG', xOffset, yPosition, adjustedWidth, maxImgHeight);
    } else {
      pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
    }
    
    pdf.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
}
