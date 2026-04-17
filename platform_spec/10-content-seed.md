# 10 — Content Seed

Course seed for **"Junior Digital Marketing Onboarding (30 Days)"**. Convert to JSON at `prisma/seed/content.json` during Phase 1.

Structure:
- 1 course: `junior-digital-marketing-30d`
- 4 weeks
- Each week has 4–6 lessons (Markdown).

Full lesson bodies are in the existing Word documents `ClickBroker_JuniorOnboarding_EN.docx` / `ClickBroker_JuniorOnboarding_TH.docx`. Claude Code should extract the Markdown equivalents and paste them into the corresponding `bodyTh` / `bodyEn` fields.

## Course metadata

```json
{
  "slug": "junior-digital-marketing-30d",
  "titleTh": "คู่มือ Onboarding 30 วัน — Junior Digital Marketing",
  "titleEn": "Junior Digital Marketing — 30-Day Onboarding",
  "descriptionTh": "หลักสูตร 30 วันสำหรับน้องใหม่สายดิจิทัลมาร์เก็ตติ้งของ Click Broker",
  "descriptionEn": "30-day program for Click Broker's junior digital marketing new hires",
  "isPublished": true
}
```

## Weeks and lessons

### Week 1 — `week-1` — "Thai Car Insurance 101 + Our Business Model"

| Order | Slug | titleTh | titleEn |
|---|---|---|---|
| 1 | `intro-click-broker` | รู้จัก Click Insurance Broker | About Click Insurance Broker |
| 2 | `thai-car-insurance` | ประกันรถยนต์ไทย 2 ชั้น | Thai Car Insurance — The Two Layers |
| 3 | `classes-1-2plus-3plus-3` | ชั้น 1 / 2+ / 3+ / 3 ต่างกันอย่างไร | Class 1 / 2+ / 3+ / 3 Explained |
| 4 | `claim-journey` | ขั้นตอนการเคลม | The Claim Journey |
| 5 | `market-players` | ผู้เล่นหลักในตลาด | Key Market Players |
| 6 | `how-click-broker-makes-money` | วิธีที่ Click Broker หารายได้ | How Click Broker Makes Money |

### Week 2 — `week-2` — "Channel Audit"

| 1 | `audit-framework` | กรอบการตรวจช่องทาง (10 ข้อ) | The 10-Question Audit Framework |
| 2 | `owned-web` | ตรวจเว็บไซต์ของเรา | Auditing Our Websites |
| 3 | `social-pages` | ตรวจ Facebook / TikTok | Auditing Facebook & TikTok |
| 4 | `line-oa` | ตรวจ LINE Official Account | Auditing LINE OA |
| 5 | `paid-search` | ตรวจ Google Ads | Auditing Google Ads |
| 6 | `paid-social` | ตรวจ Facebook / LINE / TikTok Ads | Auditing Paid Social |

### Week 3 — `week-3` — "Lead Quality, CPL, and Tracking"

| 1 | `funnel-metrics` | ศัพท์ Funnel ที่ต้องรู้ | Funnel Vocabulary You Must Own |
| 2 | `quality-vs-quantity` | คุณภาพ vs ปริมาณ | Quality vs Quantity |
| 3 | `bad-leads` | ลีดไม่ดีหน้าตาเป็นอย่างไร | What Makes a Bad Lead |
| 4 | `tracking-basics` | Tracking ขั้นต่ำที่ต้องเข้าใจ | Tracking Essentials |

### Week 4 — `week-4` — "Ideas, Proposals, Presentation"

| 1 | `ice-framework` | ICE Framework ให้คะแนนไอเดีย | Scoring Ideas with ICE |
| 2 | `experiment-brief` | Template Experiment Brief | The Experiment Brief Template |
| 3 | `idea-seeds` | ตัวอย่างไอเดียเริ่มต้น | Starter Idea Seeds |
| 4 | `final-deck-guidance` | วิธีทำ Deck นำเสนอ MD | How to Build the Final Deck |

## Conversion instructions for Claude Code

1. Open `ClickBroker_JuniorOnboarding_TH.docx` and `ClickBroker_JuniorOnboarding_EN.docx`.
2. For each lesson row above, extract the matching Heading 2 / Heading 3 sections from both docs.
3. Convert to Markdown (preserve headings, bullets, tables).
4. Write the JSON seed file like:

```json
[
  {
    "slug": "junior-digital-marketing-30d",
    "titleTh": "คู่มือ Onboarding 30 วัน — Junior Digital Marketing",
    "titleEn": "Junior Digital Marketing — 30-Day Onboarding",
    "weeks": [
      {
        "order": 1,
        "titleTh": "สัปดาห์ที่ 1 — พื้นฐานประกันรถยนต์ไทย + โมเดลธุรกิจโบรกเกอร์",
        "titleEn": "Week 1 — Thai Car Insurance 101 + Our Business Model",
        "lessons": [
          {
            "order": 1,
            "slug": "intro-click-broker",
            "titleTh": "รู้จัก Click Insurance Broker",
            "titleEn": "About Click Insurance Broker",
            "bodyTh": "## 1.1 เราคือใคร\n\n...",
            "bodyEn": "## 1.1 Who We Are\n\n..."
          }
        ]
      }
    ]
  }
]
```

5. Run `pnpm db:seed` to populate.
6. Verify `/learn/week/week-1` renders all lessons end-to-end.

## Rules for seed stability

- Keep slugs stable across re-seeds. Changing a slug creates a new lesson and loses progress.
- `order` is 1-based.
- If you need to replace content, update the Markdown body; do not delete + re-insert (it breaks `LessonProgress`).
