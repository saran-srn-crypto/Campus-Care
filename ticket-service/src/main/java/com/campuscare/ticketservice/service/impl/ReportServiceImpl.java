package com.campuscare.ticketservice.service.impl;

import com.campuscare.ticketservice.model.Ticket;
import com.campuscare.ticketservice.repository.TicketRepository;
import com.campuscare.ticketservice.service.ReportService;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportServiceImpl implements ReportService {

    @Autowired
    private TicketRepository ticketRepository;

    @Override
    public ByteArrayInputStream generateTicketReportPdf() {
        List<Ticket> tickets = ticketRepository.findAllByOrderByCreatedDesc();

        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Set up fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(41, 128, 185));
            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);

            // Title block
            Paragraph title = new Paragraph("CAMPUS CARE - TICKETS REPORT", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(5);
            document.add(title);

            // Generation Date
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            Paragraph date = new Paragraph("Generated on: " + LocalDateTime.now().format(formatter), subTitleFont);
            date.setAlignment(Element.ALIGN_CENTER);
            date.setSpacingAfter(20);
            document.add(date);

            // Summary Statistics block
            long total = tickets.size();
            long resolved = tickets.stream().filter(t -> t.getStatus().equalsIgnoreCase("Resolved")).count();
            long closed = tickets.stream().filter(t -> t.getStatus().equalsIgnoreCase("Closed")).count();
            long inProgress = tickets.stream().filter(t -> t.getStatus().equalsIgnoreCase("In Progress")).count();
            long open = total - resolved - closed - inProgress;

            Paragraph stats = new Paragraph(
                    String.format("Total: %d  |  Open: %d  |  In Progress: %d  |  Resolved: %d  |  Closed: %d",
                            total, open, inProgress, resolved, closed),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(44, 62, 80))
            );
            stats.setAlignment(Element.ALIGN_CENTER);
            stats.setSpacingAfter(20);
            document.add(stats);

            // Styled Table
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.5f, 3f, 2f, 1.5f, 2f, 1.5f});

            // Headers
            String[] headers = {"ID", "Title", "Category", "Priority", "Assignee", "Status"};
            for (String headerText : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(headerText, headerFont));
                cell.setBackgroundColor(new Color(41, 128, 185));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(6);
                table.addCell(cell);
            }

            // Populate Row Cells
            for (Ticket t : tickets) {
                // Ticket ID
                PdfPCell idCell = new PdfPCell(new Phrase(t.getId(), bodyFont));
                idCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                idCell.setPadding(5);
                table.addCell(idCell);

                // Title
                PdfPCell titleCell = new PdfPCell(new Phrase(t.getTitle(), bodyFont));
                titleCell.setPadding(5);
                table.addCell(titleCell);

                // Category
                PdfPCell catCell = new PdfPCell(new Phrase(t.getCategory(), bodyFont));
                catCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                catCell.setPadding(5);
                table.addCell(catCell);

                // Priority
                PdfPCell prioCell = new PdfPCell(new Phrase(t.getPriority(), bodyFont));
                prioCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                prioCell.setPadding(5);
                if (t.getPriority().equalsIgnoreCase("Urgent")) {
                    prioCell.setBackgroundColor(new Color(254, 237, 238));
                } else if (t.getPriority().equalsIgnoreCase("High")) {
                    prioCell.setBackgroundColor(new Color(255, 245, 230));
                }
                table.addCell(prioCell);

                // Assignee
                String assignee = t.getAssignee() != null ? t.getAssignee() : "Unassigned";
                PdfPCell assCell = new PdfPCell(new Phrase(assignee, bodyFont));
                assCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                assCell.setPadding(5);
                table.addCell(assCell);

                // Status
                PdfPCell statusCell = new PdfPCell(new Phrase(t.getStatus(), bodyFont));
                statusCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                statusCell.setPadding(5);
                if (t.getStatus().equalsIgnoreCase("Resolved") || t.getStatus().equalsIgnoreCase("Closed")) {
                    statusCell.setBackgroundColor(new Color(230, 245, 230));
                } else if (t.getStatus().equalsIgnoreCase("In Progress")) {
                    statusCell.setBackgroundColor(new Color(230, 242, 255));
                } else {
                    statusCell.setBackgroundColor(new Color(255, 255, 230));
                }
                table.addCell(statusCell);
            }

            document.add(table);
            document.close();

        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}
