const livechatAppMenu = [
  { name: "dashboard", label: "Dashboard", icon: "dashboard" },
  { name: "agentConsole", label: "Get Online & Chat", icon: "chat" },
  { name: "install", label: "Install", icon: "code" },
  {
    label: "Campaign",
    icon: "create",
    items: [
      { name: "chatbutton", label: "Chat Button" },
      { name: "chatwindow", label: "Chat Window" },
    ],
  },
  {
    label: "Settings",
    icon: "settings",
    items: [
      { name: "cannedMessages", label: "Canned Messages" },
      { name: "department", label: "Department" },
    ],
  },
  {
    name: "history",
    label: "History",
    icon: "history",
  },
  {
    name: "reports",
    label: "Reports",
    icon: "assessment",
  },
  {
    name: "maxon",
    label: "MaximumOn",
    icon: "groupWork",
  },
];

const ticketAppMenu = [
  { name: "dashboard", label: "Dashboard", icon: "dashboard" },
];

const botAppMenu = [
  { name: "dashboard", label: "Dashboard", icon: "dashboard" },
];

const kbAppMenu = [
  { name: "articles", label: "Articles", icon: "description" },
  { name: "images", label: "Images", icon: "image" },
  {
    name: "designs",
    label: "Design",
    icon: "viewQuilt",
    pages: [
      { relatviePath: "", pageId: "kb.designs" },
      { relatviePath: "edit", pageId: "kb.designs.edit" },
    ],
  },
  {
    name: "settings",
    label: "Settings",
    icon: "settings",
    pages: [{ relatviePath: "", pageId: "kb.multipleKbs.edit" }],
  },
  {
    label: "Advanced",
    icon: "widgets",
    items: [
      {
        name: "customPages",
        label: "Custom Pages",
        pages: [
          { relatviePath: "", pageId: "kb.customPages" },
          { relatviePath: "edit", pageId: "kb.customPages.edit" },
          { relatviePath: "new", pageId: "kb.customPages.new" },
        ],
      },
      {
        name: "knowledgeBases",
        label: "Multiple Knowledge Bases",
        pages: [
          { relatviePath: "", pageId: "kb.multipleKbs" },
          { relatviePath: "edit", redirectTo: "../settings/" },
          { relatviePath: "new", pageId: "kb.multipleKbs.new" },
        ],
      },
    ],
  },
];

const accountAppMenu = [
  { name: "dashboard", label: "Dashboard", icon: "dashboard" },
];

export default () => [
  {
    name: "livechat",
    label: "Live Chat",
    menu: livechatAppMenu,
    defaultPage: "dashboard",
  },
  {
    name: "ticket",
    label: "Ticket",
    menu: ticketAppMenu,
    defaultPage: "dashboard",
  },
  { name: "bot", label: "Bot", menu: botAppMenu, defaultPage: "dashboard" },
  { name: "kb", label: "KB", menu: kbAppMenu, defaultPage: "articles" },
  {
    name: "account",
    label: "Account",
    menu: accountAppMenu,
    defaultPage: "dashboard",
  },
];
