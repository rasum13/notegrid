export const currentUser = {
  id: "u1",
  name: "Rasum Subedi",
  initials: "RS",
  faculty: "BSc CSIT",
  semester: 6,
  reputation: 340,
  reputationTier: "Contributor",
};

export const faculties = ["BSc CSIT", "BIT", "BE Computer"];

export const subjects = [
  { id: "s1", name: "Software Engineering", semester: 6 },
  { id: "s2", name: "Computer Networks", semester: 6 },
  { id: "s3", name: "Database Management Systems", semester: 5 },
  { id: "s4", name: "Operating Systems", semester: 5 },
];

export const resources = [
  {
    id: "r1",
    title: "Requirements engineering complete notes",
    description:
      "Covers functional and non-functional requirements, elicitation techniques, and SRS documentation with worked examples from past exams.",
    type: "pdf",
    subject: "Software Engineering",
    chapter: "Ch 3 — Requirements",
    uploader: "Anishek Chaudhary",
    uploaderInitials: "AC",
    upvotes: 128,
    createdAt: "2026-08-02",
    aiSummary:
      "A concise walkthrough of requirement types, elicitation methods (interviews, surveys, observation), and how to structure a software requirements specification document.",
    tags: ["requirements", "SRS", "elicitation"],
  },
  {
    id: "r2",
    title: "UML diagrams explained — video playlist",
    description:
      "External link to a clear walkthrough of use case, class, and sequence diagrams with worked examples.",
    type: "link",
    url: "https://example.com/uml-playlist",
    subject: "Software Engineering",
    chapter: "Ch 5 — Modeling",
    uploader: "Sujit Rai",
    uploaderInitials: "SR",
    upvotes: 94,
    createdAt: "2026-08-10",
    aiSummary:
      "A five-part series covering UML notation, with emphasis on drawing sequence diagrams for client-server interactions.",
    tags: ["UML", "diagrams", "modeling"],
  },
  {
    id: "r3",
    title: "Software process models — solved questions",
    description:
      "Past year solved questions comparing waterfall, incremental, and agile models.",
    type: "pdf",
    subject: "Software Engineering",
    chapter: "Ch 2 — Process Models",
    uploader: "Rasum Subedi",
    uploaderInitials: "RS",
    upvotes: 71,
    createdAt: "2026-07-28",
    aiSummary:
      "Solved answers comparing waterfall, incremental, and agile approaches, with a short table of trade-offs likely to appear in exams.",
    tags: ["process models", "agile", "past questions"],
  },
  {
    id: "r4",
    title: "TCP/IP layer breakdown cheat sheet",
    description:
      "One-page reference mapping protocols to each layer of the TCP/IP stack, with common port numbers.",
    type: "pdf",
    subject: "Computer Networks",
    chapter: "Ch 1 — Network Models",
    uploader: "Anishek Chaudhary",
    uploaderInitials: "AC",
    upvotes: 56,
    createdAt: "2026-08-14",
    aiSummary:
      "A single-page reference sheet mapping common protocols and port numbers to each TCP/IP layer.",
    tags: ["networking", "TCP/IP", "cheat sheet"],
  },
  {
    id: "r5",
    title: "Database normalization walkthrough",
    description:
      "Step-by-step normalization from 1NF through BCNF using a real registration-system example.",
    type: "pdf",
    subject: "Database Management Systems",
    chapter: "Ch 4 — Normalization",
    uploader: "Sujit Rai",
    uploaderInitials: "SR",
    upvotes: 112,
    createdAt: "2026-08-05",
    aiSummary:
      "Walks through normal forms 1NF to BCNF using a student registration schema, flagging common exam pitfalls at each step.",
    tags: ["normalization", "DBMS", "schema design"],
  },
];

export const reports = [
  {
    id: "rep1",
    resourceTitle: "Old OS notes (2019 syllabus)",
    reason: "Outdated — syllabus changed in 2023",
    reportedBy: "Anonymous student",
    status: "pending",
  },
  {
    id: "rep2",
    resourceTitle: "Networking assignment answers",
    reason: "Possible copyright — matches a paid course PDF",
    reportedBy: "Anonymous student",
    status: "pending",
  },
];

export const allUsers = [
  { id: "u1", name: "Rasum Subedi", role: "Student", reputation: 340, status: "active" },
  { id: "u2", name: "Anishek Chaudhary", role: "Student", reputation: 512, status: "active" },
  { id: "u3", name: "Sujit Rai", role: "Student", reputation: 288, status: "active" },
  { id: "u4", name: "Dr. Prakash Sharma", role: "Instructor", reputation: 0, status: "active" },
];
