# SHIKSHASETU — PILOT SCHOOL OPERATIONAL RUNBOOK
**For School Administrators, Principals, Teachers, and Gate Staff**

---

## 1. HOW TO ONBOARD YOUR SCHOOL

1. **Access Admin Portal**: Log into `https://app.shikshasetu.in/admin` using your assigned administrator credentials.
2. **Verify School Profile**: Confirm school name, address, and academic year settings under **School Settings**.
3. **Configure User Roles**: Ensure administrative staff are assigned the `admin` role.

---

## 2. HOW TO IMPORT STUDENTS, TEACHERS & GUARDIANS

1. **Prepare CSV Roster**:
   - `students.csv`: Columns required: `Name`, `Grade`, `Section`, `Roll Number`, `House`.
   - `teachers.csv`: Columns required: `Name`, `Email`, `Subject`.
   - `guardians.csv`: Columns required: `Guardian Name`, `Phone`, `Student Name`, `Relationship`.
2. **Navigate to CSV Import**: Click **Action Center** ➔ **Bulk CSV Roster Import**.
3. **Upload File**: Select the CSV file and choose the import category (`Students`, `Teachers`, or `Guardians`).
4. **Review Import Summary**: The system will display:
   - ✅ Total Successfully Imported
   - ⚠️ Duplicate Warnings
   - ❌ Failed Rows (with exact line numbers and reasons)

---

## 3. HOW TEACHERS TAKE OFFLINE ATTENDANCE

1. **Open Roll Call**: Navigate to `https://app.shikshasetu.in/teacher` and tap **Take Attendance**.
2. **Mark Roster**: Tap student status chips: **Present** (Green), **Absent** (Red), or **Late** (Yellow).
3. **Submit Roll Call**: Tap **[ SAVE ATTENDANCE ]**.
4. **Offline Mode**: If Wi-Fi or cellular signal drops, attendance is saved locally in IndexedDB. An **"Offline — Saved Locally"** badge will appear.
5. **Automatic Sync**: When internet connectivity returns, the engine syncs attendance logs to the server without creating duplicates.

---

## 4. HOW GATE STAFF VERIFY DISMISSAL & CHECKOUT

1. **Access Gate Portal**: Log into `https://app.shikshasetu.in/gate` on a smartphone or tablet.
2. **Scan / Enter Pass**: Point camera scanner at parent QR pass or type 6-digit pass code.
3. **Review Verification Card**:
   - 🟢 **✓ VERIFIED (GREEN)**: Confirms student identity, authorized guardian name, and photo ➔ Tap **`[ CONFIRM CHECKOUT ]`**.
   - 🔴 **✕ DO NOT RELEASE (RED)**: Pass is expired, revoked, or invalid. Do NOT release student.
   - 🟠 **⚠️ ALREADY USED (ORANGE)**: Displays original checkout timestamp.
4. **Emergency Pickup Override**:
   - If a guardian arrives without a digital pass during an emergency, tap **Emergency Override**.
   - Select student name, verify guardian photo ID, enter mandatory emergency reason, and tap **Confirm Emergency Release**.

---

## 5. HOW PARENTS REQUEST PICKUP PASSES

1. **Open Parent Portal**: Log into `https://app.shikshasetu.in/parent`.
2. **Request Pass**: Tap **Gate Passes** ➔ **Request Early Pickup Pass**.
3. **Select Pickup Time & Guardian**: Choose arrival time and authorized pickup person.
4. **View Dynamic QR Token**: Once approved by teacher or admin, tap **Show Digital QR Pass**. The QR code refreshes dynamically every 3 minutes for security.

---

## 6. HOW TEACHERS HANDLE STUDENT INTERVENTIONS

1. **Open Student Support Radar**: Navigate to **Teacher Workspace** ➔ **Student Support Radar**.
2. **Review Signal Alerts**: View automated academic/attendance risk flags.
3. **Approve Support Plan**: Review AI-recommended action items, edit notes if needed, and tap **[ APPROVE SUPPORT PLAN ]**.
4. **Parent Notification**: The parent receives a transparent, supportive notification outlining the student's personal growth goal.

---

## 7. HOW TO RECOVER FROM TECHNICAL ISSUES

- **Unsynced Attendance**: Tap **Retry Sync** on the attendance status banner.
- **Unverified Gate Pass**: Tap **Manual Code Entry** to enter 6-digit fallback pass code.
- **Support Escalation**: Report urgent technical issues to `support@shikshasetu.in` with school ID and timestamp.

---
*Operational Runbook Complete.*
