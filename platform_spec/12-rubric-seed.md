# 12 — Rubric Seed

Populate `prisma/seed/rubrics.json`. One rubric per assignment. Each row has three level descriptors (GREAT / OK / REWORK) in Thai and English.

```json
[
  {
    "assignmentCode": "A1",
    "rows": [
      {
        "order": 1,
        "labelTh": "ตอบด้วยคำของตัวเอง",
        "labelEn": "Own words, not copy-paste",
        "greatTh": "คำตอบเป็นภาษาของน้องเอง เข้าใจจริง",
        "greatEn": "Clearly her own language; shows real understanding",
        "okTh": "บางข้อยังเหมือนคัดลอก",
        "okEn": "Some questions still feel copied",
        "reworkTh": "คัดลอกมาตรง ๆ จาก Google",
        "reworkEn": "Copy-paste from Google"
      },
      {
        "order": 2,
        "labelTh": "อธิบาย ‘ทำไม’ ไม่ใช่แค่ ‘อะไร’",
        "labelEn": "Explains 'why', not only 'what'",
        "greatTh": "มีเหตุผลประกอบทุกข้อที่ต้องอธิบาย",
        "greatEn": "Reasoning present for every 'why' question",
        "okTh": "มีเหตุผลบางข้อ",
        "okEn": "Reasoning on some questions",
        "reworkTh": "ขาดคำอธิบาย",
        "reworkEn": "Missing reasoning"
      },
      {
        "order": 3,
        "labelTh": "ความถูกต้องเชิงประกัน",
        "labelEn": "Factual correctness",
        "greatTh": "ข้อมูลประกันถูกต้องเกือบทั้งหมด",
        "greatEn": "Insurance facts mostly correct",
        "okTh": "มีความผิดพลาดเล็กน้อย",
        "okEn": "Minor inaccuracies",
        "reworkTh": "ผิดเนื้อหาหลักหลายข้อ",
        "reworkEn": "Multiple factual errors"
      }
    ]
  },
  {
    "assignmentCode": "A2",
    "rows": [
      {
        "order": 1,
        "labelTh": "Flow 7 ข้อชัดเจน",
        "labelEn": "Clear 7-step flow",
        "greatTh": "เห็นลำดับงานครบตั้งแต่คลิก → ค่าคอม",
        "greatEn": "Full path from click to commission",
        "okTh": "ขาด 1–2 ขั้น",
        "okEn": "Missing 1–2 steps",
        "reworkTh": "ไม่ครบ / ไม่เข้าใจ",
        "reworkEn": "Incomplete / not understood"
      },
      {
        "order": 2,
        "labelTh": "Math กำไรสมเหตุสมผล",
        "labelEn": "Realistic margin math",
        "greatTh": "ตัวเลข + สมมติฐานชัดและสมเหตุสมผล",
        "greatEn": "Numbers + assumptions reasonable",
        "okTh": "มีตัวเลขแต่สมมติฐานไม่ครบ",
        "okEn": "Numbers without assumptions",
        "reworkTh": "ไม่มีตัวเลข",
        "reworkEn": "No numbers at all"
      },
      {
        "order": 3,
        "labelTh": "มีคำถามจริง",
        "labelEn": "Real question at end",
        "greatTh": "คำถามเจาะจงและตอบไม่ได้ง่าย",
        "greatEn": "Specific question not easily answered",
        "reworkTh": "ไม่มีคำถาม",
        "reworkEn": "No question included"
      }
    ]
  },
  {
    "assignmentCode": "A3",
    "rows": [
      {
        "order": 1,
        "labelTh": "ความครบถ้วนต่อช่องทาง",
        "labelEn": "Per-channel completeness",
        "greatTh": "ครบทุก 11 ช่อง + screenshot + 2 ไอเดียต่อช่อง",
        "greatEn": "All 11 channels + screenshots + 2 ideas each",
        "okTh": "ครบช่องทางแต่ screenshot / ไอเดียไม่ครบ",
        "okEn": "All channels but screenshots/ideas incomplete",
        "reworkTh": "ข้ามหลายช่อง",
        "reworkEn": "Skipped several channels"
      },
      {
        "order": 2,
        "labelTh": "คุณภาพของข้อสังเกต",
        "labelEn": "Observation quality",
        "greatTh": "ข้อสังเกตลึก ไม่ซ้ำกับ checklist",
        "greatEn": "Insights go beyond the checklist",
        "okTh": "สังเกตได้แต่ไม่ลึก",
        "okEn": "Surface-level only",
        "reworkTh": "คัดลอก checklist กลับมา",
        "reworkEn": "Regurgitated the checklist"
      },
      {
        "order": 3,
        "labelTh": "คุณภาพของไอเดีย",
        "labelEn": "Idea quality",
        "greatTh": "ไอเดียเจาะจง ทดสอบได้จริง",
        "greatEn": "Specific and testable",
        "okTh": "ไอเดียกว้างเกินไป",
        "okEn": "Too broad",
        "reworkTh": "ไอเดียคลุมเครือ / ไม่เกี่ยว",
        "reworkEn": "Vague or off-topic"
      }
    ]
  },
  {
    "assignmentCode": "A4",
    "rows": [
      {
        "order": 1,
        "labelTh": "ตารางครบ",
        "labelEn": "Table completeness",
        "greatTh": "กรอกข้อมูลครบทุกเซลล์",
        "greatEn": "All cells filled with real data",
        "okTh": "บางเซลล์ว่าง",
        "okEn": "Some cells blank",
        "reworkTh": "ว่างจำนวนมาก",
        "reworkEn": "Many cells blank"
      },
      {
        "order": 2,
        "labelTh": "เชื่อมโยงคุณภาพลีด",
        "labelEn": "Quality-aware commentary",
        "greatTh": "วิเคราะห์โดยอ้างเทเลเซลส์ ไม่ดูแต่ CPL",
        "greatEn": "Uses telesales quality, not just CPL",
        "okTh": "กล่าวถึงคุณภาพเล็กน้อย",
        "okEn": "Brief mention of quality",
        "reworkTh": "ดูแต่ตัวเลข CPL",
        "reworkEn": "Numbers only, no quality lens"
      }
    ]
  },
  {
    "assignmentCode": "A5",
    "rows": [
      {
        "order": 1,
        "labelTh": "ครอบคลุมทุกช่อง",
        "labelEn": "All channels covered",
        "greatTh": "ครบทุกช่อง ทุกมิติ",
        "greatEn": "Every channel × every dimension",
        "reworkTh": "ข้ามช่อง",
        "reworkEn": "Skipped channels"
      },
      {
        "order": 2,
        "labelTh": "ข้อเสนอแก้",
        "labelEn": "Proposed fixes",
        "greatTh": "ทุก ‘ไม่ใช่’ มีข้อเสนอแก้ที่ทำได้จริง",
        "greatEn": "Every 'No' has a practical fix",
        "okTh": "มีข้อเสนอแก้บางข้อ",
        "okEn": "Fixes on some No",
        "reworkTh": "ไม่มีข้อเสนอแก้",
        "reworkEn": "No fixes proposed"
      }
    ]
  },
  {
    "assignmentCode": "A6",
    "rows": [
      {
        "order": 1,
        "labelTh": "โครงสร้าง 15 สไลด์",
        "labelEn": "15-slide structure",
        "greatTh": "ครบทุกส่วนตามที่กำหนด",
        "greatEn": "All required sections included",
        "reworkTh": "ขาดหลายส่วน",
        "reworkEn": "Many sections missing"
      },
      {
        "order": 2,
        "labelTh": "คะแนน ICE ต่อ experiment",
        "labelEn": "ICE score per experiment",
        "greatTh": "5 experiments มีคะแนน ICE ครบ + เหตุผล",
        "greatEn": "5 experiments with ICE score and reasoning",
        "okTh": "มี ICE บางอัน",
        "okEn": "ICE on some experiments",
        "reworkTh": "ไม่มีคะแนน ICE",
        "reworkEn": "No ICE scoring"
      },
      {
        "order": 3,
        "labelTh": "คำขอชัดเจน",
        "labelEn": "Clear ask",
        "greatTh": "ระบุงบ/อนุมัติที่ต้องการชัดเจน",
        "greatEn": "Clearly states required budget / approval",
        "reworkTh": "ไม่มีคำขอ",
        "reworkEn": "No ask"
      },
      {
        "order": 4,
        "labelTh": "การนำเสนอสด",
        "labelEn": "Live presentation",
        "greatTh": "เล่าได้ภายใน 15 นาที ตอบคำถามได้",
        "greatEn": "Delivered within 15 min; answers Q&A confidently",
        "okTh": "เกินเวลา หรือ ตอบ Q&A ไม่ครบ",
        "okEn": "Over time or weak Q&A",
        "reworkTh": "นำเสนอไม่ได้",
        "reworkEn": "Could not deliver"
      }
    ]
  }
]
```

## Notes

- Rubric rows feed the grading UI. Manager picks GREAT / OK / REWORK per row.
- Weight defaults to 1. Admin can change weights later via `/admin/courses/.../rubrics/edit`.
- A submission is APPROVED if zero rows are REWORK (configurable threshold later).
