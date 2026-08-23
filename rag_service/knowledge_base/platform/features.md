# CivicPulse Platform Features

## What is CivicPulse?

CivicPulse is a crowdsourced municipal issue tracking platform that bridges the gap between Indian citizens and local municipal authorities. Citizens can report urban anomalies like broken roads, streetlight failures, waste dumping, water leakage, and sanitation issues. Municipal administrators can then monitor, triage, and resolve these reports based on their jurisdiction.

## How to Report an Issue

To report a civic issue on CivicPulse:

1. Log in to your CivicPulse account (you must be registered first).
2. Click on "Report Issue" in the navigation menu.
3. Fill in the report form:
   - **Title**: A short, descriptive title for the issue (e.g., "Broken streetlight on MG Road").
   - **Description**: Detailed description of the problem, including location details and severity.
   - **Category**: Select from available categories like Roads, Water, Sanitation, Electricity, or Other.
   - **Photo**: Upload a photo of the issue (JPEG or PNG, max 5MB). Photos help administrators understand the problem quickly.
   - **Location**: Optionally allow GPS access to automatically tag the exact coordinates of the issue.
4. Click "Submit Report".
5. Your report will appear in the community feed and be visible to administrators in your state.

## How to Track Your Reports

After submitting a report:

1. Go to "My Reports" in the navigation menu.
2. You'll see a list of all reports you've submitted.
3. Each report shows a status badge:
   - **Pending** (yellow): Your report has been submitted and is awaiting review by an administrator.
   - **In Progress** (blue): An administrator has acknowledged the issue and work is underway.
   - **Resolved** (green): The issue has been fixed.
4. Click on any report to see its full details, comments, and upvote count.

## Upvoting Reports

The upvote system helps surface the most important issues:

- You can upvote any report in the Community Feed to show support.
- Each user can only upvote a report once (toggle on/off).
- Reports with more upvotes get prioritized by administrators.
- To upvote: click the upvote button (thumbs up icon) on any report card.

## Community Feed

The Community Feed shows all reports from your state:

- Reports are displayed as cards showing title, category, status, upvote count, and submission date.
- You can filter reports by area using the search/filter options.
- Click on any report card to view full details and join the discussion.
- The feed updates in real-time as new reports are submitted.

## Comments and Discussion

Every report has a comment section for community discussion:

- Comments allow citizens to provide additional context about an issue.
- You can share temporary workarounds or confirm if a problem has worsened.
- Comments are limited to 1000 characters.
- Only authenticated (logged-in) users can post comments.
- Comments show the author's username and timestamp.

## User Profile

Your profile shows your account information:

- Username, email, state, and area.
- Your role (Citizen or Admin).
- Your activity points earned through civic participation.
- You can view and manage your account from the Profile page.

## Admin Dashboard

Municipal administrators have access to a special dashboard:

- **Statistics Panel**: Shows total reports, pending count, in-progress count, and resolved count for their jurisdiction.
- **Report Management**: View all reports in their state/area, filter by status or area.
- **Status Updates**: Change report status from Pending → In Progress → Resolved.
- **Report Deletion**: Remove inappropriate or duplicate reports.
- Administrators only see reports within their assigned state and area (geographic isolation).

## Account Types

CivicPulse has two main account types:

1. **Citizen (User)**: Can report issues, upvote, comment, and track their own reports.
2. **Municipal Admin**: Can view all reports in their jurisdiction, update statuses, view analytics, and manage reports.

## Registration

To create a CivicPulse account:

1. Click "Sign Up" on the landing page.
2. Enter your username, email, and password.
3. Select your role: Citizen or Municipal Admin.
4. Enter your state and area (this determines which reports you see).
5. Enter your pincode.
6. Click "Register".
7. After registration, you'll receive a JWT token and be logged in automatically.

## Security Features

CivicPulse implements several security measures:

- **JWT Authentication**: Stateless token-based authentication for all protected routes.
- **Role-Based Access Control (RBAC)**: Admin routes are only accessible to admin users.
- **Rate Limiting**: Authentication endpoints are limited to 15 requests per 15 minutes. General API endpoints are limited to 100 requests per 15 minutes.
- **Password Hashing**: All passwords are hashed using bcrypt before storage.
- **CORS Protection**: Only whitelisted origins can make API calls.
- **File Upload Limits**: Image uploads are restricted by size and MIME type.

## Categories for Reporting

You can categorize your reports into:

- **Roads**: Potholes, broken roads, damaged footpaths, missing road signs.
- **Water**: Water leakage, pipeline damage, contaminated water supply, water logging.
- **Sanitation**: Garbage dumping, overflowing drains, open sewage, unhygienic conditions.
- **Electricity**: Broken streetlights, exposed wiring, power outages, damaged poles.
- **Other**: Any civic issue that doesn't fit the above categories.

## Geolocation

CivicPulse supports GPS-based location tagging:

- When creating a report, you can share your device's location.
- The browser will ask for permission to access your GPS coordinates.
- Coordinates (latitude and longitude) are stored with the report.
- This helps administrators pinpoint the exact location of issues.
- Location sharing is optional but recommended for accurate tracking.
