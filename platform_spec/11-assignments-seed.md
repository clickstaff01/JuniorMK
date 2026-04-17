# 11 — Assignments Seed (A1–A6)

Populate `prisma/seed/assignments.json` with the following structure. `weekOrder` matches weeks from `10-content-seed.md`.

## A1 — Insurance Fundamentals Self-Test (Week 1)

```json
{
  "code": "A1",
  "weekOrder": 1,
  "dueOffsetDays": 5,
  "order": 1,
  "titleTh": "A1 แบบทดสอบพื้นฐานประกัน",
  "titleEn": "A1 Insurance Fundamentals Self-Test",
  "descriptionTh": "ตอบด้วยคำของตัวเอง (ห้ามคัดลอกจาก Google)",
  "descriptionEn": "Answer in your own words. Do not copy from Google.",
  "questions": [
    { "order": 1, "type": "LONG_TEXT", "required": true,
      "promptTh": "ประกัน พ.ร.บ. คุ้มครองอะไร และไม่คุ้มครองอะไร?",
      "promptEn": "What does Act (พ.ร.บ.) insurance cover, and what does it NOT cover?" },
    { "order": 2, "type": "LONG_TEXT", "required": true,
      "promptTh": "Toyota Yaris Cross ปี 2024 (0 กม.) ควรแนะนำประกันชั้นไหน เพราะอะไร?",
      "promptEn": "A 2024 Toyota Yaris Cross (0 km) — which class should you recommend and why?" },
    { "order": 3, "type": "LONG_TEXT", "required": true,
      "promptTh": "Toyota Vios ปี 2015 ชั้นไหนคือ ‘sweet spot’ และทำไม?",
      "promptEn": "A 2015 Toyota Vios — which class is the 'sweet spot' and why?" },
    { "order": 4, "type": "LONG_TEXT", "required": true,
      "promptTh": "ความต่างของชั้น 2+ และ 3+ ที่สำคัญที่สุดคืออะไร?",
      "promptEn": "What is the main difference between Class 2+ and Class 3+?" },
    { "order": 5, "type": "LONG_TEXT", "required": true,
      "promptTh": "‘ค่าเสียหายส่วนแรก’ คืออะไร มีผลต่อเบี้ยอย่างไร?",
      "promptEn": "What is a 'deductible' and how does it change premium?" },
    { "order": 6, "type": "SHORT_TEXT", "required": true,
      "promptTh": "ชื่อบริษัทประกันไทย 5 แห่งที่เราน่าจะทำงานด้วย",
      "promptEn": "Name 5 Thai insurers we likely work with" },
    { "order": 7, "type": "SHORT_TEXT", "required": true,
      "promptTh": "หน่วยงานไหนกำกับดูแลประกันในประเทศไทย?",
      "promptEn": "Which regulator oversees insurance in Thailand?" },
    { "order": 8, "type": "LONG_TEXT", "required": true,
      "promptTh": "ทำไมประกันชั้น 1 ถึงทำกำไรให้โบรกเกอร์มากที่สุด?",
      "promptEn": "Why is Class 1 the most profitable product for a broker?" },
    { "order": 9, "type": "LONG_TEXT", "required": true,
      "promptTh": "ความแตกต่างระหว่าง ‘โบรกเกอร์’ และ ‘ตัวแทน’?",
      "promptEn": "What is the difference between a broker and an agent?" },
    { "order": 10, "type": "LONG_TEXT", "required": true,
      "promptTh": "ถ้าออกแบบ Landing page ประกันรถ จะใส่สัญญาณความเชื่อใจอะไรบ้าง?",
      "promptEn": "What trust signals would you add to a car insurance landing page?" },
    { "order": 11, "type": "LONG_TEXT", "required": true,
      "promptTh": "ทำไม Click Broker ถึงทำหน้า ‘ภาคอีสาน’ แยกออกมา?",
      "promptEn": "Why does Click Broker publish an 'Isan' landing page?" },
    { "order": 12, "type": "LONG_TEXT", "required": true,
      "promptTh": "‘Renewal’ ในวงการประกันหมายถึงอะไร และสำคัญอย่างไร?",
      "promptEn": "What does 'renewal' mean in insurance, and why is it important?" },
    { "order": 13, "type": "LONG_TEXT", "required": true,
      "promptTh": "CPL คืออะไร CPA คืออะไร ต่างกันอย่างไร?",
      "promptEn": "What is CPL? What is CPA? What is the difference?" },
    { "order": 14, "type": "SHORT_TEXT", "required": true,
      "promptTh": "ช่องทางไหนของเราทำลีดเข้ามามากที่สุดในตอนนี้? (ไปถามพี่ผู้จัดการ)",
      "promptEn": "Which of our channels produces the most inbound right now? (Ask Senior Manager)" },
    { "order": 15, "type": "LONG_TEXT", "required": true,
      "promptTh": "คู่แข่ง 3 รายพร้อมยกจุดเด่นของแต่ละราย 1 ข้อ",
      "promptEn": "Name 3 competitors and one thing each does well" },
    { "order": 16, "type": "LONG_TEXT", "required": true,
      "promptTh": "ทำไมลูกค้าเลือกใช้โบรกเกอร์แทนซื้อตรงจากบริษัทประกัน?",
      "promptEn": "Why do customers use a broker instead of buying direct?" },
    { "order": 17, "type": "LONG_TEXT", "required": true,
      "promptTh": "‘อู่ในเครือ’ คืออะไร ทำไมต้องสื่อสารในโฆษณา?",
      "promptEn": "What is an 'in-network garage' and why should it appear in ads?" },
    { "order": 18, "type": "LONG_TEXT", "required": true,
      "promptTh": "เขียนขั้นตอน 7 ข้อ ตั้งแต่ลูกค้าคลิกโฆษณาจนบริษัทจ่ายค่าคอม",
      "promptEn": "Describe the 7-step end-to-end money flow from ad click to commission" },
    { "order": 19, "type": "LONG_TEXT", "required": true,
      "promptTh": "ถ้าใช้งบ 10,000 บาท ได้ 40 ลีด ปิดได้ 6 — CPL และต้นทุนต่อยอดขาย = ?",
      "promptEn": "Spend 10,000 THB, 40 leads, 6 closes — what is CPL and cost per sale?" },
    { "order": 20, "type": "LONG_TEXT", "required": true,
      "promptTh": "สรุป 1 ย่อหน้า ‘Click Broker ทำอะไร?’ เหมือนอธิบายคุณยาย",
      "promptEn": "One-paragraph summary: 'What does Click Broker do?' as if explaining to your grandmother" }
  ]
}
```

## A2 — One-Pager: How Click Broker Makes Money (Week 1)

```json
{
  "code": "A2",
  "weekOrder": 1,
  "dueOffsetDays": 7,
  "order": 2,
  "titleTh": "A2 One-Pager วิธีที่ Click Broker หารายได้",
  "titleEn": "A2 One-Pager: How Click Broker Makes Money",
  "questions": [
    { "order": 1, "type": "LONG_TEXT", "required": true,
      "promptTh": "flow 7 ข้อ (เป็นข้อ ๆ หรืออธิบายเป็นย่อหน้า)",
      "promptEn": "The 7-step flow (numbered or paragraph)" },
    { "order": 2, "type": "LONG_TEXT", "required": true,
      "promptTh": "เรา ‘จ่ายเงิน’ ไปกับอะไรบ้าง",
      "promptEn": "Where we spend money" },
    { "order": 3, "type": "LONG_TEXT", "required": true,
      "promptTh": "เรา ‘หาเงิน’ ได้จากอะไร",
      "promptEn": "Where we earn money" },
    { "order": 4, "type": "LONG_TEXT", "required": true,
      "promptTh": "คาดการณ์อัตรากำไรขั้นต้นต่อกรมธรรม์ พร้อมสมมติฐาน",
      "promptEn": "Best guess of gross profit margin per policy with assumptions" },
    { "order": 5, "type": "SHORT_TEXT", "required": true,
      "promptTh": "คำถามที่ยังสงสัยอยู่ 1 ข้อ",
      "promptEn": "One question you still have" },
    { "order": 6, "type": "FILE_UPLOAD", "required": false,
      "promptTh": "แนบรูป/ไฟล์ One-Pager (ถ้ามี)",
      "promptEn": "Attach the One-Pager file (optional)",
      "config": { "accept": ["pdf","png","jpg","docx","pptx"], "maxFiles": 2 } }
  ]
}
```

## A3 — Channel Audit Report (Week 2)

```json
{
  "code": "A3",
  "weekOrder": 2,
  "dueOffsetDays": 7,
  "order": 1,
  "titleTh": "A3 รายงานตรวจช่องทาง",
  "titleEn": "A3 Channel Audit Report",
  "descriptionTh": "สำหรับแต่ละช่องทาง ใช้กรอบ 10 ข้อ พร้อมแนบ 2 screenshot และ 2 ไอเดียการปรับปรุง",
  "descriptionEn": "For each channel, answer 10 questions + 2 screenshots + 2 improvement ideas",
  "questions": [
    { "order": 1, "type": "TABLE", "required": true,
      "promptTh": "ตารางออดิทต่อช่องทาง",
      "promptEn": "Per-channel audit table",
      "config": {
        "rows": [
          "clickbroker.co.th",
          "motor.clickbroker.co.th",
          "motor.clickbroker.co.th/northeast",
          "Facebook Page",
          "TikTok",
          "LINE OA",
          "Google Ads",
          "Facebook Ads",
          "LINE Ads",
          "TikTok Ads",
          "Inbound (Call/Form/FB/LINE)"
        ],
        "columns": [
          "หน้าที่หลัก / Primary job",
          "กลุ่มเป้าหมาย / Target audience",
          "ข้อความหลัก / Main message",
          "CTA",
          "ช่องทางติดต่อ / Contact path",
          "มือถือโหลดเร็ว? / Mobile speed",
          "สัญญาณเชื่อใจ / Trust signals",
          "Tracking ครบ? / Tracking complete?",
          "จุดเด่น / One thing great",
          "แก้พรุ่งนี้เลย 2 อย่าง / 2 fixes"
        ]
      } },
    { "order": 2, "type": "FILE_UPLOAD", "required": true,
      "promptTh": "Screenshot สนับสนุน (อย่างน้อย 2 รูปต่อช่องทาง)",
      "promptEn": "Supporting screenshots (minimum 2 per channel)",
      "config": { "accept": ["png","jpg","pdf"], "maxFiles": 30 } },
    { "order": 3, "type": "LONG_TEXT", "required": true,
      "promptTh": "สรุปข้อสังเกตระดับภาพรวม 200 คำ",
      "promptEn": "Overall observations (200 words)" }
  ]
}
```

## A4 — CPL Breakdown (Week 3)

```json
{
  "code": "A4",
  "weekOrder": 3,
  "dueOffsetDays": 5,
  "order": 1,
  "titleTh": "A4 CPL Breakdown",
  "titleEn": "A4 CPL Breakdown",
  "questions": [
    { "order": 1, "type": "TABLE", "required": true,
      "promptTh": "ขอข้อมูลเดือนล่าสุดจากเอเจนซี่และพี่ผู้จัดการ แล้วเติมตาราง",
      "promptEn": "Get last month's data and fill in",
      "config": {
        "rows": [
          "Google Search",
          "Google Display / PMax",
          "Facebook Ads",
          "LINE Ads",
          "TikTok Ads",
          "Facebook Page (organic)",
          "LINE OA (organic)",
          "Direct / SEO"
        ],
        "columns": [
          "งบ (บาท) / Spend",
          "ลีด / Leads",
          "CPL",
          "Close rate",
          "กรมธรรม์ / Policies",
          "ต้นทุน/ยอดขาย / Cost per sale"
        ]
      } },
    { "order": 2, "type": "LONG_TEXT", "required": true,
      "promptTh": "สรุป 200 คำ: ช่องไหนดีสุดตาม CPL? ช่องไหนดีสุดตามต้นทุนต่อยอดขาย? จะแก้อะไร?",
      "promptEn": "200-word commentary: best by CPL? best by cost per sale? what would you change?" }
  ]
}
```

## A5 — Tracking Audit (Week 3)

```json
{
  "code": "A5",
  "weekOrder": 3,
  "dueOffsetDays": 7,
  "order": 2,
  "titleTh": "A5 Tracking Audit",
  "titleEn": "A5 Tracking Audit",
  "questions": [
    { "order": 1, "type": "TABLE", "required": true,
      "promptTh": "แต่ละช่องทาง ตอบ ใช่/ไม่ใช่ และถ้า ‘ไม่ใช่’ ระบุวิธีแก้สั้น ๆ",
      "promptEn": "For each channel: Yes/No, and for each No, briefly propose a fix",
      "config": {
        "rows": [
          "Google Search","Google Display / PMax","Facebook Ads","LINE Ads","TikTok Ads",
          "Facebook Page (organic)","LINE OA (organic)","Direct / SEO"
        ],
        "columns": [
          "UTM tagged?","GA4 event?","FB Pixel event?","Call tracked?","CRM source captured?","Dedup rule?"
        ]
      } },
    { "order": 2, "type": "LONG_TEXT", "required": true,
      "promptTh": "3 ข้อเสนอที่ควรทำก่อน (quick wins) อ้างเหตุผล",
      "promptEn": "Top 3 quick-win proposals with reasoning" }
  ]
}
```

## A6 — Improvement Proposal Deck (Week 4)

```json
{
  "code": "A6",
  "weekOrder": 4,
  "dueOffsetDays": 7,
  "order": 1,
  "titleTh": "A6 Deck นำเสนอ MD (15 สไลด์)",
  "titleEn": "A6 Improvement Proposal Deck (15 slides)",
  "questions": [
    { "order": 1, "type": "LONG_TEXT", "required": true,
      "promptTh": "Executive summary — 1 ตัวเลขที่คุณจะขยับ และจะขยับเท่าไหร่",
      "promptEn": "Executive summary — one number you will move and by how much" },
    { "order": 2, "type": "LONG_TEXT", "required": true,
      "promptTh": "สถานะปัจจุบัน: CPL, close rate, สัดส่วนลีดตามช่อง (อ้างจาก A4)",
      "promptEn": "Current state: CPL, close rate, lead mix (from A4)" },
    { "order": 3, "type": "LONG_TEXT", "required": true,
      "promptTh": "ข้อสังเกตแต่ละช่อง (อ้างจาก A3)",
      "promptEn": "Channel-by-channel observations (from A3)" },
    { "order": 4, "type": "LONG_TEXT", "required": true,
      "promptTh": "ช่องโหว่ Tracking (อ้างจาก A5)",
      "promptEn": "Tracking gaps (from A5)" },
    { "order": 5, "type": "LONG_TEXT", "required": true,
      "promptTh": "Experiment #1 — brief 8 หัวข้อ + คะแนน ICE",
      "promptEn": "Experiment #1 — 8-item brief + ICE score" },
    { "order": 6, "type": "LONG_TEXT", "required": true,
      "promptTh": "Experiment #2 — brief 8 หัวข้อ + คะแนน ICE",
      "promptEn": "Experiment #2 — 8-item brief + ICE score" },
    { "order": 7, "type": "LONG_TEXT", "required": true,
      "promptTh": "Experiment #3 — brief 8 หัวข้อ + คะแนน ICE",
      "promptEn": "Experiment #3 — 8-item brief + ICE score" },
    { "order": 8, "type": "LONG_TEXT", "required": true,
      "promptTh": "Experiment #4 — brief 8 หัวข้อ + คะแนน ICE",
      "promptEn": "Experiment #4 — 8-item brief + ICE score" },
    { "order": 9, "type": "LONG_TEXT", "required": true,
      "promptTh": "Experiment #5 — brief 8 หัวข้อ + คะแนน ICE",
      "promptEn": "Experiment #5 — 8-item brief + ICE score" },
    { "order": 10, "type": "LONG_TEXT", "required": true,
      "promptTh": "คำขอ — ต้องการงบ/อนุมัติอะไรจาก MD",
      "promptEn": "Ask — what budget or approval you need from the MD" },
    { "order": 11, "type": "FILE_UPLOAD", "required": true,
      "promptTh": "แนบไฟล์ Deck (.pptx หรือ pdf)",
      "promptEn": "Attach the deck file (.pptx or pdf)",
      "config": { "accept": ["pptx","pdf"], "maxFiles": 2 } }
  ]
}
```
