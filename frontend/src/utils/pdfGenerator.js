import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateRegionReportPDF = async (region, reports, ppnList) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 10;

  const addHeader = () => {
    doc.setFontSize(16);
    doc.setTextColor(30, 64, 175);
    doc.text('REPUBLIQUE DE MADAGASCAR', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;

    doc.setFontSize(12);
    doc.setTextColor(30, 64, 175);
    doc.text('Ministère du Commerce et des Ressources Stratégiques', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text('RAPPORT DE PRIX DES PRODUITS DE PREMIÈRE NÉCESSITÉ (PPN)', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Région: ${region}`, 10, yPosition);
    yPosition += 4;

    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 10, yPosition);
    yPosition += 8;

    doc.setDrawColor(30, 64, 175);
    doc.line(10, yPosition, pageWidth - 10, yPosition);
    yPosition += 6;
  };

  const checkPageBreak = (requiredSpace) => {
    if (yPosition + requiredSpace > pageHeight - 10) {
      doc.addPage();
      yPosition = 10;
      addHeader();
    }
  };

  addHeader();

  const groupedByDistrict = {};
  reports.forEach(report => {
    if (!groupedByDistrict[report.district]) {
      groupedByDistrict[report.district] = [];
    }
    groupedByDistrict[report.district].push(report);
  });

  Object.keys(groupedByDistrict).forEach(district => {
    checkPageBreak(20);

    doc.setFontSize(11);
    doc.setTextColor(30, 64, 175);
    doc.text(`District: ${district}`, 10, yPosition);
    yPosition += 6;

    const districtReports = groupedByDistrict[district];
    const tableData = [];
    const headers = ['Produit', 'Unité', 'Prix Unit. Min', 'Prix Unit. Max', 'Prix Gros Min', 'Prix Gros Max'];

    districtReports.forEach(report => {
      const ppn = ppnList.find(p => p.id === report.ppnId);
      tableData.push([
        ppn?.name || 'N/A',
        ppn?.unit || 'N/A',
        `${report.prix_unitaire_min || 0}`,
        `${report.prix_unitaire_max || 0}`,
        `${report.prix_gros_min || 0}`,
        `${report.prix_gros_max || 0}`,
      ]);
    });

    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: yPosition,
      margin: { left: 10, right: 10 },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: 255,
        fontStyle: 'bold',
      },
      bodyStyles: {
        textColor: 60,
      },
      alternateRowStyles: {
        fillColor: [240, 245, 255],
      },
    });

    yPosition = doc.lastAutoTable.finalY + 8;
  });

  checkPageBreak(30);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Document généré le: ${new Date().toLocaleString('fr-FR')}`, 10, pageHeight - 10);

  const filename = `Rapport_PPN_${region}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
