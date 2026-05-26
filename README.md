# Campus Care Backend Services

This workspace contains the Spring Boot + Spring Cloud Eureka microservices backend for the Campus Care Complaint Management System.

## Architecture Overview

The backend is built as a multi-module Maven project with two primary services:
1. **Eureka Server (`eureka-server`)**: Spring Cloud Discovery Server running on port `8761`. It acts as the registry for backend services.
2. **Campus Care Backend (`campus-care-backend`)**: The core REST API service running on port `8080`. It registers with Eureka, handles user authentication, ticket lifecycles, administrative operations, and PDF exports.

### Database Strategy (Hybrid Architecture)
* **SQL (Oracle Database)**: Used for persistent, structured records requiring strict integrity, including:
  * Users & Roles (`CC_USERS` table)
  * Issue Categories (`CC_CATEGORIES` table)
  * Structured Ticket Records (`CC_TICKETS` table)
* **NoSQL (MongoDB)**: Used for high-throughput, unstructured, or nested records, including:
  * Comments (`comments` collection)
  * Ticket Activity Timeline logs (`timeline_entries` collection)
  * Persistent Notifications (`notifications` collection)
  * System Activity Logs (`system_activity_logs` collection)

---

## Getting Started

### 1. Prerequisites
Ensure you have the following running locally or accessible on your network:
* **Java JDK 17+** (JDK 25 is installed and active in your environment)
* **Oracle Database** (Express Edition / Standard XE) running on port `1521`
  * Default schema: `system` (or configured database schema)
  * Default password: `oracle`
* **MongoDB** running on standard port `27017`
  * Default database: `campus_care`

*Note: You can modify these credentials inside [campus-care-backend/src/main/resources/application.properties](file:///c:/Users/saran/OneDrive/文档/campus_care_backend/campus-care-backend/src/main/resources/application.properties) if your credentials differ.*

### 2. Building the Project
From the root directory (`c:\Users\saran\OneDrive\文档\campus_care_backend`), run:
```bash
# Build the parent and all sub-modules
mvn clean install
```
*(If Maven is not on your PATH, you can open the project directly in IntelliJ IDEA, which has built-in Maven support, and build it from the Maven sidebar).*

### 3. Running the Services

#### Step A: Start the Discovery Registry (Eureka Server)
Run the Eureka Server first so clients can register:
* In IntelliJ: Run `com.campuscare.eureka.EurekaServerApplication`
* Via Command Line:
  ```bash
  cd eureka-server
  mvn spring-boot:run
  ```
* Once started, access the Eureka dashboard at: http://localhost:8761

#### Step B: Start the Campus Care API Service
* In IntelliJ: Run `com.campuscare.backend.CampusCareBackendApplication`
* Via Command Line:
  ```bash
  cd campus-care-backend
  mvn spring-boot:run
  ```

---

## Pre-seeded Test Credentials

The database automatically initializes the following test users on first startup:

| Role | Username (Email) | Password | Name / UserID | Department / Category |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `student@example.com` | `password` | `717823s146` | Computer Science |
| **Staff / Technician** | `staff@example.com` | `password` | `Meera Nair` / `EMP-204` | IT Services |
| **Hostel Warden** | `warden@example.com` | `password` | `Ravi Iyer` / `WRD-102` | Hostel Block C |
| **Administrator** | `admin@example.com` | `password` | `Priya Shah` / `ADM-001` | Administration |

---

## API Testing with Postman

We have generated a Postman collection containing requests for all APIs, configured with automatic JWT extraction and dynamic environment tokens:

### Import Collection
1. Open Postman.
2. Click **Import** and select the [Campus_Care_Postman_Collection.json](file:///c:/Users/saran/OneDrive/文档/campus_care_backend/Campus_Care_Postman_Collection.json) located in the project root.
3. Use the following endpoints inside:
   * **Login Endpoints**: Returns a JWT token and updates Postman collection variables automatically.
   * **Ticket Flow**: Create complaints, assign staff, post comments, update status, and escalate issues.
   * **Audit Log & PDF Export**: Retrieve real-time MongoDB audit entries and download the formatted PDF report.

---

## API Documentation (Swagger / OpenAPI UI)

When the backend service is running, Swagger documentation is served at:
* **Interactive UI**: http://localhost:8080/swagger-ui.html
* **API Documentation Specs**: http://localhost:8080/v3/api-docs
