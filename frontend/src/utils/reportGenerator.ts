import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { UserDTO } from '../features/admin/adminService';

export const generateUserReport = (users: UserDTO[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const timestamp = new Date().toLocaleString();

    // -- Header Section --
    // Background Header Bar
    doc.setFillColor(79, 70, 229); // Indigo-600
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('SLIIT NEXAR', 15, 20);

    // Subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const subtitle = 'OPERATIONAL PERSONNEL REGISTRY REPORT';
    doc.text(subtitle, 15, 28);

    // Generation Info
    doc.setFontSize(8);
    doc.text(`Generated: ${timestamp}`, pageWidth - 15, 20, { align: 'right' });
    doc.text(`Registry Volume: ${users.length} Records`, pageWidth - 15, 28, { align: 'right' });

    // -- Summary Section --
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Registry Summary', 15, 55);

    const admins = users.filter(u => u.role === 'admin').length;
    const students = users.filter(u => u.role === 'student').length;
    const active = users.filter(u => u.isActive).length;
    const suspended = users.length - active;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Summary Grid
    const summaryY = 65;
    doc.text(`Total Users: ${users.length}`, 15, summaryY);
    doc.text(`Active Personnel: ${active}`, 15, summaryY + 7);
    doc.text(`Suspended Personnel: ${suspended}`, 15, summaryY + 14);
    
    doc.text(`Admin Protocols: ${admins}`, 80, summaryY);
    doc.text(`Student Personnel: ${students}`, 80, summaryY + 7);

    // -- User Table --
    const tableHeaders = [['Operator Identity', 'Registry Endpoint', 'Authorization', 'Status', 'Registration Date']];
    const tableData = users.map(user => [
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.role.toUpperCase(),
        user.isActive ? 'ACTIVE' : 'SUSPENDED',
        new Date(user.createdAt).toLocaleDateString()
    ]);

    autoTable(doc, {
        startY: 90,
        head: tableHeaders,
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [79, 70, 229], // Indigo-600
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: 4
        },
        bodyStyles: {
            textColor: [51, 65, 85], // Slate-700
            fontSize: 9,
            cellPadding: 4
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252] // Slate-50
        },
        columnStyles: {
            0: { fontStyle: 'bold' }, // Identity
            2: { halign: 'center' }, // Role
            3: { halign: 'center' }  // Status
        },
        didParseCell: function(data: any) {
            // Stylizing Status Column
            if (data.section === 'body' && data.column.index === 3) {
                if (data.cell.raw === 'ACTIVE') {
                    data.cell.styles.textColor = [5, 150, 105]; // Emerald-600
                } else if (data.cell.raw === 'SUSPENDED') {
                    data.cell.styles.textColor = [220, 38, 38]; // Rose-600
                }
            }
        }
    });

    // -- Footer --
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // Slate-400
        doc.text(
            `Nexar Career Path Help System - Confidential Operational Report`,
            15,
            doc.internal.pageSize.height - 10
        );
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth - 15,
            doc.internal.pageSize.height - 10,
            { align: 'right' }
        );
    }

    // Save PDF
    doc.save(`Nexar_User_Registry_${new Date().toISOString().split('T')[0]}.pdf`);
};
