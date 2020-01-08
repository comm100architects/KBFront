const livechatMenu = [
  { entityName: "dashboard", label: "Dashboard", icon: "dashboard" },
  { entityName: "agentConsole", label: "Get Online & Chat", icon: "chat" },
  { entityName: "install", label: "Install", icon: "code" },
  {
    label: "Campaign",
    icon: "create",
  },
  {
    entityName: "chatbutton",
    label: "Chat Button",
    parentMenuLabel: "Campaign",
  },
  {
    entityName: "chatwindow",
    label: "Chat Window",
    parentMenuLabel: "Campaign",
  },
  {
    label: "Settings",
    icon: "settings",
  },
  {
    entityName: "cannedMessages",
    label: "Canned Messages",
    parentMenuLabel: "Settings",
  },
  {
    entityName: "department",
    label: "Department",
    parentMenuLabel: "Settings",
  },
  {
    entityName: "history",
    label: "History",
    icon: "history",
  },
  {
    entityName: "reports",
    label: "Reports",
    icon: "assessment",
  },
  {
    entityName: "maxon",
    label: "MaximumOn",
    icon: "groupWork",
  },
];

const ticketMenu = [
  { entityName: "dashboard", label: "Dashboard", icon: "dashboard" },
];

const botMenu = [
  { entityName: "dashboard", label: "Dashboard", icon: "dashboard" },
];

const kbMenu = [
  {
    entityName: "article",
    label: "Articles",
    icon: "description",
    isMultiRowsUI: true,
  },
  { entityName: "image", label: "Images", icon: "image", isMultiRowsUI: true },
  {
    entityName: "design",
    label: "Design",
    icon: "viewQuilt",
    isMultiRowsUI: true,
  },
  {
    label: "Advanced",
    icon: "widgets",
  },
  {
    entityName: "customPage",
    label: "Custom Pages",
    isMultiRowsUI: true,
    parentMenuLabel: "Advanced",
  },
  {
    entityName: "knowledgeBase",
    label: "Multiple Knowledge Bases",
    isMultiRowsUI: true,
    parentMenuLabel: "Advanced",
  },
];

const accountMenu = [
  { entityName: "dashboard", label: "Dashboard", icon: "dashboard" },
];

export default () => [
  {
    label: "Live Chat",
    menu: livechatMenu,
  },
  {
    label: "Ticket",
    menu: ticketMenu,
  },
  { label: "Bot", menu: botMenu },
  { label: "KB", menu: kbMenu },
  {
    label: "Account",
    menu: accountMenu,
  },
];
