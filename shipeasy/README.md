# ShippEasy - Logistics & Shipping Management System

ShippEasy is a comprehensive logistics and shipping management platform built with Angular. It provides a robust set of tools for managing shipments, vessels, manifests, financial documents, and real-time logistics tracking.

## 🚀 Features

- **Advanced Dashboard:** Real-time analytics, overview cards, and customizable filters.
- **Shipment Management:**
  - **EGM (Export General Manifest)** and **IGM (Import General Manifest)** management.
  - **Manifest** generation and tracking.
  - **SCMTR (Sea Cargo Manifest and Transshipment Regulations)** compliance.
- **Logistics Tools:**
  - **Rate Finder:** Search and compare shipping rates.
  - **Load Calculator:** Optimize cargo loading.
  - **Carrier Booking:** Integrated booking with shipping lines.
- **Finance & Documentation:**
  - **Agent Advise:** Manage agent commissions and advice.
  - **Smart Documents:** Automated document generation and storage.
  - **Payment Confirmation:** Track and confirm financial transactions.
- **Real-time Communication:**
  - Integrated **Chat** system.
  - **In-app Notifications** powered by Firebase.
- **User Management:**
  - Robust RBAC (Role-Based Access Control).
  - AWS Cognito integration for secure authentication.
  - Profile and password management.

## 🌐 Real-time Communication (Socket.io)

The application uses **Socket.io** to provide a real-time, bi-directional communication layer between the client and the server. This is primarily handled by the `MessagingService`.

### Purpose & Use Cases
- **Instant Messaging:** Real-time chat functionality between users.
- **Presence Tracking:** Live monitoring of user online/offline status (`user-status` event).
- **Live Notifications:** Immediate delivery of in-app notifications (`inAppNotification` event).
- **Dynamic Data Updates:** Real-time refresh of batch data and other critical information when changes occur on the server (`data-change` event).
- **Session Management:** Remote logout capability (`logout` event).

### How It Works
1. **Connection:** The connection is established using the `socketUrl` defined in the environment configuration. It uses `polling` transport and includes authorization headers (JWT token) and an `x-api-key` for security.
2. **Communication:**
   - **Outgoing:** Messages are sent using the `sendMessage(type, msg)` method, which emits events to the server.
   - **Incoming:** The application listens for specific events (`messages`, `user-status`, `data-change`, etc.) and exposes them as Observables that components can subscribe to.
3. **Integration:** Components like `ChatComponent` subscribe to these observables to update the UI instantly without requiring page refreshes.

## 🛠 Tech Stack

- **Frontend Framework:** Angular 13.3.11
- **Language:** TypeScript 4.6.4
- **State Management & Async:** RxJS 6.5.5
- **UI & Styling:**
  - **Angular Material 13**
  - **Bootstrap 5**
  - **Ng-Zorro-Antd**
  - **Ignite UI Angular**
  - **MDB UI Kit**
  - **SASS (SCSS)** for custom theming (Light/Dark support)
- **Data Visualization:**
  - **Chart.js**
  - **Ngx-charts**
  - **ECharts**
- **Maps & Location:** Mapbox GL
- **Backend Integration:**
  - **Azure MSAL:** For Azure AD authentication.
  - **AWS Cognito:** For user authentication and management.
  - **Azure Storage Blob:** For document and file storage.
  - **Socket.io:** For real-time communication.
  - **Firebase:** For push notifications.
- **Monitoring:** Elastic APM (RUM)
- **Reporting:** Bold BI Integration
- **Utilities:** JsPDF, XLSX, Crypto-js, File-saver, html2canvas

## 📋 Prerequisites

- **Node.js:** v14.x or v16.x (Recommended for Angular 13)
- **NPM:** v6.x or later
- **Angular CLI:** ~13.3.8

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd shipeasy
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment:**
   Update the environment settings in `src/environments/environment.ts` and `src/environments/environment.prod.ts` with your specific API keys and service URLs.

4. **Run Development Server:**
   ```bash
   npm start
   ```
   *Note: This command runs `ng serve` with increased memory allocation (`--max_old_space_size=6096`) to handle the project's complexity.*

5. **Access the application:**
   Navigate to `http://localhost:4200/`.

## 🏗 Build & Deployment

### Build Configurations

The project supports multiple build configurations:

- **Production:** `npm run build -- --configuration=production`
- **Indian Production:** `npm run build -- --configuration=indianproduction`
- **Development:** `npm run build -- --configuration=dev`
- **Demo:** `npm run build -- --configuration=demo`

### Using Docker

The project includes a `Dockerfile` for containerized deployment.

1. **Build the Docker Image:**
   ```bash
   docker build -t shipeasy-web .
   ```

2. **Run the Container:**
   ```bash
   docker run -d -p 80:80 shipeasy-web
   ```

The application will be served via **Nginx** on port 80.

## 🧪 Testing & Quality

- **Linting:** `npm run lint`
- **Unit Tests:** `npm run test`
- **E2E Tests:** `npm run e2e`

## 📁 Project Structure

- `src/app/admin/`: Core business modules and administrative features.
- `src/app/layout/`: Global layout components (Header, Footer, Nav, Chat).
- `src/app/auth/`: Authentication related components (Login, Registration, Password Reset).
- `src/app/models/`: TypeScript interfaces and models.
- `src/app/services/`: API and utility services.
- `src/app/shared/`: Shared components, pipes, and directives.
- `src/assets/`: Static assets, images, and internationalization files (`i18n`).
- `src/theme/`: Custom SCSS themes and theme service.

## 📄 License

(Specify your license information here)

---
Developed by [Synoris](https://synoris.com)
