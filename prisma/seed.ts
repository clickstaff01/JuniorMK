import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'

// ─── helpers ────────────────────────────────────────────────────
async function upsertUser(data: {
  email: string; nameTh: string; nameEn: string
  password: string; role: 'ADMIN' | 'MANAGER' | 'STAFF'
  mentorEmail?: string
}) {
  const hash = await bcrypt.hash(data.password, 12)
  const mentor = data.mentorEmail
    ? await prisma.user.findUnique({ where: { email: data.mentorEmail } })
    : null
  return prisma.user.upsert({
    where: { email: data.email },
    update: { passwordHash: hash, status: 'ACTIVE' },
    create: {
      email: data.email, nameTh: data.nameTh, nameEn: data.nameEn,
      passwordHash: hash, role: data.role as any, status: 'ACTIVE',
      ...(mentor ? { mentorId: mentor.id } : {}),
    },
  })
}

// ─── main ────────────────────────────────────────────────────────
async function main() {
  // ── Users ──────────────────────────────────────────────────────
  const admin = await upsertUser({ email: 'admin@test.com', nameTh: 'ผู้ดูแลระบบ', nameEn: 'System Admin', password: '123456', role: 'ADMIN' })
  const manager = await upsertUser({ email: 'manager@test.com', nameTh: 'ผู้จัดการ', nameEn: 'Team Manager', password: '123456', role: 'MANAGER' })
  const staff = await upsertUser({ email: 'staff@test.com', nameTh: 'พนักงานใหม่', nameEn: 'New Staff', password: '123456', role: 'STAFF', mentorEmail: 'manager@test.com' })

  console.log(`✅ Users: ${admin.email}, ${manager.email}, ${staff.email}`)

  // ── Course ─────────────────────────────────────────────────────
  const course = await prisma.course.upsert({
    where: { slug: 'junior-digital-marketing' },
    update: {},
    create: {
      slug: 'junior-digital-marketing',
      titleTh: 'Junior Digital Marketing — 30 วันออนบอร์ด',
      titleEn: 'Junior Digital Marketing — 30-Day Onboarding',
      descriptionTh: 'หลักสูตรสำหรับพนักงานใหม่ เรียนรู้ประกันภัยรถยนต์ Digital Marketing และการทำงานที่ Click Broker',
      descriptionEn: 'Onboarding course for new staff covering car insurance, digital marketing, and working at Click Broker.',
      isPublished: true,
    },
  })

  // ── Enrollment ─────────────────────────────────────────────────
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: staff.id, courseId: course.id } },
    update: {},
    create: { userId: staff.id, courseId: course.id },
  })

  // ── Weeks & Lessons ────────────────────────────────────────────
  const weeksData = [
    {
      order: 1, titleTh: 'สัปดาห์ที่ 1 — ประกันภัยรถยนต์ 101 + Business Model',
      titleEn: 'Week 1 — Thai Car Insurance 101 + Business Model',
      descriptionTh: 'เรียนรู้พื้นฐานประกันภัยรถยนต์ในไทย และโมเดลธุรกิจของ Click Broker',
      descriptionEn: 'Learn the fundamentals of Thai car insurance and Click Broker\'s business model.',
      lessons: [
        { order: 1, slug: 'w1-insurance-basics', titleTh: 'ประกันภัยรถยนต์คืออะไร', titleEn: 'What is Car Insurance?',
          bodyTh: `# ประกันภัยรถยนต์คืออะไร\n\nประกันภัยรถยนต์คือสัญญาระหว่างผู้เอาประกันกับบริษัทประกันภัย โดยผู้เอาประกันจ่ายเบี้ยประกัน และบริษัทจะชดเชยความเสียหายตามที่ระบุในกรมธรรม์\n\n## ทำไมต้องทำประกัน?\n\n- **ป้องกันความเสี่ยงทางการเงิน** — อุบัติเหตุอาจสร้างความเสียหายหลายแสนบาท\n- **กฎหมายกำหนด** — พ.ร.บ. คุ้มครองผู้ประสบภัยจากรถ เป็นภาคบังคับสำหรับรถทุกคัน\n- **ความสบายใจ** — ไม่ต้องกังวลเมื่อเกิดอุบัติเหตุ\n\n## ผู้เล่นหลักในอุตสาหกรรม\n\n1. **บริษัทประกัน** — ผู้รับความเสี่ยง เช่น Muang Thai, Viriyah, AXA\n2. **ตัวแทน/โบรกเกอร์** — ช่วยลูกค้าเปรียบเทียบและซื้อประกัน\n3. **ลูกค้า** — เจ้าของรถที่ต้องการคุ้มครอง\n4. **OIC** — คณะกรรมการกำกับและส่งเสริมการประกอบธุรกิจประกันภัย`,
          bodyEn: `# What is Car Insurance?\n\nCar insurance is a contract between the insured and the insurance company. The insured pays a premium, and the company compensates for damages as specified in the policy.\n\n## Why Get Insurance?\n\n- **Financial protection** — accidents can cause hundreds of thousands of baht in damage\n- **Legal requirement** — CTPL (Compulsory Third-Party Liability) is mandatory for all vehicles\n- **Peace of mind** — no worry when accidents happen` },
        { order: 2, slug: 'w1-types', titleTh: 'ประเภทของประกันภัยรถยนต์', titleEn: 'Types of Car Insurance',
          bodyTh: `# ประเภทของประกันภัยรถยนต์\n\nในไทยมีประกันรถยนต์ 2 ประเภทหลัก คือ ประกันภัยภาคบังคับ และประกันภัยภาคสมัครใจ\n\n## พ.ร.บ. (ภาคบังคับ)\n\nคุ้มครองเฉพาะความเสียหายต่อร่างกายของผู้ประสบภัย ไม่คุ้มครองทรัพย์สิน วงเงินคุ้มครองตามที่กฎหมายกำหนด\n\n## ประกันภาคสมัครใจ (ชั้น 1–5)\n\n| ชั้น | ความคุ้มครอง |\n|------|---------------|\n| ชั้น 1 | ครอบคลุมทุกกรณี ทั้งรถเราและรถคู่กรณี |\n| ชั้น 2+ | รถเราในกรณีชนคู่กรณี + ภัยธรรมชาติ |\n| ชั้น 2 | รถเราในกรณีชนคู่กรณี |\n| ชั้น 3+ | รถคู่กรณี + ไฟไหม้/โจรกรรม |\n| ชั้น 3 | คุ้มครองเฉพาะรถคู่กรณี |\n\n## เบี้ยประกัน\n\nคำนวณจากหลายปัจจัย ได้แก่ ยี่ห้อรถ ปีที่ผลิต ทุนประกัน ประวัติการขับขี่ และพื้นที่ใช้งาน`,
          bodyEn: `# Types of Car Insurance\n\nThailand has two main types: Compulsory (CTPL) and Voluntary insurance.\n\n## CTPL (Compulsory)\n\nCovers bodily injury to accident victims only. Required by law for all vehicles.\n\n## Voluntary Insurance (Class 1–5)\n\n| Class | Coverage |\n|-------|----------|\n| Class 1 | Full coverage — own car + third party |\n| Class 2+ | Own car (collision) + natural disasters |\n| Class 2 | Own car (collision with third party) |\n| Class 3+ | Third party + fire/theft |\n| Class 3 | Third party liability only |` },
        { order: 3, slug: 'w1-claims', titleTh: 'กระบวนการเรียกร้องค่าสินไหม', titleEn: 'Claims Process',
          bodyTh: `# กระบวนการเรียกร้องค่าสินไหม\n\nเมื่อเกิดอุบัติเหตุ ลูกค้าต้องดำเนินการตามขั้นตอนดังนี้\n\n## ขั้นตอนการเคลม\n\n1. **แจ้งเหตุทันที** — โทรหาบริษัทประกันหรือ Broker ภายใน 24 ชั่วโมง\n2. **ถ่ายภาพ** — บันทึกภาพความเสียหาย ทะเบียนรถ และใบขับขี่คู่กรณี\n3. **แจ้งตำรวจ** — กรณีที่มีผู้บาดเจ็บหรือมูลค่าความเสียหายสูง\n4. **นำรถเข้าอู่** — เลือกอู่ในเครือบริษัทประกัน หรืออู่ที่ลูกค้าต้องการ\n5. **รับค่าสินไหม** — ภายใน 15-30 วันทำการ\n\n## บทบาทของ Broker\n\nในฐานะ Digital Broker เราช่วยลูกค้าตลอดกระบวนการ ตั้งแต่แจ้งเหตุจนถึงได้รับค่าสินไหม`,
          bodyEn: `# Claims Process\n\nWhen an accident occurs, customers must follow these steps:\n\n1. Report immediately to the insurer or broker within 24 hours\n2. Take photos of all damage, license plates, and driver's licenses\n3. File a police report if there are injuries or major damage\n4. Bring the car to an approved repair shop\n5. Receive compensation within 15–30 business days` },
        { order: 4, slug: 'w1-market', titleTh: 'ตลาดประกันภัยในไทย', titleEn: 'Thai Insurance Market',
          bodyTh: `# ตลาดประกันภัยในไทย\n\n## ขนาดตลาด\n\nตลาดประกันภัยรถยนต์ในไทยมีมูลค่าประมาณ 70,000 ล้านบาทต่อปี โดยมีรถยนต์จดทะเบียนกว่า 40 ล้านคัน\n\n## ผู้เล่นหลัก\n\n- **Viriyah Insurance** — ส่วนแบ่งตลาดสูงสุด\n- **Muang Thai Insurance** — อันดับสอง\n- **AXA, Syn Mun Kong, MSIG** — ผู้เล่นต่างชาติ\n\n## ช่องทางการซื้อ\n\n1. ตัวแทนประกัน (ยังครองตลาดใหญ่)\n2. **Digital Broker** (กำลังเติบโต — ตลาดของเรา)\n3. Direct จากบริษัทประกัน\n4. ธนาคารและผู้จำหน่ายรถยนต์`,
          bodyEn: `# Thai Insurance Market\n\n## Market Size\n\nThai car insurance market is worth approximately 70 billion THB annually with over 40 million registered vehicles.\n\n## Key Players\n\n- Viriyah Insurance — largest market share\n- Muang Thai Insurance — second place\n- AXA, Syn Mun Kong, MSIG — international players\n\n## Distribution Channels\n\n1. Traditional agents (still dominant)\n2. **Digital Brokers** (our growing segment)\n3. Direct from insurers\n4. Banks and car dealers` },
        { order: 5, slug: 'w1-revenue', titleTh: 'โมเดลรายได้ของ Click Broker', titleEn: 'Click Broker Revenue Model',
          bodyTh: `# โมเดลรายได้ของ Click Broker\n\n## เราทำเงินอย่างไร?\n\nClick Broker เป็น Digital Broker ที่ได้รับค่านายหน้า (Commission) จากบริษัทประกันทุกครั้งที่ลูกค้าซื้อกรมธรรม์ผ่านเรา\n\n## โครงสร้างค่านายหน้า\n\n| ผลิตภัณฑ์ | Commission |\n|------------|------------|\n| ประกันชั้น 1 | 15–20% |\n| ประกันชั้น 2+ | 10–15% |\n| พ.ร.บ. | 5–8% |\n\n## Unit Economics\n\n- **CAC** (ต้นทุนการได้มาซึ่งลูกค้า) — ควรต่ำกว่า LTV ÷ 3\n- **LTV** (มูลค่าลูกค้าตลอดชีพ) — ลูกค้าต่ออายุเฉลี่ย 4–5 ปี\n- **Retention Rate** — เป้าหมาย >70%\n\n## ปัจจัยความสำเร็จ\n\nDigital Marketing คือหัวใจของธุรกิจ — CPL ต่ำ + Conversion สูง = กำไรสูง`,
          bodyEn: `# Click Broker Revenue Model\n\n## How Do We Make Money?\n\nClick Broker earns commission from insurers every time a customer buys a policy through us.\n\n## Commission Structure\n\n| Product | Commission |\n|---------|------------|\n| Class 1 | 15–20% |\n| Class 2+ | 10–15% |\n| CTPL | 5–8% |\n\n## Unit Economics\n\n- **CAC** — should be less than LTV ÷ 3\n- **LTV** — average customer renews 4–5 years\n- **Retention Rate** — target >70%` },
        { order: 6, slug: 'w1-digital-broker', titleTh: 'บทบาทของ Digital Broker', titleEn: 'Role of a Digital Broker',
          bodyTh: `# บทบาทของ Digital Broker\n\n## Digital Broker ต่างจาก Traditional Agent อย่างไร?\n\n| | Traditional Agent | Digital Broker |\n|--|-------------------|-----------------|\n| ช่องทาง | พบปะด้วยตนเอง | ออนไลน์ 100% |\n| เปรียบเทียบราคา | มักขายประกันบริษัทเดียว | เปรียบเทียบหลายบริษัท |\n| Speed | ช้า (หลายวัน) | เร็ว (ไม่กี่นาที) |\n| Cost | สูง | ต่ำกว่า |\n\n## คุณค่าที่เราสร้างให้ลูกค้า\n\n1. **เปรียบเทียบราคา** จากบริษัทประกันชั้นนำ 10+ แห่ง\n2. **ซื้อออนไลน์** สะดวก รวดเร็ว ไม่ต้องพบตัวแทน\n3. **บริการหลังการขาย** ช่วยเรื่องเคลมตลอดอายุกรมธรรม์\n4. **ราคาดีกว่า** เพราะต้นทุนต่ำกว่า Traditional Agent`,
          bodyEn: `# Role of a Digital Broker\n\nDigital brokers like Click Broker compare insurance from 10+ companies online, helping customers find the best policy quickly and at the best price.\n\n## Our Value Proposition\n\n1. **Price comparison** — 10+ top insurers\n2. **Buy online** — no agents needed\n3. **Claims support** — we help throughout the policy lifetime\n4. **Better prices** — lower overhead than traditional agents` },
      ],
    },
    {
      order: 2, titleTh: 'สัปดาห์ที่ 2 — Channel Audit',
      titleEn: 'Week 2 — Channel Audit',
      descriptionTh: 'เรียนรู้วิธีวิเคราะห์และประเมิน Digital Channels ต่างๆ',
      descriptionEn: 'Learn how to analyze and evaluate different digital channels.',
      lessons: [
        { order: 1, slug: 'w2-overview', titleTh: 'ภาพรวม Digital Channels', titleEn: 'Digital Channels Overview',
          bodyTh: `# ภาพรวม Digital Channels\n\n## ช่องทางที่ Click Broker ใช้\n\n1. **Organic Search (SEO)** — ดึงคนที่กำลังค้นหาประกัน\n2. **Google Ads (SEM)** — โฆษณาแบบเสียเงิน\n3. **Facebook / Instagram Ads** — โฆษณา Social Media\n4. **LINE Official Account** — CRM และ Retargeting\n5. **Content Marketing** — บทความ Blog และ YouTube\n\n## KPI ที่สำคัญ\n\n- **Impressions** — จำนวนครั้งที่โฆษณาแสดง\n- **Clicks** — จำนวนคลิก\n- **CTR** — Click-Through Rate = Clicks ÷ Impressions\n- **Leads** — จำนวนคนที่กรอกข้อมูล\n- **CPL** — Cost Per Lead = ค่าใช้จ่าย ÷ Leads\n- **Conversion Rate** — สัดส่วน Leads ที่ซื้อจริง`,
          bodyEn: `# Digital Channels Overview\n\n## Channels Click Broker Uses\n\n1. Organic Search (SEO)\n2. Google Ads (SEM)\n3. Facebook/Instagram Ads\n4. LINE Official Account\n5. Content Marketing\n\n## Key KPIs\n\n- Impressions, Clicks, CTR, Leads, CPL, Conversion Rate` },
        { order: 2, slug: 'w2-website', titleTh: 'วิเคราะห์เว็บไซต์', titleEn: 'Website Audit',
          bodyTh: `# การวิเคราะห์เว็บไซต์\n\n## เครื่องมือที่ใช้\n\n- **Google Analytics 4** — Traffic, Behavior, Conversions\n- **Google Search Console** — Organic Rankings, CTR\n- **PageSpeed Insights** — ความเร็วของเว็บ\n\n## สิ่งที่ต้องวิเคราะห์\n\n### Traffic\n- จำนวน Users และ Sessions ต่อเดือน\n- Bounce Rate — สัดส่วนคนที่เข้ามาแล้วออกทันที\n- Average Session Duration\n\n### Conversion\n- จำนวน Leads จาก Organic\n- Conversion Rate\n- หน้าไหนสร้าง Leads ได้มากที่สุด\n\n### SEO Health\n- Top 10 Keywords ที่ Rank อยู่\n- Pages ที่มี Organic Traffic สูงสุด`,
          bodyEn: `# Website Audit\n\nUse Google Analytics 4, Search Console, and PageSpeed Insights to analyze traffic, behavior, and conversions.` },
        { order: 3, slug: 'w2-social', titleTh: 'Social Media Audit', titleEn: 'Social Media Audit',
          bodyTh: `# Social Media Audit\n\n## Facebook Page\n\n- **Followers** — จำนวนผู้ติดตาม\n- **Reach** — จำนวนคนที่เห็น Content\n- **Engagement Rate** — (Likes + Comments + Shares) ÷ Reach\n- **Top Posts** — Content ไหนทำงานได้ดีที่สุด\n\n## Instagram\n\n- Story Views vs Feed Posts\n- Reel Performance\n- Hashtag Analysis\n\n## วิธีทำ Competitive Analysis\n\n1. ดู Facebook Ads Library ของคู่แข่ง\n2. วิเคราะห์ว่าพวกเขา Target ใคร\n3. ดู Creative ที่พวกเขาใช้\n4. ประเมิน Estimated Spend`,
          bodyEn: `# Social Media Audit\n\nAnalyze Facebook Page performance (followers, reach, engagement) and Instagram (stories vs feed vs reels). Use Facebook Ads Library for competitive analysis.` },
        { order: 4, slug: 'w2-line', titleTh: 'LINE Official Account', titleEn: 'LINE Official Account',
          bodyTh: `# LINE Official Account\n\n## ทำไม LINE สำคัญสำหรับ Click Broker?\n\nคนไทยใช้ LINE มากกว่า 50 ล้านคน LINE OA จึงเป็นช่องทางสำคัญสำหรับ CRM และ Retargeting\n\n## Metrics ที่ดู\n\n- **Friends** — จำนวน Followers\n- **Block Rate** — สัดส่วนคนที่ Block\n- **Message Open Rate** — สัดส่วนคนที่เปิดอ่านข้อความ\n- **Link Clicks** — จากข้อความที่ส่ง\n\n## Use Cases\n\n1. ส่ง Reminder ต่ออายุกรมธรรม์\n2. แจ้งสถานะเคลม\n3. ส่ง Promotion\n4. Customer Service`,
          bodyEn: `# LINE Official Account\n\nWith 50M+ Thai users, LINE OA is crucial for CRM and retargeting. Key metrics: Friends count, Block Rate, Message Open Rate, Link Clicks.` },
        { order: 5, slug: 'w2-google-ads', titleTh: 'Google Ads', titleEn: 'Google Ads',
          bodyTh: `# Google Ads\n\n## ประเภทของ Google Ads ที่ใช้\n\n### Search Ads\nแสดงเมื่อคนค้นหา Keywords เช่น "ประกันรถยนต์ราคาถูก"\n\n### Display Ads\nแสดง Banner บนเว็บไซต์ต่างๆ ใน Google Display Network\n\n### Remarketing\nแสดงโฆษณาให้คนที่เคยเข้าเว็บเราแล้ว\n\n## KPI ที่สำคัญ\n\n| Metric | ความหมาย |\n|--------|----------|\n| CPC | Cost Per Click |\n| Quality Score | คะแนนคุณภาพของ Keyword |\n| Impression Share | สัดส่วนโฆษณาที่ชนะ Auction |\n| ROAS | Return on Ad Spend |`,
          bodyEn: `# Google Ads\n\nTypes: Search Ads (keyword-triggered), Display Ads (banner network), Remarketing (past visitors).\n\nKey metrics: CPC, Quality Score, Impression Share, ROAS.` },
        { order: 6, slug: 'w2-paid-social', titleTh: 'Paid Social', titleEn: 'Paid Social',
          bodyTh: `# Paid Social\n\n## Facebook / Instagram Ads\n\n### Campaign Structure\n\`\`\`\nCampaign (Objective)\n  └── Ad Set (Audience + Budget)\n         └── Ad (Creative)\n\`\`\`\n\n### Audience Targeting\n- **Core Audience** — Demographics, Interests\n- **Custom Audience** — ลูกค้าเก่า, Website Visitors\n- **Lookalike Audience** — คนที่คล้ายกับลูกค้าเรา\n\n### Metrics\n- **CPM** — Cost Per 1,000 Impressions\n- **CPC** — Cost Per Click\n- **CPL** — Cost Per Lead\n- **ROAS** — Return on Ad Spend\n\n## Best Practices ของ Click Broker\n\n1. Test Creative หลายรูปแบบ (A/B Test)\n2. ใช้ Video เพราะ Cost ต่ำกว่า Image\n3. Retarget คนที่ขอใบเสนอราคาแต่ยังไม่ซื้อ`,
          bodyEn: `# Paid Social\n\nFacebook/Instagram campaign structure: Campaign → Ad Set → Ad. Audiences: Core, Custom, Lookalike. Key metrics: CPM, CPC, CPL, ROAS.` },
      ],
    },
    {
      order: 3, titleTh: 'สัปดาห์ที่ 3 — Lead Quality, CPL, Tracking',
      titleEn: 'Week 3 — Lead Quality, CPL & Tracking',
      descriptionTh: 'เรียนรู้การวัด Lead Quality การคำนวณ CPL และการ Tracking',
      descriptionEn: 'Learn to measure lead quality, calculate CPL, and implement tracking.',
      lessons: [
        { order: 1, slug: 'w3-funnel', titleTh: 'Digital Marketing Funnel', titleEn: 'Digital Marketing Funnel',
          bodyTh: `# Digital Marketing Funnel\n\n## Funnel ของ Click Broker\n\n\`\`\`\nAwareness\n  ↓\nInterest (เข้าเว็บ)\n  ↓\nConsideration (ขอใบเสนอราคา)\n  ↓\nIntent (กรอกข้อมูล = Lead)\n  ↓\nPurchase (ซื้อ)\n  ↓\nRenewal (ต่ออายุ)\n\`\`\`\n\n## Metrics แต่ละ Stage\n\n| Stage | Metric |\n|-------|--------|\n| Awareness | Impressions, Reach |\n| Interest | Sessions, Bounce Rate |\n| Consideration | Quote Requests |\n| Intent | Leads, CPL |\n| Purchase | Sales, Conversion Rate |\n| Renewal | Retention Rate |`,
          bodyEn: `# Digital Marketing Funnel\n\nAwareness → Interest → Consideration → Intent → Purchase → Renewal\n\nEach stage has specific metrics to track and optimize.` },
        { order: 2, slug: 'w3-lead-quality', titleTh: 'คุณภาพของ Lead', titleEn: 'Lead Quality',
          bodyTh: `# คุณภาพของ Lead\n\n## Lead ดีคืออะไร?\n\nLead ที่ดีคือคนที่มีแนวโน้มซื้อจริงสูง วัดจาก\n\n- **ข้อมูลครบ** — ทะเบียนรถ, เบอร์โทร, อีเมลถูกต้อง\n- **Intent สูง** — มาจาก Search ที่ตรงเป้า\n- **เพื่อนเราติดต่อได้** — รับโทรศัพท์, ตอบ LINE\n\n## Lead ไม่ดี (Bad Lead)\n\n- ข้อมูลปลอมหรือไม่ครบ\n- มาจาก Broad Audience ที่ไม่ตรงเป้า\n- ไม่ตอบรับการติดต่อ\n\n## วิธีปรับปรุง Lead Quality\n\n1. ใช้ Lead Form ที่มีคำถามกรอง\n2. เพิ่มขั้นตอน Verification\n3. ปรับ Targeting ให้แคบลง\n4. วิเคราะห์ว่า Channel ไหนให้ Lead Quality สูงสุด`,
          bodyEn: `# Lead Quality\n\nA good lead has complete data, high purchase intent, and is contactable. Bad leads have fake info, come from broad targeting, or don't respond.\n\nImprove quality by using screening questions, verification steps, and tighter targeting.` },
        { order: 3, slug: 'w3-cpl', titleTh: 'CPL และการวัดผล', titleEn: 'CPL & Measurement',
          bodyTh: `# CPL และการวัดผล\n\n## CPL คืออะไร?\n\n**CPL = Cost Per Lead = ค่าใช้จ่ายทั้งหมด ÷ จำนวน Leads**\n\nตัวอย่าง: ใช้งบ 10,000 บาท ได้ 50 Leads → CPL = 200 บาท\n\n## Target CPL ของ Click Broker\n\nขึ้นอยู่กับ Channel และ Product แต่โดยทั่วไป:\n- Search Ads: CPL 300–500 บาท\n- Facebook Ads: CPL 200–400 บาท\n- Organic: CPL ≈ 0 (ต้นทุนเฉพาะค่า Content)\n\n## CPL ที่ดีคือต้องต่ำกว่า Commission\n\nถ้าขายประกันชั้น 1 เบี้ย 20,000 บาท ได้ Commission 15% = 3,000 บาท\nCPL ควรต่ำกว่า 3,000 × Conversion Rate\n\nเช่น ถ้า Conversion Rate 10% → Target CPL < 300 บาท`,
          bodyEn: `# CPL & Measurement\n\n**CPL = Total Cost ÷ Number of Leads**\n\nExample: 10,000 THB budget, 50 leads → CPL = 200 THB\n\nCPL should be below (Commission per policy × Conversion Rate) to be profitable.` },
        { order: 4, slug: 'w3-tracking', titleTh: 'Tracking และ Analytics', titleEn: 'Tracking & Analytics',
          bodyTh: `# Tracking และ Analytics\n\n## เครื่องมือ Tracking ที่ใช้\n\n1. **Google Analytics 4 (GA4)** — วัด Website Behavior\n2. **Google Tag Manager (GTM)** — จัดการ Tracking Code\n3. **Facebook Pixel** — วัด Conversion จาก Facebook Ads\n4. **LINE Tag** — วัด Conversion จาก LINE Ads\n\n## Events ที่ต้อง Track\n\n| Event | ความหมาย |\n|-------|----------|\n| page_view | เข้าดูหน้าเว็บ |\n| quote_request | คลิกขอใบเสนอราคา |\n| lead_submit | กรอก Lead Form สำเร็จ |\n| purchase | ชำระเงินสำเร็จ |\n\n## Attribution Model\n\n- **Last Click** — ให้เครดิตกับช่องทางสุดท้ายก่อนซื้อ\n- **First Click** — ให้เครดิตกับช่องทางแรกที่พบ\n- **Data-Driven** — ใช้ ML แบ่งเครดิต (GA4 Default)`,
          bodyEn: `# Tracking & Analytics\n\nTools: GA4, GTM, Facebook Pixel, LINE Tag.\n\nKey events to track: page_view, quote_request, lead_submit, purchase.\n\nAttribution models: Last Click, First Click, Data-Driven.` },
      ],
    },
    {
      order: 4, titleTh: 'สัปดาห์ที่ 4 — Ideas & Proposals',
      titleEn: 'Week 4 — Ideas & Proposals',
      descriptionTh: 'เรียนรู้การคิด Idea การทำ Experiment Brief และการนำเสนอ',
      descriptionEn: 'Learn ideation, experiment briefs, and proposal presentations.',
      lessons: [
        { order: 1, slug: 'w4-ice', titleTh: 'ICE Framework', titleEn: 'ICE Framework',
          bodyTh: `# ICE Framework\n\n## ICE คืออะไร?\n\nICE เป็น Framework สำหรับ Prioritize Idea โดยให้คะแนน 3 ด้าน\n\n- **I — Impact** คะแนน 1–10: ถ้าได้ผล จะส่งผลมากแค่ไหน?\n- **C — Confidence** คะแนน 1–10: มั่นใจแค่ไหนว่าจะได้ผล?\n- **E — Ease** คะแนน 1–10: ทำได้ง่ายแค่ไหน?\n\n**ICE Score = (I + C + E) ÷ 3**\n\n## ตัวอย่าง\n\n| Idea | Impact | Confidence | Ease | ICE Score |\n|------|--------|------------|------|-----------|\n| เพิ่ม Live Chat | 8 | 7 | 6 | 7.0 |\n| ทำ Video Ad | 7 | 6 | 5 | 6.0 |\n| Redesign Landing Page | 9 | 5 | 3 | 5.7 |\n\nทำ **เพิ่ม Live Chat** ก่อน เพราะ ICE Score สูงสุด`,
          bodyEn: `# ICE Framework\n\nPrioritize ideas by scoring Impact (1–10), Confidence (1–10), and Ease (1–10).\n\n**ICE Score = (Impact + Confidence + Ease) ÷ 3**\n\nHighest score = highest priority.` },
        { order: 2, slug: 'w4-experiment', titleTh: 'Experiment Brief', titleEn: 'Experiment Brief',
          bodyTh: `# Experiment Brief\n\n## ทำไมต้องมี Experiment Brief?\n\nก่อน Run Experiment ต้องเขียน Brief เพื่อ\n1. ให้ทุกคนเข้าใจตรงกัน\n2. ตั้ง Success Metrics ก่อนเริ่ม\n3. หลีกเลี่ยง Confirmation Bias\n\n## โครงสร้าง Experiment Brief\n\n\`\`\`\nHypothesis: ถ้าเรา [Action] จะทำให้ [Metric] เพิ่ม/ลด X% เพราะ [Reason]\n\nTest Group: [กลุ่มที่เห็น Version ใหม่]\nControl Group: [กลุ่มที่เห็น Version เดิม]\nSample Size: [จำนวน Users ที่ต้องการ]\nDuration: [กี่วัน]\nPrimary Metric: [วัดผลด้วย Metric นี้]\nGuardrail Metrics: [Metric ที่ต้องไม่แย่ลง]\nDecision Rule: [เกณฑ์ตัดสิน]\n\`\`\``,
          bodyEn: `# Experiment Brief\n\nBefore running any experiment, write a brief with: Hypothesis, Test vs Control groups, Sample size, Duration, Primary metric, Guardrail metrics, and Decision rule.` },
        { order: 3, slug: 'w4-ideas', titleTh: 'แนวคิดการปรับปรุง', titleEn: 'Improvement Ideas',
          bodyTh: `# แนวคิดการปรับปรุง\n\n## วิธีหา Idea ที่ดี\n\n### 1. Data-Driven\nดู Analytics แล้วถามว่า "ทำไม?" ซ้ำๆ\n- Bounce Rate สูงในหน้าใด → ทำไม?\n- CPL สูงใน Channel ใด → ทำไม?\n\n### 2. Customer Interview\nคุยกับลูกค้าจริง ถามว่า\n- อะไรทำให้ตัดสินใจซื้อ?\n- อะไรที่เกือบทำให้ไม่ซื้อ?\n\n### 3. Competitor Analysis\n- ดูว่าคู่แข่งทำอะไรบ้าง\n- อะไรที่พวกเขาทำแต่เรายังไม่ทำ?\n\n### 4. Best Practices\n- ดู Case Studies จากอุตสาหกรรมอื่น\n- Apply กับ Context ของเรา`,
          bodyEn: `# Improvement Ideas\n\nFind ideas through: Data analysis (ask "why?" repeatedly), Customer interviews, Competitor analysis, and Industry best practices.` },
        { order: 4, slug: 'w4-proposal', titleTh: 'การนำเสนอ Proposal', titleEn: 'Proposal Presentation',
          bodyTh: `# การนำเสนอ Proposal\n\n## โครงสร้าง Deck 15 Slides\n\n1. **Title** — ชื่อ Proposal + ชื่อผู้นำเสนอ\n2. **Problem Statement** — ปัญหาที่เราเจอ\n3. **Data Evidence** — ตัวเลขที่แสดงว่าปัญหามีจริง\n4. **Root Cause** — สาเหตุที่แท้จริง\n5. **Opportunity** — ถ้าแก้ได้จะมีผลอะไร\n6. **Solution Overview** — ไอเดียของเราคืออะไร\n7. **How It Works** — กลไกการทำงาน\n8. **ICE Score** — เหตุผลที่เลือก Idea นี้\n9. **Experiment Design** — วิธีทดสอบ\n10. **Timeline** — แผนการทำงาน\n11. **Resources Needed** — ต้องการอะไรบ้าง\n12. **Expected Results** — คาดหวังผลลัพธ์อะไร\n13. **Risk & Mitigation** — ความเสี่ยงและวิธีรับมือ\n14. **Success Metrics** — วัดผลอย่างไร\n15. **Ask** — ขออนุมัติอะไร?\n\n## Tips การนำเสนอ\n\n- ฝึกซ้อมจนพูดได้โดยไม่ต้องอ่าน Slide\n- เตรียมคำตอบสำหรับ Top 5 คำถาม\n- ใช้ตัวเลขจริงเสมอ`,
          bodyEn: `# Proposal Presentation\n\nStructure a 15-slide deck: Problem → Evidence → Root cause → Opportunity → Solution → ICE score → Experiment → Timeline → Resources → Expected results → Risks → Metrics → Ask.\n\nPractice until you can present without reading slides.` },
      ],
    },
  ]

  const weekMap: Record<number, string> = {}

  for (const wData of weeksData) {
    const week = await prisma.week.upsert({
      where: { courseId_order: { courseId: course.id, order: wData.order } },
      update: {},
      create: {
        courseId: course.id, order: wData.order,
        titleTh: wData.titleTh, titleEn: wData.titleEn,
        descriptionTh: wData.descriptionTh, descriptionEn: wData.descriptionEn,
      },
    })
    weekMap[wData.order] = week.id

    for (const lData of wData.lessons) {
      const existing = await prisma.lesson.findFirst({ where: { weekId: week.id, order: lData.order } })
      if (!existing) {
        await prisma.lesson.create({
          data: {
            weekId: week.id, order: lData.order, slug: lData.slug,
            titleTh: lData.titleTh, titleEn: lData.titleEn,
            bodyTh: lData.bodyTh, bodyEn: lData.bodyEn,
          },
        })
      }
    }
  }
  console.log('✅ Weeks and lessons seeded')

  // ── Assignments ────────────────────────────────────────────────
  const assignmentsData = [
    {
      weekOrder: 1, code: 'A1', order: 1, dueOffsetDays: 7,
      titleTh: 'ทดสอบความเข้าใจพื้นฐานประกันภัย', titleEn: 'Insurance Fundamentals Self-Test',
      descriptionTh: 'ตอบคำถามแสดงความเข้าใจเกี่ยวกับประกันภัยรถยนต์และโมเดลธุรกิจของ Click Broker',
      descriptionEn: 'Answer questions demonstrating your understanding of car insurance and Click Broker\'s business model.',
      questions: [
        { order: 1, type: 'SHORT_TEXT', promptTh: 'ประกันภัยรถยนต์ภาคบังคับ (พ.ร.บ.) คุ้มครองอะไรบ้าง?', promptEn: 'What does compulsory car insurance (CTPL) cover?' },
        { order: 2, type: 'LONG_TEXT', promptTh: 'อธิบายความแตกต่างระหว่างประกันชั้น 1, 2+, และ 3 ด้วยคำพูดของคุณเอง', promptEn: 'Explain the difference between Class 1, 2+, and 3 insurance in your own words.' },
        { order: 3, type: 'SHORT_TEXT', promptTh: 'Click Broker ทำเงินจากอะไร?', promptEn: 'How does Click Broker make money?' },
        { order: 4, type: 'LONG_TEXT', promptTh: 'ถ้าลูกค้าเกิดอุบัติเหตุและต้องการเคลม คุณจะแนะนำให้ทำอะไรบ้างตามลำดับ?', promptEn: 'If a customer gets into an accident and needs to file a claim, what steps would you recommend in order?' },
        { order: 5, type: 'SHORT_TEXT', promptTh: 'Digital Broker ต่างจาก Traditional Agent อย่างไร? (อย่างน้อย 2 ข้อ)', promptEn: 'How is a Digital Broker different from a Traditional Agent? (at least 2 points)' },
        { order: 6, type: 'LONG_TEXT', promptTh: 'เบี้ยประกันรถยนต์คำนวณจากปัจจัยอะไรบ้าง? อธิบายแต่ละปัจจัย', promptEn: 'What factors determine car insurance premiums? Explain each factor.' },
        { order: 7, type: 'MULTIPLE_CHOICE', promptTh: 'ประกันชั้นใดที่ให้ความคุ้มครองครอบคลุมที่สุด?', promptEn: 'Which insurance class provides the most comprehensive coverage?',
          config: { options: ['ชั้น 1', 'ชั้น 2+', 'ชั้น 2', 'ชั้น 3+'] } },
        { order: 8, type: 'CHECKBOXES', promptTh: 'ปัจจัยใดบ้างที่ส่งผลต่อเบี้ยประกันรถยนต์? (เลือกทุกข้อที่ถูก)', promptEn: 'Which factors affect car insurance premiums? (select all that apply)',
          config: { options: ['ยี่ห้อรถ', 'สีรถ', 'ปีที่ผลิต', 'ประวัติการขับขี่', 'พื้นที่ใช้งาน', 'ชื่อผู้ขับ'] } },
        { order: 9, type: 'LONG_TEXT', promptTh: 'ถ้าคุณต้องอธิบาย Click Broker ให้คนที่ไม่รู้จักเราเลยฟัง คุณจะพูดอย่างไร? (ไม่เกิน 3 ประโยค)', promptEn: 'If you had to explain Click Broker to someone who has never heard of us, what would you say? (max 3 sentences)' },
        { order: 10, type: 'LONG_TEXT', promptTh: 'สิ่งที่คุณเรียนรู้ในสัปดาห์นี้ที่คิดว่าสำคัญที่สุดคืออะไร และทำไม?', promptEn: 'What is the most important thing you learned this week and why?' },
      ],
      rubric: {
        rows: [
          { order: 1, labelTh: 'ความถูกต้องของข้อมูล', labelEn: 'Factual Accuracy',
            greatTh: 'ข้อมูลถูกต้องทุกข้อ ไม่มีข้อผิดพลาด', greatEn: 'All facts correct, no errors',
            okTh: 'ข้อมูลส่วนใหญ่ถูกต้อง มีผิดเล็กน้อย', okEn: 'Mostly correct, minor errors',
            reworkTh: 'มีข้อมูลผิดพลาดหลายจุดที่สำคัญ', reworkEn: 'Multiple significant factual errors' },
          { order: 2, labelTh: 'การอธิบายด้วยคำพูดตนเอง', labelEn: 'Own Words',
            greatTh: 'อธิบายด้วยคำพูดตนเอง ไม่ Copy-Paste', greatEn: 'Explains in own words, not copied',
            okTh: 'ส่วนใหญ่เป็นคำพูดตนเอง แต่มีบางส่วนที่ดูเหมือน Copy', okEn: 'Mostly own words but some parts look copied',
            reworkTh: 'Copy-Paste จาก Slide หรือ Internet', reworkEn: 'Copied from slides or the internet' },
          { order: 3, labelTh: 'ความครบถ้วน', labelEn: 'Completeness',
            greatTh: 'ตอบครบทุกข้อ มีรายละเอียดเพียงพอ', greatEn: 'All questions answered with sufficient detail',
            okTh: 'ตอบเกือบครบ บางข้อสั้นเกินไป', okEn: 'Almost complete, some answers too brief',
            reworkTh: 'ข้ามหลายข้อหรือคำตอบสั้นมากเกินไป', reworkEn: 'Skipped several questions or answers too short' },
        ],
      },
    },
    {
      weekOrder: 1, code: 'A2', order: 2, dueOffsetDays: 10,
      titleTh: 'One-Pager: โมเดลรายได้ของ Click Broker', titleEn: 'One-Pager: Click Broker Revenue Model',
      descriptionTh: 'เขียน One-Pager อธิบายโมเดลรายได้ของ Click Broker โดยใช้ตัวเลขจริง',
      descriptionEn: 'Write a one-pager explaining Click Broker\'s revenue model using real numbers.',
      questions: [
        { order: 1, type: 'LONG_TEXT', promptTh: 'อธิบายขั้นตอนที่ Click Broker สร้างรายได้ตั้งแต่ต้นจนจบ (Customer Journey → Revenue)', promptEn: 'Explain the full flow of how Click Broker earns revenue from start to finish (Customer Journey → Revenue).' },
        { order: 2, type: 'LONG_TEXT', promptTh: 'สมมติงบโฆษณา 100,000 บาท/เดือน CPL = 300 บาท Conversion Rate = 10% เบี้ยเฉลี่ย = 15,000 บาท Commission = 15% คำนวณ Revenue และ Margin', promptEn: 'Assume: Ad budget 100,000 THB/month, CPL = 300 THB, Conversion Rate = 10%, Avg premium = 15,000 THB, Commission = 15%. Calculate Revenue and Margin.' },
        { order: 3, type: 'LONG_TEXT', promptTh: 'อะไรคือความเสี่ยงหลักต่อโมเดลธุรกิจนี้? และควรรับมืออย่างไร?', promptEn: 'What are the main risks to this business model? How should they be managed?' },
        { order: 4, type: 'LONG_TEXT', promptTh: 'ถ้าคุณต้องเพิ่ม Revenue 20% ใน 6 เดือน คุณจะทำอะไรก่อน?', promptEn: 'If you had to increase Revenue by 20% in 6 months, what would you do first?' },
        { order: 5, type: 'LONG_TEXT', promptTh: 'สิ่งที่คุณอยากรู้เพิ่มเติมเกี่ยวกับโมเดลธุรกิจของเรา มีคำถามอะไรบ้าง?', promptEn: 'What else would you like to know about our business model? What questions do you have?' },
        { order: 6, type: 'FILE_UPLOAD', promptTh: 'อัพโหลด One-Pager ที่สรุปทั้งหมดข้างต้น (PDF หรือ PPTX ไม่เกิน 2 หน้า)', promptEn: 'Upload your one-pager summarizing all the above (PDF or PPTX, max 2 pages)',
          config: { accept: '.pdf,.pptx,.ppt', maxFiles: 1, maxSizeMB: 25 } },
      ],
      rubric: {
        rows: [
          { order: 1, labelTh: 'ความชัดเจนของ Flow รายได้', labelEn: 'Revenue Flow Clarity',
            greatTh: 'อธิบาย Flow ครบ 7 ขั้นตอน เข้าใจง่าย', greatEn: 'Clear 7-step flow, easy to understand',
            okTh: 'Flow ชัดเจนแต่ขาดบางขั้นตอน', okEn: 'Clear flow but missing some steps',
            reworkTh: 'Flow ไม่ชัดเจนหรือไม่ครบ', reworkEn: 'Flow unclear or incomplete' },
          { order: 2, labelTh: 'ความถูกต้องของการคำนวณ', labelEn: 'Math Accuracy',
            greatTh: 'ตัวเลขถูกต้องทั้งหมด มี Margin ที่สมเหตุสมผล', greatEn: 'All numbers correct, realistic margin',
            okTh: 'ตัวเลขส่วนใหญ่ถูก มีผิดเล็กน้อย', okEn: 'Mostly correct, minor errors',
            reworkTh: 'ตัวเลขผิดหลายจุดหรือไม่มีการคำนวณ', reworkEn: 'Multiple calculation errors or no calculation' },
          { order: 3, labelTh: 'คำถามที่ฉลาด', labelEn: 'Insightful Question',
            greatTh: 'มีคำถาม Real ที่แสดงว่าคิดลึก', greatEn: 'Has a real question showing deep thinking',
            okTh: 'มีคำถามแต่ค่อนข้าง Surface Level', okEn: 'Has a question but somewhat surface-level',
            reworkTh: 'ไม่มีคำถามหรือคำถามไม่ตรงประเด็น', reworkEn: 'No question or irrelevant question' },
        ],
      },
    },
    {
      weekOrder: 2, code: 'A3', order: 1, dueOffsetDays: 14,
      titleTh: 'Channel Audit Report', titleEn: 'Channel Audit Report',
      descriptionTh: 'วิเคราะห์ Digital Channels ของ Click Broker และเสนอแนะแนวทางปรับปรุง',
      descriptionEn: 'Analyze Click Broker\'s digital channels and propose improvements.',
      questions: [
        { order: 1, type: 'TABLE', promptTh: 'กรอกข้อมูล Channel Audit ตามตารางด้านล่าง', promptEn: 'Fill in the channel audit data in the table below',
          config: {
            columns: ['Channel', 'Metric ที่วัด', 'ตัวเลขปัจจุบัน', 'เปรียบเทียบกับ Benchmark', 'ประเมิน (ดี/ปานกลาง/ต้องปรับ)', 'สาเหตุที่คาดว่าเป็น', 'Recommendation', 'Priority', 'Timeline', 'Expected Impact'],
            rows: ['SEO / Organic', 'Google Ads', 'Facebook Ads', 'Instagram', 'LINE OA', 'YouTube', 'Email', 'Referral', 'Direct', 'Overall'],
          },
        },
        { order: 2, type: 'FILE_UPLOAD', promptTh: 'อัพโหลด Screenshot จาก Analytics Dashboard (GA4 หรือ Ads Platform) ที่สนับสนุนการวิเคราะห์ของคุณ', promptEn: 'Upload screenshots from analytics dashboards supporting your analysis',
          config: { accept: '.pdf,.png,.jpg,.jpeg', maxFiles: 5, maxSizeMB: 25 } },
        { order: 3, type: 'FILE_UPLOAD', promptTh: 'อัพโหลด Competitive Analysis (ถ้ามี) เช่น Facebook Ads Library Screenshots', promptEn: 'Upload competitive analysis materials (if any)',
          config: { accept: '.pdf,.png,.jpg,.jpeg,.pptx', maxFiles: 3, maxSizeMB: 25 } },
        { order: 4, type: 'LONG_TEXT', promptTh: 'สรุปสิ่งที่คุณพบจาก Channel Audit: Channel ไหนทำงานได้ดีที่สุด? ไหนต้องปรับปรุงที่สุด? และทำไม?', promptEn: 'Summarize your findings: Which channel performs best? Which needs the most improvement? Why?' },
      ],
      rubric: {
        rows: [
          { order: 1, labelTh: 'ความครบถ้วนของ Channel', labelEn: 'Channel Completeness',
            greatTh: 'ครบทุก Channel มีตัวเลขจริง', greatEn: 'All channels covered with real numbers',
            okTh: 'ครบส่วนใหญ่ บางช่องขาดตัวเลข', okEn: 'Most channels covered, some missing numbers',
            reworkTh: 'ขาด Channel หลักหรือไม่มีตัวเลข', reworkEn: 'Missing key channels or no numbers' },
          { order: 2, labelTh: 'คุณภาพการวิเคราะห์', labelEn: 'Analysis Quality',
            greatTh: 'วิเคราะห์เชิงลึก มี Insight ที่แท้จริง', greatEn: 'Deep analysis with genuine insights',
            okTh: 'วิเคราะห์ระดับดี แต่ Insight ยังไม่ลึกมาก', okEn: 'Good analysis but insights not very deep',
            reworkTh: 'วิเคราะห์ผิวเผิน ไม่มี Insight', reworkEn: 'Superficial analysis, no real insights' },
          { order: 3, labelTh: 'คุณภาพของ Recommendation', labelEn: 'Recommendation Quality',
            greatTh: 'Recommendations เป็นรูปธรรม ทำได้จริง', greatEn: 'Concrete, actionable recommendations',
            okTh: 'มี Recommendations แต่ยังกว้างเกินไป', okEn: 'Has recommendations but too broad',
            reworkTh: 'ไม่มี Recommendations หรือไม่ตรงประเด็น', reworkEn: 'No recommendations or irrelevant ones' },
        ],
      },
    },
    {
      weekOrder: 3, code: 'A4', order: 1, dueOffsetDays: 21,
      titleTh: 'CPL Breakdown Analysis', titleEn: 'CPL Breakdown Analysis',
      descriptionTh: 'วิเคราะห์ CPL ของแต่ละ Channel และเสนอแนวทางลด CPL',
      descriptionEn: 'Analyze CPL by channel and propose ways to reduce it.',
      questions: [
        { order: 1, type: 'TABLE', promptTh: 'กรอกข้อมูล CPL Breakdown ตามตาราง', promptEn: 'Fill in the CPL breakdown table',
          config: {
            columns: ['Channel', 'งบ (บาท)', 'Clicks/Impressions', 'Leads', 'CPL (บาท)', 'Conversion Rate'],
            rows: ['Google Search', 'Google Display', 'Facebook Leads', 'Facebook Traffic', 'Instagram', 'LINE', 'Organic', 'Referral'],
          },
        },
        { order: 2, type: 'LONG_TEXT', promptTh: 'จากข้อมูลข้างต้น Channel ไหนมี CPL ดีที่สุดและแย่ที่สุด? ควรปรับงบอย่างไรและทำไม?', promptEn: 'Based on the data, which channel has the best/worst CPL? How should budget be reallocated and why?' },
      ],
      rubric: {
        rows: [
          { order: 1, labelTh: 'ความครบถ้วนของตาราง', labelEn: 'Table Completeness',
            greatTh: 'ทุก Channel มีตัวเลขครบและสอดคล้องกัน', greatEn: 'All channels have complete, consistent numbers',
            okTh: 'ส่วนใหญ่ครบ บางช่องว่าง', okEn: 'Mostly complete, some gaps',
            reworkTh: 'ตาราง Incomplete หรือตัวเลขไม่สอดคล้อง', reworkEn: 'Incomplete table or inconsistent numbers' },
          { order: 2, labelTh: 'คุณภาพการวิเคราะห์', labelEn: 'Analysis Quality',
            greatTh: 'วิเคราะห์ได้ถูกต้อง มีเหตุผลสนับสนุน', greatEn: 'Correct analysis with supporting reasons',
            okTh: 'วิเคราะห์ได้บางส่วน ขาดเหตุผล', okEn: 'Partial analysis, lacks reasoning',
            reworkTh: 'วิเคราะห์ผิดหรือไม่มีการวิเคราะห์', reworkEn: 'Wrong analysis or no analysis at all' },
        ],
      },
    },
    {
      weekOrder: 3, code: 'A5', order: 2, dueOffsetDays: 21,
      titleTh: 'Tracking Audit', titleEn: 'Tracking Audit',
      descriptionTh: 'ตรวจสอบว่า Tracking ของ Click Broker ครบถ้วนและถูกต้องหรือไม่',
      descriptionEn: 'Audit whether Click Broker\'s tracking is complete and accurate.',
      questions: [
        { order: 1, type: 'TABLE', promptTh: 'ตรวจสอบ Tracking Events ตามตาราง', promptEn: 'Audit tracking events using the table',
          config: {
            columns: ['Event', 'Platform', 'มีอยู่แล้ว?', 'ทดสอบแล้ว?', 'ปัญหาที่พบ', 'Priority ในการแก้'],
            rows: ['page_view', 'quote_request', 'lead_submit', 'purchase', 'login', 'add_to_cart', 'checkout_start', 'payment_success'],
          },
        },
        { order: 2, type: 'LONG_TEXT', promptTh: 'สรุปปัญหา Tracking ที่พบ และเสนอแผนการแก้ไขพร้อม Priority', promptEn: 'Summarize tracking issues found and propose a fix plan with priorities.' },
      ],
      rubric: {
        rows: [
          { order: 1, labelTh: 'ความครบถ้วน', labelEn: 'Coverage',
            greatTh: 'ตรวจสอบครบทุก Event ทุก Platform', greatEn: 'All events and platforms checked',
            okTh: 'ตรวจสอบส่วนใหญ่', okEn: 'Most checked',
            reworkTh: 'ตรวจสอบไม่ครบ', reworkEn: 'Incomplete audit' },
          { order: 2, labelTh: 'แผนการแก้ไข', labelEn: 'Fix Plan',
            greatTh: 'แผนชัดเจน มี Priority และ Timeline', greatEn: 'Clear plan with priority and timeline',
            okTh: 'มีแผนแต่ขาด Detail', okEn: 'Has plan but lacks detail',
            reworkTh: 'ไม่มีแผนหรือแผนไม่ชัดเจน', reworkEn: 'No plan or unclear' },
        ],
      },
    },
    {
      weekOrder: 4, code: 'A6', order: 1, dueOffsetDays: 30,
      titleTh: 'Improvement Proposal Deck', titleEn: 'Improvement Proposal Deck',
      descriptionTh: 'สร้าง Proposal Deck 15 Slides เสนอแนวทางปรับปรุง Digital Marketing ของ Click Broker',
      descriptionEn: 'Create a 15-slide proposal deck to improve Click Broker\'s digital marketing.',
      questions: [
        { order: 1, type: 'LONG_TEXT', promptTh: 'Slide 1-2: ชื่อ Proposal และ Problem Statement — ปัญหาอะไรที่คุณต้องการแก้?', promptEn: 'Slides 1–2: Title and Problem Statement — What problem are you solving?' },
        { order: 2, type: 'LONG_TEXT', promptTh: 'Slide 3-4: Data Evidence — ตัวเลขอะไรที่แสดงว่าปัญหามีอยู่จริง?', promptEn: 'Slides 3–4: Data Evidence — What numbers prove the problem exists?' },
        { order: 3, type: 'LONG_TEXT', promptTh: 'Slide 5: Root Cause — สาเหตุที่แท้จริงของปัญหาคืออะไร?', promptEn: 'Slide 5: Root Cause — What is the real underlying cause?' },
        { order: 4, type: 'LONG_TEXT', promptTh: 'Slide 6: Opportunity — ถ้าแก้ได้ จะมีผลกระทบมูลค่าเท่าไหร่?', promptEn: 'Slide 6: Opportunity — What is the value if we fix this?' },
        { order: 5, type: 'LONG_TEXT', promptTh: 'Slide 7-8: Solution Overview และ How It Works — คุณเสนออะไรและทำงานอย่างไร?', promptEn: 'Slides 7–8: Solution Overview and How It Works' },
        { order: 6, type: 'LONG_TEXT', promptTh: 'Slide 9: ICE Score — ให้คะแนน Impact, Confidence, Ease และอธิบายเหตุผล', promptEn: 'Slide 9: ICE Score — Score Impact, Confidence, Ease and explain your reasoning.' },
        { order: 7, type: 'LONG_TEXT', promptTh: 'Slide 10-11: Experiment Design และ Timeline', promptEn: 'Slides 10–11: Experiment Design and Timeline' },
        { order: 8, type: 'LONG_TEXT', promptTh: 'Slide 12-13: Expected Results และ Risk & Mitigation', promptEn: 'Slides 12–13: Expected Results and Risk & Mitigation' },
        { order: 9, type: 'LONG_TEXT', promptTh: 'Slide 14: Success Metrics — วัดผลอย่างไรว่า Experiment สำเร็จ?', promptEn: 'Slide 14: Success Metrics — How will you measure success?' },
        { order: 10, type: 'LONG_TEXT', promptTh: 'Slide 15: The Ask — คุณขออนุมัติอะไรบ้าง? (งบ, คน, เวลา)', promptEn: 'Slide 15: The Ask — What are you requesting approval for? (budget, people, time)' },
        { order: 11, type: 'FILE_UPLOAD', promptTh: 'อัพโหลด Deck จริง (PPTX หรือ PDF)', promptEn: 'Upload your actual deck (PPTX or PDF)',
          config: { accept: '.pdf,.pptx,.ppt', maxFiles: 1, maxSizeMB: 25 } },
      ],
      rubric: {
        rows: [
          { order: 1, labelTh: 'โครงสร้าง 15 Slides', labelEn: '15-Slide Structure',
            greatTh: 'ครบ 15 Slides เรียงลำดับสมเหตุสมผล', greatEn: 'All 15 slides present and logically ordered',
            okTh: 'ส่วนใหญ่ครบ ขาดบาง Slide', okEn: 'Mostly complete, missing some slides',
            reworkTh: 'ขาด Slides หลักหลายอัน', reworkEn: 'Missing several key slides' },
          { order: 2, labelTh: 'ICE Score มีเหตุผล', labelEn: 'ICE Score Justified',
            greatTh: 'ICE Score ทุก Dimension มีเหตุผลชัดเจน', greatEn: 'Each ICE dimension clearly justified',
            okTh: 'ICE Score ครบแต่เหตุผลยังไม่ชัด', okEn: 'ICE complete but reasoning not fully clear',
            reworkTh: 'ไม่มี ICE Score หรือไม่มีเหตุผล', reworkEn: 'No ICE score or no justification' },
          { order: 3, labelTh: 'ความชัดเจนของ Ask', labelEn: 'Clear Ask',
            greatTh: 'ระบุสิ่งที่ต้องการชัดเจน ทำได้จริง', greatEn: 'Clear, actionable ask with specifics',
            okTh: 'มี Ask แต่ยังกว้างเกินไป', okEn: 'Has an ask but too vague',
            reworkTh: 'ไม่มี Ask ที่ชัดเจน', reworkEn: 'No clear ask' },
          { order: 4, labelTh: 'คุณภาพการนำเสนอ', labelEn: 'Presentation Quality',
            greatTh: 'นำเสนอคล่อง ไม่อ่าน Slide', greatEn: 'Fluent presentation, not reading slides',
            okTh: 'นำเสนอได้ แต่อ่าน Slide บางส่วน', okEn: 'Decent presentation, reads some slides',
            reworkTh: 'อ่าน Slide ตลอดหรือนำเสนอไม่ครบ', reworkEn: 'Reads slides throughout or incomplete' },
        ],
      },
    },
  ]

  for (const aData of assignmentsData) {
    const weekId = weekMap[aData.weekOrder]
    if (!weekId) continue

    let assignment = await prisma.assignment.findFirst({ where: { weekId, code: aData.code } })
    if (!assignment) {
      assignment = await prisma.assignment.create({
        data: {
          weekId, code: aData.code, order: aData.order,
          dueOffsetDays: aData.dueOffsetDays,
          titleTh: aData.titleTh, titleEn: aData.titleEn,
          descriptionTh: aData.descriptionTh, descriptionEn: aData.descriptionEn,
        },
      })
    }

    for (const qData of aData.questions) {
      const exists = await prisma.question.findFirst({ where: { assignmentId: assignment.id, order: qData.order } })
      if (!exists) {
        await prisma.question.create({
          data: {
            assignmentId: assignment.id, order: qData.order,
            type: qData.type as any, promptTh: qData.promptTh,
            promptEn: qData.promptEn ?? null, required: true,
            config: (qData as any).config ?? null,
          },
        })
      }
    }

    let rubric = await prisma.rubric.findFirst({ where: { assignmentId: assignment.id } })
    if (!rubric) {
      rubric = await prisma.rubric.create({ data: { assignmentId: assignment.id } })
    }
    for (const rData of aData.rubric.rows) {
      const exists = await prisma.rubricRow.findFirst({ where: { rubricId: rubric.id, order: rData.order } })
      if (!exists) {
        await prisma.rubricRow.create({ data: { rubricId: rubric.id, ...rData } })
      }
    }
  }

  console.log('✅ Assignments and rubrics seeded')
  console.log('')
  console.log('Login credentials:')
  console.log('  admin@test.com / 123456 (ADMIN)')
  console.log('  manager@test.com / 123456 (MANAGER)')
  console.log('  staff@test.com / 123456 (STAFF)')
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
