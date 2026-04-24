/**
 * Benefits Assistant script.
 * Source of truth: Notion page "Isolved Prototype Chat Script"
 *   https://www.notion.so/34cd307852be80bf8be8fb2bf7c76882
 *
 * Three scripted responses, matched by keyword:
 *   Response 1 — enrolled / my benefits / signed up
 *   Response 2 — eligible / eligibility / employer offer / available to me
 *   Response 3 — emergency room / emergency / ER
 *
 * Note: chat.js renders bot text via textContent, so markdown does not render.
 * Content uses plain text with Unicode bullets (•). For line breaks to show,
 * .msg should have `white-space: pre-wrap` in chat CSS.
 */

const RESPONSE_ENROLLED = [
  "Here's a summary of your current benefits enrollment:",
  "",
  "Health",
  "• Anthem HDHP 1650 (Medical) — High-deductible plan with a $1,650 individual / $3,300 family deductible and a $2,500 / $5,000 out-of-pocket max in-network.",
  "",
  "Dental & Vision",
  "• Guardian Dental PPO Standard — Preventive care covered at 100%, basic care at 80–90%, major care at 50–60%; $1,500 annual max.",
  "• VSP Network Signature Plan (Vision) — $130 frame/contact lens allowance, $25 materials copay.",
  "",
  "Financial / Savings",
  "• Limited Purpose FSA — Up to $3,300 for dental and vision expenses.",
  "",
  "Life & Disability",
  "• Guardian Life Insurance — $50,000 basic life benefit.",
  "• Guardian Short Term Disability — 60% of salary, up to $1,250/week, benefits start after 7 days, up to 26 weeks.",
  "• Guardian Long Term Disability — 60% of salary, up to $12,000/month, benefits start after 180 days.",
  "• Guardian Hospital Indemnity Premier — $2,500 per hospital admission + $100/day confinement benefit.",
  "",
  "Wellness",
  "• Employee Assistance Program (EAP)",
  "",
  "All plans are effective as of January 1, 2025. Let me know if you'd like more detail on any of these!"
].join('\n');

const RESPONSE_ELIGIBILITY = [
  "Here's the full list of benefits you're eligible for:",
  "",
  "Medical",
  "• Anthem HDHP 1650 (currently enrolled)",
  "• Anthem HDHP 2500",
  "",
  "Dental",
  "• Guardian Dental PPO Standard (currently enrolled)",
  "• Guardian Dental PPO Premier",
  "",
  "Vision",
  "• VSP Network Signature Plan (currently enrolled)",
  "",
  "Retirement & Financial",
  "• Empower 401(k)",
  "• Limited Purpose FSA (currently enrolled)",
  "• Commuter Benefits",
  "",
  "Life & Disability",
  "• Guardian Life Insurance (currently enrolled)",
  "• Guardian Short Term Disability (currently enrolled)",
  "• Guardian Long Term Disability (currently enrolled)",
  "",
  "Supplemental / Voluntary",
  "• Guardian Hospital Indemnity Premier (currently enrolled)",
  "• Guardian Hospital Indemnity Standard",
  "• Guardian Critical Illness",
  "• Guardian Accident Premier Plan",
  "• Guardian Accident Advantage Plan",
  "",
  "Wellness & EAP",
  "• Employee Assistance Program (currently enrolled)",
  "• OneMedical",
  "• Midi Health",
  "• LiveHealth Online",
  "• Spring Health",
  "• Rula",
  "",
  "Other",
  "• Wagmo Pet Wellness",
  "• MetLife Legal Plan",
  "• MetLife Identity Fraud Protection",
  "",
  "You're already enrolled in most of the core benefits. The main ones you haven't elected yet include the Anthem HDHP 2500, Guardian Dental PPO Premier, supplemental accident/critical illness plans, commuter benefits, 401(k), and several wellness programs. Want more detail on any of these?"
].join('\n');

const RESPONSE_DOCTOR = [
  "Here are some in-network doctors near you (NYC, zip 10001) that accept your Anthem HDHP 1650 plan:",
  "",
  "• Zeeshan Sardar — Orthopedic Surgeon",
  "  504 W 35th St · (212) 932-5100 · ⭐ 10",
  "",
  "• Ronald Lehman — Orthopedic Surgeon",
  "  504 W 35th St · (212) 932-5100 · ⭐ 10",
  "",
  "• Edward Connolly — Neurosurgeon",
  "  504 W 35th St · (212) 305-7950 · ⭐ 10",
  "",
  "• Paul Haffey — Physical Medicine & Pain",
  "  504 W 35th St · (212) 305-3535 · ⭐ 10",
  "",
  "• Eric Leung — Physical Medicine & Pain",
  "  504 W 35th St · (212) 305-3535 · ⭐ 9.98",
  "",
  "• Anna Larkin — Primary Care NP",
  "  504 W 35th St · (646) 962-7246 · ⭐ 9.82",
  "",
  "• Mark Weidenbaum — Orthopedic Surgeon",
  "  504 W 35th St · (212) 932-5100 · ⭐ 9.62",
  "",
  "• Shirin Peters — Internal Medicine / Family",
  "  548 W 28th St · (315) 201-0621 · ⭐ 8.47",
  "",
  "• Amanda Carmel — Internal Medicine",
  "  550 W 34th St FL 2 · (646) 819-5100 · ⭐ 8.6",
  "",
  "• Ricky Hsu — Internal Medicine",
  "  352 7th Ave #506 · (212) 627-7560 · ⭐ 8",
  "",
  "• Faika Khan — Family Medicine",
  "  535 8th Ave FL 6 · (516) 489-6600 · ⭐ 10",
  "",
  "• Jai Jung — Internal Medicine",
  "  352 7th Ave #601 · (212) 216-9580 · ⭐ 10",
  "",
  "Want me to filter by a specific specialty, like a primary care doctor or dermatologist?"
].join('\n');

const RESPONSE_ER = [
  "Based on your currently enrolled Anthem HDHP 1650 plan, an emergency room visit would cost you 10% coinsurance, with the deductible applying first.",
  "",
  "Here's what that means in practice:",
  "• You'd pay 100% of the ER bill until you hit your $1,650 individual deductible (assuming you haven't met it yet this year).",
  "• After the deductible is met, you'd pay 10% of costs until you reach your $2,500 individual out-of-pocket max (in-network).",
  "• Once you hit the out-of-pocket max, the plan covers 100%.",
  "",
  "The actual dollar amount depends on the nature of your visit — ER bills can range widely from a few hundred to several thousand dollars. Do you want help estimating based on a specific situation, or would you like to know if a particular doctor or facility is in-network?"
].join('\n');

window.CHAT_SCRIPT = {
  suggestions: [
    {
      label: 'Find a Doctor',
      value: 'find-doctor',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg>'
    },
    {
      label: 'Tell me about my Benefits',
      value: 'my-benefits',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none"/></svg>'
    },
    {
      label: 'Ask a question',
      value: 'ask-question',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M8 9a4 4 0 118 0c0 2-1.4 2.7-2.4 3.4-1 .6-1.6 1.2-1.6 2.4"/><circle cx="12" cy="18.3" r="1.1" fill="currentColor" stroke="none"/></svg>'
    }
  ],

  // Titan skin (?embedded) 2x2 grid; no thumbnails.
  // Only "current benefits" has a straightforward script match; others hit fallback.
  suggestions_titan: [
    { label: "What's the difference between HSA and FSA?", value: 'hsa-fsa' },
    { label: 'Tell me about my current benefits',          value: 'my-benefits' },
    { label: 'How does parental leave work?',              value: 'parental-leave' },
    { label: 'What are my retirement plan options?',       value: 'retirement-options' }
  ],

  flows: {
    'find-doctor': [
      { bot: RESPONSE_DOCTOR }
    ],
    'my-benefits': [
      { bot: RESPONSE_ENROLLED }
    ],
    'ask-question': [
      { bot: "Sure — what would you like to know? Try asking about your current enrollment, what you're eligible for, or what an emergency room visit might cost." }
    ],
    'enrolled-summary': [
      { bot: RESPONSE_ENROLLED }
    ],
    'eligibility': [
      { bot: RESPONSE_ELIGIBILITY }
    ],
    'er-cost': [
      { bot: RESPONSE_ER }
    ]
  },

  match: [
    { pattern: /emergency room|\bemergency\b|\bER\b/i,                   flow: 'er-cost' },
    { pattern: /eligible|eligibility|employer offer|available to me/i,   flow: 'eligibility' },
    { pattern: /doctor|provider|primary care/i,                          flow: 'find-doctor' },
    { pattern: /enrolled|my benefits|signed up/i,                        flow: 'enrolled-summary' }
  ],

  fallback: [
    { bot: "I don't have an answer for that yet. Try asking about your current benefits, what you're eligible for, finding a doctor, or what an ER visit would cost." }
  ]
};
