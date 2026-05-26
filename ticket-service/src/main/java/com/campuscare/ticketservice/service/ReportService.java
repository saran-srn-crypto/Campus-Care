package com.campuscare.ticketservice.service;

import java.io.ByteArrayInputStream;

public interface ReportService {
    ByteArrayInputStream generateTicketReportPdf();
}
