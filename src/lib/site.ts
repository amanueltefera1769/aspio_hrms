export const site = {
  name: "Aspio HR",
  email: "semere.e@aspio.se",
  location: "Addis Ababa, Ethiopia",
  demo: "/demo",
};

export const features = [
  { id: "attendance", number: "01", title: "Attendance, without the guesswork.", shortTitle: "Attendance", icon: "clock", intro: "Two ways to check in. One attendance record.", description: "Let staff check in with the app or a supported biometric device. Bring arrivals, departures and logged hours into the same view, so managers can see the workday clearly.", points: ["App and biometric check-in", "Check-ins, check-outs and logged hours", "A shared attendance record for your team"], image: "/images/attendance.webp", alt: "Aspio HR graphic showing biometric and app check-in feeding one attendance record" },
  { id: "chat", number: "02", title: "Keep the conversation with the work.", shortTitle: "Team chat", icon: "chat", intro: "Direct messages and group chats, in one place.", description: "Talk to a colleague, coordinate with a branch or keep the HR team up to date. Company conversations have a place alongside the people and work they belong to.", points: ["Direct conversations with colleagues", "Group chats for teams and departments", "Company communication inside your HR workspace"], image: "/images/chat.webp", alt: "Aspio HR graphic showing direct messaging and a group conversation in the HR system" },
  { id: "payroll", number: "03", title: "A calmer close to the month.", shortTitle: "Payroll preparation", icon: "file", intro: "Month-end payroll. Without the scramble.", description: "Bring staff records and attendance together for payroll preparation. Give the person reviewing the month an organized starting point, instead of another pile of spreadsheets.", points: ["Staff records and attendance together", "Organized information for payroll preparation", "A clearer handover for month-end review"], image: "/images/payroll.webp", alt: "Aspio HR payroll preparation graphic with organized staff, attendance and salary records" },
  { id: "reports", number: "04", title: "Your staff data. A clearer picture.", shortTitle: "Reports", icon: "chart", intro: "Turn organized records into informed decisions.", description: "Review attendance, staff and branches from one reporting workspace. Look at the detail behind the workday and give your next decision a better starting point.", points: ["Attendance and staff reporting", "A view across branches", "Review hours and team activity"], image: "/images/reports.webp", alt: "Aspio HR reporting graphic with attendance, staff and branch summaries" },
  { id: "branches", number: "05", title: "Every branch. One place to look.", shortTitle: "Branch management", icon: "building", intro: "Multiple branches. One HR system.", description: "Keep staff connected to the right branch and see the wider organization from one place. Local teams can stay organized while the business keeps a shared view.", points: ["Manage staff across locations", "Keep branch records organized", "A connected view of your organization"], image: "/images/branches.webp", alt: "Aspio HR graphic connecting three company branches to one HR system" },
] as const;

export const modules = [
  ["Dashboard", "Start with a shared view of your team.", "dashboard"],
  ["Staff CRM", "Keep profiles, roles and contact details together.", "users"],
  ["Calendar", "See people and schedules in context.", "calendar"],
  ["Organization chart", "Make reporting lines easier to understand.", "org"],
  ["Files", "Give staff documents a clear home.", "folder"],
  ["Users & settings", "Manage access and your company workspace.", "settings"],
] as const;
