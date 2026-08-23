# CivicPulse Frequently Asked Questions (FAQ)

## Getting Started

### Q: How do I create an account on CivicPulse?
A: Go to the CivicPulse website and click "Sign Up". Fill in your username, email, password, select your role (Citizen or Admin), and enter your state, area, and pincode. Click "Register" and you'll be logged in automatically.

### Q: Is CivicPulse free to use?
A: Yes, CivicPulse is completely free for all citizens. There are no charges for reporting issues, upvoting, or commenting.

### Q: What do I need to use CivicPulse?
A: You need a web browser (Chrome, Firefox, Safari, or Edge), an email address for registration, and an internet connection. The platform works on both desktop and mobile devices.

### Q: I forgot my password. How do I reset it?
A: Currently, CivicPulse does not have a self-service password reset feature. Please contact the platform administrator for assistance.

### Q: Can I change my state or area after registration?
A: Currently, state and area are set during registration and cannot be changed through the UI. Contact an administrator if you need to update your location.

## Reporting Issues

### Q: What kind of issues can I report?
A: You can report any civic or municipal issue including broken roads, potholes, streetlight failures, water leakage, garbage dumping, open sewage, damaged infrastructure, and more. Issues are categorized into Roads, Water, Sanitation, Electricity, and Other.

### Q: Do I need to upload a photo?
A: Photos are optional but highly recommended. A clear photo helps administrators understand the severity and exact nature of the issue, leading to faster resolution.

### Q: What image formats are supported?
A: CivicPulse accepts JPEG (.jpg, .jpeg) and PNG (.png) images. The maximum file size is 5MB.

### Q: Can I edit my report after submitting?
A: Yes, you can edit the title and description of your own reports. Go to "My Reports", find the report, and click to edit. You cannot change the category or image after submission.

### Q: Can I delete my report?
A: Yes, you can delete your own reports from the "My Reports" page. Once deleted, the report and its comments will be permanently removed.

### Q: How do I know if my report has been seen?
A: When an administrator acknowledges your report, the status changes from "Pending" to "In Progress". You can check the status on your "My Reports" page.

### Q: How long does it take for a report to be resolved?
A: Resolution time varies depending on the type and severity of the issue, and the municipal authority's capacity. CivicPulse helps by surfacing the most upvoted issues to administrators.

## Community Features

### Q: What is the Community Feed?
A: The Community Feed shows all civic reports from your state. You can browse issues, upvote important ones, and add comments to share information.

### Q: How does upvoting work?
A: Click the upvote button on any report card to support it. Each user can upvote a report only once. Click again to remove your upvote. Reports with more upvotes get more attention from administrators.

### Q: Can I comment on any report?
A: Yes, any logged-in user can comment on any report in the Community Feed. Comments must be under 1000 characters.

### Q: Can I see reports from other states?
A: No, the Community Feed only shows reports from your registered state. This ensures you see locally relevant issues. Administrators are also restricted to their assigned jurisdiction.

## Admin Features

### Q: How do I become an admin?
A: During registration, select "Municipal Admin" as your role. Admin accounts should only be created by authorized municipal personnel. The role determines your dashboard access and permissions.

### Q: Can admins see reports from all states?
A: No, admins only see reports from their assigned state. Area-level admins are further restricted to their specific area. This is called Geographic Isolation and ensures data privacy.

### Q: How do I update a report's status?
A: As an admin, go to "All Reports", find the report, and use the status update feature. You can change status from Pending → In Progress → Resolved.

### Q: Can admins delete any report?
A: Yes, admins can delete any report within their jurisdiction. This is used for removing duplicate, spam, or inappropriate reports.

## Technical Questions

### Q: What browsers does CivicPulse support?
A: CivicPulse works on all modern browsers including Google Chrome, Mozilla Firefox, Apple Safari, and Microsoft Edge. We recommend using the latest version of your browser.

### Q: Is my data secure?
A: Yes. CivicPulse uses JWT-based authentication, bcrypt password hashing, rate limiting to prevent abuse, and CORS protection. Your password is never stored in plain text.

### Q: Does CivicPulse work on mobile?
A: Yes, CivicPulse has a mobile-responsive design. The interface adapts to smaller screens automatically.

### Q: What technology is CivicPulse built with?
A: CivicPulse uses React with Vite for the frontend, Node.js with Express for the backend, and MongoDB for the database. Authentication uses JSON Web Tokens (JWT).

## Troubleshooting

### Q: I'm getting "Too many attempts" error. What should I do?
A: This means you've hit the rate limit. For login/signup, the limit is 15 requests per 15 minutes. Wait 15 minutes and try again.

### Q: My report image isn't uploading. What should I check?
A: Make sure your image is in JPEG or PNG format and is under 5MB. If the issue persists, try with a smaller image or a different browser.

### Q: I can't see any reports in the Community Feed.
A: The Community Feed shows reports from your registered state. If no reports have been submitted in your state yet, the feed will be empty. Try submitting the first report for your area!

### Q: The website is loading slowly. What can I do?
A: Try clearing your browser cache, refreshing the page, or using a different browser. If the backend is hosted on a free tier service, it may take a few seconds to wake up on first access.
