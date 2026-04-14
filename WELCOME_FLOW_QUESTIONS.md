# Welcome Flow Questions

This document contains all the questions asked during the welcome flow of the AI Payroll Assistant application.

## Flow Sequence

### 1. Role Question (Text Input)
**Question:** "Let's start with the basics - what's your role at the company?"
- Type: Text input
- Purpose: Understand user's position to customize setup experience

### 2. Time in Role (Text Input)
**Question:** "How long have you been in [role]?"
- Type: Text input
- Purpose: Assess experience level and customize guidance accordingly

### 3. Team Involvement (Text Input)
**Question:** "Will anyone else be helping you with the setup process?"
- Type: Text input
- Purpose: Identify if additional collaborators need access
- Context: "Some people prefer to handle this themselves, while others like to bring in their accountant, IT person, or a trusted colleague."

### 3b. Team Details (Conditional - Text Input)
If user indicates they have help, ask:
- **"What's their name?"** (if not pre-filled)
- **"What's their email address?"**
- **"What's their role in your company?"** (if not pre-filled)
  - Example roles: Accountant, IT Manager, Office Manager

### 4. Team Size (Text Input)
**Question:** "How many people will you be paying?"
- Type: Text input
- Purpose: Determine company size for appropriate setup
- Context: "Include everyone - full-time, part-time, contractors, everyone who gets a paycheck from your company."

### 5. NAICS Code Confirmation (Radio Buttons)
**Question:** "Does this match your primary business activity?"
- Type: Radio buttons with tier 2 options
- Options:
  - "Yes, that's correct"
  - "No, this needs to be changed"
  - "I need to verify with a coworker"
- Tier 2 options:
  - "What is a NAICS Code and Why Do I Need One?"
  - "What happens if I choose the wrong NAICS code?"
  - "Does the NAICS code affect taxes?"

### 5a. Business Description (Conditional - Text Input)
If user selects "No" to NAICS code:
**Question:** "Please describe what your company does:"
- Type: Text input
- Purpose: Find accurate NAICS code based on business description

### 5b. NAICS Selection (Conditional - Radio Buttons)
After business description:
**Question:** "Does this look correct for your business?"
- Type: Radio buttons
- Shows suggested NAICS code(s) based on description

### 5c. To-Do Confirmation (Conditional - Radio Buttons)
If user needs to verify with coworker:
**Question:** "Would you like me to create a to-do item to verify the NAICS code with your coworker?"
- Options:
  - "Yes, create a to-do item"
  - "No, I'll handle it myself"

### 6. Hourly Employees (Text Input)
**Question:** "Question 1 of 2: Do you have hourly employees?"
- Type: Text input
- Purpose: Determine workforce composition
- Context: "This includes anyone who gets paid by the hour - full-time, part-time, or seasonal workers."

### 7. Contractors (Text Input)
**Question:** "Question 2 of 2: Do you have contractors?"
- Type: Text input
- Purpose: Identify 1099 workers
- Context: "These are people who work for you but aren't employees - they usually get 1099s instead of W-2s."

### 8. Pay Schedule Unity (Text Input)
**Question:** "Do you pay all employees on the same schedule?"
- Type: Text input
- Purpose: Determine pay schedule complexity
- Context: "For example, everyone gets paid bi-weekly on the same dates, or do different groups get paid on different schedules?"

### 9. Pay Schedule Date Selection
#### 9a. Single Schedule (Conditional - Calendar Selection)
If all employees on same schedule:
**Question:** "When do you want to run your first payroll with us?"
- Type: Interactive calendar widget
- Purpose: Set implementation timeline start date

#### 9b. Multiple Schedules (Conditional - Calendar Selection)
If different schedules:
**Question:** "For now, just select the earliest date you want to pay your first group of employees:"
- Type: Interactive calendar widget
- Purpose: Set initial timeline date (details handled later)

## Question Flow Logic

1. Always starts with Role Question
2. Progresses through Time in Role and Team Involvement
3. Branches to Team Details if user has help
4. Continues to Team Size and NAICS confirmation
5. May branch to Business Description if NAICS needs change
6. May create to-do if verification needed
7. Asks about workforce composition (hourly/contractors)
8. Ends with pay schedule setup and date selection

## Response Types
- **Text Input**: Free-form text responses
- **Radio Buttons**: Single-choice selections
- **Calendar Widget**: Interactive date picker
- **Two-tier Interactive**: Primary actions with secondary "Related questions"