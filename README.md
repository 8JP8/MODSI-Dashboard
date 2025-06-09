# MODSI-WebApp-Dashboard: Application Documentation

## 1. Overview

**MODSI-WebApp** is a comprehensive internal business management and intelligence application built on Appsmith. It provides a suite of tools for user management, performance tracking, data visualization, and communication. The platform is designed with role-based access control, ensuring that users only have access to the functionalities relevant to their position.

The application leverages a custom REST API backend (`MODSI-RESTAPI`) for its core logic and integrates with several third-party services for enhanced features like AI-powered chat, image hosting, and email delivery.

## 2. Core Technologies & Services

The application is built on the Appsmith low-code platform and integrates with the following key services and libraries:

*   **Backend API:**
    *   **`MODSI-RESTAPI`**: A custom RESTful API hosted on Azure Functions, serving as the primary backend for all data operations, including user management, KPI data, and role management.
*   **External APIs:**
    *   **`Google AI Studio API`**: Powers the generative AI capabilities in the **AI Chat** page, utilizing the `gemini-2.0-flash` model.
    *   **`ImageBB API`**: Used for hosting user profile pictures, allowing for dynamic and user-updatable avatars.
    *   **`Resend Email API`**: A dedicated service for sending transactional and marketing emails, used in the **Email Service** page and for user verification/password resets.
*   **Custom JavaScript Libraries:**
    *   **`jsonwebtoken`**: Utilized for decoding and handling JSON Web Tokens (JWTs) for secure, token-based authentication.
    *   **`bcryptjs`**: Used for secure password hashing, ensuring that user passwords are not stored in plaintext.

## 3. Application Pages & Functionality

The application is divided into several pages, each serving a distinct purpose.

### 3.1. Main Page (Dashboard)

The default landing page for authenticated users, serving as a central navigation hub.

*   **Greeting:** Displays a dynamic welcome message based on the time of day (e.g., "Bom dia, [User Name]").
*   **Navigation:** Provides access to all major modules of the application through dedicated buttons and menus:
    *   **KPI Management:** A menu button that navigates to the `KPI Manager` page, with access to different departments controlled by user permissions.
    *   **2D & VR Visualizations:** Buttons to navigate to the `KPI Visualizer` page for 2D charts and an external link to `modsivr.pt` for Virtual Reality visualizations.
    *   **AI Chat & Email Service:** Direct links to the respective communication and analysis tools.
    *   **Company & User Management:** Links to the `Employees` directory and, for authorized users, to the `User Editor - Admin` page.
*   **User Actions:**
    *   **Edit Profile:** Navigates to the `UserProfileEditor` page.
    *   **Logout:** Clears the authentication token and session data, then navigates back to the `Login` page.
*   **Permissions:** Access to certain navigation buttons (like "Gestão de Utilizadores") is dynamically controlled based on the user's role (`System Administrator`, `HR Manager`) or group (`ADMIN`).

### 3.2. Login

Handles all aspects of user authentication and account management.

*   **Sign In:** Standard email and password login form. It validates credentials against the backend, retrieves a JWT, and stores user details (Name, Role, Group, etc.) in the application's local store.
*   **Sign Up:** A registration form for new users. It collects Name, Username, Email, and Password.
    *   **Validation:** Checks if the username and email already exist in the database before proceeding.
    *   **Security:** Uses `bcryptjs` to hash the password before sending it to the backend for registration.
    *   **Verification:** After successful registration, it triggers an API call to send a verification email to the user.
*   **Password Management:**
    *   **Change Password:** A dedicated tab for authenticated users to change their password by providing their current and new passwords.
    *   **Forgot Password / Reset:** If a user fails to log in multiple times, a "Forgot Password" button appears. This initiates a password reset flow, sending a unique reset code to the user's email.
*   **Authentication Flow:** The page includes robust logic to check for an existing `authToken` on load. If a valid token exists, it redirects to the main dashboard; otherwise, it presents the login form.

### 3.3. User Profile Editor

Allows authenticated users to manage their personal information.

*   **View Profile:** Displays the user's current Name, Email, Username, Role, Group, Phone Number, and Profile Photo.
*   **Edit Details:** Users can update their Full Name and Phone Number.
*   **Profile Picture:**
    *   Users can upload a new profile picture. The image is sent to the **ImageBB API** for hosting.
    *   The new image URL is then saved to the user's profile in the database.
    *   A "Remove Image" button reverts the picture to a default avatar.
*   **Password Change:** A dedicated button navigates the user to the "Change Password" tab on the `Login` page.

### 3.4. Role Assignment - Admin (Admin Only)

A specialized dashboard for administrators to manage new, unverified user registrations.

*   **Pending Users Table:** Displays a table (`tbl_users`) filtered to show only users whose role is "n.d." (not defined), indicating they are awaiting approval.
*   **Role Assignment:** Administrators can select a pending user from the table, which opens a confirmation modal (`modal_confirmation`). In this modal, they can assign an official role from a dropdown list populated by the `GetAllRoles` API call.
*   **User Statistics:** Displays key metrics at a glance:
    *   Total number of registered users.
    *   Number of pending users.
    *   Number of verified/active users.
*   **Data Visualization:** Includes an area chart (`cht_successfulVerification`) that visualizes the number of new user sign-ups over time, with a toggle to view data by day or by month.

### 3.5. User Editor - Admin (Admin Only)

A comprehensive dashboard for managing all users in the system.

*   **User Table:** A powerful table (`tbl_users`) lists all users with key details like Name, Email, Role, and more.
*   **Filtering & Searching:** The table is searchable and can be filtered by user role via a dropdown menu.
*   **User Editing:** Clicking an "Edit" icon on any user row opens a modal (`modal_edit`) where an admin can:
    *   Modify the user's Name and Email.
    *   Change the user's Role.
    *   Assign the user to a security group (`ADMIN` or `USER`).
    *   Manually verify or un-verify a user's account.
    *   Trigger a password reset request for the selected user.

### 3.6. Employees

A public-facing directory of all company employees.

*   **Employee List:** Displays a clean, sortable table (`tbl_users`) of all users, showing their Profile Photo, Name, Role, Email, and Phone Number.
*   **Detailed View:** When a row is selected, a side panel displays a larger view of the user's photo and their full details, providing a quick-reference card for each employee.

### 3.7. KPI Manager (Permission-based)

An interface for managing Key Performance Indicators (KPIs) across different departments.

*   **Department Selection:** A menu allows users to switch between different departments (e.g., Executive, Finance, Technology) to manage their respective KPIs. Access to each department is controlled by the user's role permissions.
*   **KPI Table:** An inline-editable table (`KPIs_Table`) lists all KPIs for the selected department. Users with write permissions can directly update the `Value_1` and `Value_2` fields for each KPI.
*   **KPI Creation:** Administrators (`userGroup === "ADMIN"`) can create new KPIs via a modal (`CreateKPIModal`). This form allows them to define the KPI's Name, Description, Unit, initial values, and assign it to one or more departments.
*   **Data Persistence:** Changes made in the table are saved to the backend via the `UpdateKPIs.UpdateEachKPI` function, which iterates through all modified rows and calls the `UpdateKPIValues` API for each.

### 3.8. KPI Visualizer

A dynamic dashboard for visualizing KPI data through various charts.

*   **Data Selection:** Users can choose which department's KPIs to visualize. A dropdown (`KpiSelector`) is then populated with the KPIs available for that department.
*   **Dynamic Charting:**
    *   **Appsmith Charts:** A primary chart (`MainChart`) dynamically changes its type (Area, Bar, Line, etc.) based on the user's selection in the `ChartTypeSelector` dropdown.
    *   **FusionCharts:** A secondary chart (`FusionChart`) offers more advanced and specialized chart types (e.g., `mssplinearea`, `mscolumn3d`) for deeper analysis.
*   **Data Transformation:** A powerful JavaScript object (`KPIToGraphConverter`) contains functions to:
    *   Fetch and format historical KPI data (`FormatKPIHistory`).
    *   Group data by day, month, year, or change event.
    *   Generate appropriate labels for chart axes (`getAxisLabel`).
    *   Prepare data structures for both Appsmith and FusionCharts.

### 3.9. AI Chat

An interactive chat interface powered by the Google Gemini AI model.

*   **Prompt Input:** A multi-line text area (`PromptInput`) allows users to type their questions or analysis requests.
*   **Contextual KPI Insertion:** A key feature is the ability to insert specific KPI data directly into the prompt. A modal (`InsertKPIsModal`) allows users to:
    *   Select one or more KPIs from a list.
    *   Choose a type of analysis (Relational, Comparative, Preditiva).
    *   The `PromptCreator.js` object then constructs a detailed, structured prompt containing the selected KPI data and analysis instructions, which is then sent to the AI.
*   **AI Interaction:** The "Send" button calls the `Gemini_2` API. The AI's response, typically in Markdown, is then parsed and converted to HTML for clean presentation in a text widget.
*   **Response Handling:** Users can copy the AI's response to the clipboard or download it as a `.txt` file.

### 3.10. Email Service

A built-in tool for sending templated or custom emails to users.

*   **Recipient Selection:** On the "Utilizadores" tab, the user can select one or more recipients from a table of all registered users.
*   **Message Configuration:** On the "Configuração" tab, the user can:
    *   Select a pre-defined message template (e.g., Welcome, Feedback, Support) from a dropdown, which auto-populates the message body.
    *   Write a custom subject (`Title_Input`) and message (`MessageInput`).
*   **Live Preview:** A mobile phone-style container shows a live preview of how the final email will look.
*   **Sending:** On the "Confirmação" tab, the user can review all details before clicking "Enviar". This triggers the `sendEmails` function, which iterates through the selected recipients and calls the **Resend Email API** for each one.
