import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import {
  BookMarked,
  LogIn,
  GraduationCap,
  UserCog,
  UserPlus,
  ShieldCheck,
  BookOpen,
  BarChart2,
  Mail,
  KeyRound,
  Users,
  FileText,
  Sparkles,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function GuidePage({ params }: { params: { locale: string } }) {
  const session = await auth()
  if (!session) redirect(`/${params.locale}/auth/sign-in`)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
          <BookMarked className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">คู่มือการใช้งาน</h1>
          <p className="text-slate-400 text-sm mt-1">
            แนะนำการใช้งานระบบ Click Broker Learning ทั้งสำหรับพนักงานและผู้ดูแลระบบ
          </p>
        </div>
      </div>

      {/* Section: ภาพรวมระบบ */}
      <Section icon={Sparkles} title="ภาพรวมระบบ">
        <p>
          <span className="text-white font-medium">Click Broker Learning</span>{' '}
          คือระบบการเรียนรู้ภายในองค์กรของ Click Insurance Broker
          ออกแบบมาเพื่อช่วยพนักงานใหม่ออนบอร์ดเข้าสู่งานด้านประกันภัยรถยนต์และการตลาดดิจิทัลได้อย่างเป็นระบบ
          และช่วยให้หัวหน้างานและผู้ดูแลระบบสามารถติดตามความก้าวหน้า ตรวจงาน
          และจัดการผู้ใช้ได้จากที่เดียว
        </p>
        <ul className="list-disc pl-5 space-y-1.5 mt-3 text-slate-300">
          <li>พนักงานใหม่เข้าเรียนหลักสูตรออนบอร์ด 30 วัน</li>
          <li>ส่งงานและรับการประเมินตาม rubric ที่ชัดเจน</li>
          <li>ผู้จัดการตรวจงานและให้ feedback ผ่านคิวรอตรวจ</li>
          <li>ผู้ดูแลระบบสร้างหลักสูตร จัดการผู้ใช้ และดูสถิติภาพรวม</li>
        </ul>
      </Section>

      {/* Section: วิธีเข้าสู่ระบบ */}
      <Section icon={LogIn} title="วิธีเข้าสู่ระบบ">
        <p>มีสองวิธีในการเข้าสู่ระบบ เลือกใช้วิธีใดก็ได้ตามสะดวก</p>

        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <Card title="อีเมล + รหัสผ่าน" icon={KeyRound}>
            <ol className="list-decimal pl-5 space-y-1 text-slate-300 text-sm">
              <li>เปิดหน้า <code className="text-blue-300">/th/auth/sign-in</code></li>
              <li>กรอกอีเมลและรหัสผ่านที่ได้รับจากผู้ดูแลระบบ</li>
              <li>กดปุ่ม <span className="text-white">เข้าสู่ระบบ</span></li>
              <li>หากเป็นการเข้าครั้งแรก จะถูกนำไปยังหน้าตั้งรหัสผ่านก่อน</li>
            </ol>
          </Card>

          <Card title="เข้าสู่ระบบด้วย Google" icon={Mail}>
            <ol className="list-decimal pl-5 space-y-1 text-slate-300 text-sm">
              <li>คลิกปุ่ม <span className="text-white">เข้าสู่ระบบด้วย Google</span></li>
              <li>เลือกบัญชี Google ของบริษัท</li>
              <li>ระบบจะพาเข้าสู่แดชบอร์ดโดยอัตโนมัติ</li>
              <li>หากเป็นการเข้าครั้งแรก ระบบจะสร้างบัญชีให้อัตโนมัติด้วยสิทธิ์พนักงาน</li>
            </ol>
          </Card>
        </div>

        <Note>
          หากลืมรหัสผ่าน กดลิงก์ <span className="text-blue-300">ลืมรหัสผ่าน?</span>{' '}
          ในหน้าเข้าสู่ระบบ หรือติดต่อผู้ดูแลระบบให้รีเซ็ตรหัสผ่านให้
        </Note>
      </Section>

      {/* Section: การใช้งานสำหรับพนักงาน */}
      <Section icon={GraduationCap} title="การใช้งานสำหรับพนักงาน (STAFF)">
        <p>เมนูหลักที่พนักงานใช้ประจำ แต่ละเมนูอยู่ด้านซ้ายของจอ</p>

        <div className="space-y-3 mt-4">
          <Card title="แดชบอร์ด" icon={BookOpen}>
            <p className="text-slate-300 text-sm">
              สรุปความก้าวหน้าของคุณ — จำนวนบทเรียนที่เรียนแล้ว
              งานที่ส่ง และคะแนนเฉลี่ยจากการประเมินล่าสุด
            </p>
          </Card>

          <Card title="หลักสูตรของฉัน" icon={GraduationCap}>
            <ol className="list-decimal pl-5 space-y-1 text-slate-300 text-sm">
              <li>คลิก <span className="text-white">หลักสูตรของฉัน</span> ที่เมนูด้านซ้าย</li>
              <li>เลือกสัปดาห์ที่ต้องการเรียน (เรียงตามลำดับ สัปดาห์ที่ 1 → 4)</li>
              <li>คลิกเข้าไปในแต่ละบทเรียนเพื่ออ่านเนื้อหา</li>
              <li>กด <span className="text-white">ทำเครื่องหมายว่าเรียนจบแล้ว</span> เมื่ออ่านจบ</li>
              <li>เมื่อถึงบทที่มีใบงาน ระบบจะแสดงปุ่มให้กดเข้าไปทำงาน</li>
            </ol>
          </Card>

          <Card title="งานของฉัน" icon={FileText}>
            <p className="text-slate-300 text-sm">
              ดูงานที่เคยส่งทั้งหมด พร้อมสถานะ (รอตรวจ / ตรวจแล้ว)
              และคอมเมนต์จากผู้ตรวจ หากต้องแก้ไข สามารถแก้แล้วส่งใหม่ได้จากหน้านี้
            </p>
          </Card>

          <Card title="ตั้งค่าบัญชี" icon={UserCog}>
            <p className="text-slate-300 text-sm">
              แก้ไขชื่อที่แสดงผล เปลี่ยนรหัสผ่าน และเลือกภาษาที่ต้องการ (ไทย / อังกฤษ)
            </p>
          </Card>
        </div>
      </Section>

      {/* Section: การใช้งานสำหรับแอดมิน */}
      <Section icon={ShieldCheck} title="การใช้งานสำหรับผู้ดูแลระบบ (ADMIN)">
        <p>
          ผู้ดูแลระบบสามารถจัดการผู้ใช้ สร้างและแก้ไขหลักสูตร
          และดูสถิติภาพรวมของทั้งองค์กรได้
        </p>

        <div className="space-y-4 mt-4">
          <SubSection icon={Users} title="จัดการผู้ใช้">
            <ol className="list-decimal pl-5 space-y-1 text-slate-300 text-sm">
              <li>ไปที่เมนู <span className="text-white">ผู้ใช้งาน</span></li>
              <li>กด <span className="text-white">เพิ่มผู้ใช้</span> เพื่อเชิญพนักงานใหม่</li>
              <li>กรอกอีเมล ชื่อภาษาไทย และเลือกสิทธิ์ (STAFF / MANAGER / ADMIN)</li>
              <li>ระบบจะแสดงลิงก์เชิญ — คัดลอกและส่งให้ผู้ใช้ทางแชตหรืออีเมล</li>
              <li>
                สำหรับผู้ใช้ที่มีอยู่แล้ว สามารถแก้บทบาท เปลี่ยนสถานะเป็น{' '}
                <span className="text-white">ใช้งาน / ระงับ</span>{' '}
                หรือกด <span className="text-white">รีเซ็ตรหัสผ่าน</span> ได้
              </li>
            </ol>
          </SubSection>

          <SubSection icon={GraduationCap} title="สร้างและแก้ไขหลักสูตร">
            <ol className="list-decimal pl-5 space-y-1 text-slate-300 text-sm">
              <li>ไปที่เมนู <span className="text-white">หลักสูตร</span></li>
              <li>
                กด <span className="text-white">สร้างหลักสูตรใหม่</span>{' '}
                กรอกชื่อทั้งสองภาษา รายละเอียด และ slug (ใช้เป็น URL)
              </li>
              <li>
                คลิกเข้าไปในหลักสูตรเพื่อจัดการ{' '}
                <span className="text-white">สัปดาห์ (Weeks)</span>
              </li>
              <li>
                ในแต่ละสัปดาห์ สามารถเพิ่ม / แก้ / ลบ{' '}
                <span className="text-white">บทเรียน (Lessons)</span> ได้
              </li>
              <li>
                ในหน้าบทเรียน สามารถเขียนเนื้อหาเป็น Markdown
                และผูกใบงาน (Assignment) เข้ากับบทได้
              </li>
              <li>
                เมื่อต้องการเผยแพร่ ให้เปิดสวิตช์{' '}
                <span className="text-white">เผยแพร่</span>{' '}
                — พนักงานจะเห็นหลักสูตรทันที
              </li>
            </ol>
          </SubSection>

          <SubSection icon={BarChart2} title="ดูสถิติและบันทึก">
            <ul className="list-disc pl-5 space-y-1 text-slate-300 text-sm">
              <li>
                <span className="text-white">สถิติ</span> —
                กราฟรายวัน 30 วันล่าสุด, การกระจายตัวของสถานะผู้ใช้ / บทบาท,
                คะแนน rubric เฉลี่ย, งานที่ได้คะแนนสูงสุด / ต่ำสุด
              </li>
              <li>
                <span className="text-white">คิวรอตรวจ</span> —
                รายการงานที่พนักงานส่งแล้วยังไม่ได้ตรวจ สามารถคลิกเข้าไปให้คะแนนได้ทันที
              </li>
              <li>
                <span className="text-white">บันทึกการดำเนินการ</span> —
                log การเปลี่ยนแปลงทั้งหมดในระบบ (สร้าง / แก้ไข / ลบ / เข้าสู่ระบบ)
                กรองตามการกระทำ เอนทิตี หรือผู้กระทำได้
              </li>
            </ul>
          </SubSection>
        </div>
      </Section>

      {/* Section: วิธีเชิญผู้ใช้ใหม่ */}
      <Section icon={UserPlus} title="วิธีเชิญผู้ใช้ใหม่">
        <p>
          การเพิ่มผู้ใช้ใหม่ทำได้สองวิธี ขึ้นอยู่กับว่าผู้ใช้มีอีเมลบริษัทหรือไม่
        </p>

        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <Card title="พนักงานที่ใช้อีเมลบริษัท" icon={Mail}>
            <p className="text-slate-300 text-sm mb-2">
              หากองค์กรเปิดใช้ Google Login และอีเมลอยู่ในโดเมนที่อนุญาต
              <span className="text-white"> ไม่ต้องเชิญล่วงหน้า</span>
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-slate-300 text-sm">
              <li>แจ้งพนักงานให้เข้า URL ของระบบ</li>
              <li>กด <span className="text-white">เข้าสู่ระบบด้วย Google</span></li>
              <li>ระบบจะสร้างบัญชีให้อัตโนมัติเป็นสิทธิ์ STAFF</li>
              <li>หากต้องการเลื่อนสิทธิ์ แอดมินไปที่เมนูผู้ใช้งานแล้วแก้บทบาท</li>
            </ol>
          </Card>

          <Card title="บุคคลภายนอก / ที่ปรึกษา" icon={UserPlus}>
            <p className="text-slate-300 text-sm mb-2">
              สำหรับอีเมลนอกโดเมนบริษัท ต้องให้แอดมินเชิญก่อน
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-slate-300 text-sm">
              <li>แอดมินเข้าเมนู <span className="text-white">ผู้ใช้งาน</span></li>
              <li>กด <span className="text-white">เพิ่มผู้ใช้</span> กรอกอีเมลและชื่อ</li>
              <li>เลือกบทบาทที่เหมาะสม (ปกติคือ STAFF)</li>
              <li>คัดลอกลิงก์เชิญที่ระบบสร้างให้ ส่งให้ผู้ใช้</li>
              <li>ผู้ใช้เปิดลิงก์ → ตั้งรหัสผ่านเอง → เข้าสู่ระบบได้ทันที</li>
            </ol>
          </Card>
        </div>

        <Note>
          ผู้ดูแลระบบสามารถระงับผู้ใช้ได้โดยกด{' '}
          <span className="text-white">ปิดใช้งาน</span> ในหน้าผู้ใช้งาน
          — ผู้ใช้ที่ถูกระงับจะไม่สามารถเข้าสู่ระบบได้ทั้งทางรหัสผ่านและ Google
        </Note>
      </Section>

      {/* Section: การใช้ Google Login */}
      <Section icon={Mail} title="การใช้ Google Login">
        <p>
          หากผู้ดูแลระบบเปิดใช้ Google Login ไว้
          ปุ่ม <span className="text-white">เข้าสู่ระบบด้วย Google</span>{' '}
          จะปรากฏในหน้าเข้าสู่ระบบ
        </p>

        <div className="space-y-3 mt-4">
          <Card title="ขั้นตอนการใช้งาน" icon={LogIn}>
            <ol className="list-decimal pl-5 space-y-1 text-slate-300 text-sm">
              <li>คลิกปุ่ม <span className="text-white">เข้าสู่ระบบด้วย Google</span></li>
              <li>หน้าต่างเลือกบัญชี Google จะเปิดขึ้น</li>
              <li>เลือกบัญชีที่ต้องการใช้งาน (แนะนำให้ใช้อีเมลบริษัท)</li>
              <li>กดอนุญาตให้ระบบเข้าถึงข้อมูลพื้นฐาน (ชื่อ, อีเมล, รูปโปรไฟล์)</li>
              <li>ระบบจะพากลับมาที่แดชบอร์ดโดยอัตโนมัติ</li>
            </ol>
          </Card>

          <Card title="หลักสำคัญด้านความปลอดภัย" icon={ShieldCheck}>
            <ul className="list-disc pl-5 space-y-1 text-slate-300 text-sm">
              <li>
                บัญชีใหม่ที่สร้างผ่าน Google จะได้สิทธิ์
                <span className="text-white"> STAFF เท่านั้น</span>{' '}
                ไม่มีการตั้งเป็น ADMIN อัตโนมัติ
              </li>
              <li>
                เฉพาะอีเมลในโดเมนที่องค์กรกำหนดเท่านั้นที่สร้างบัญชีได้อัตโนมัติ
              </li>
              <li>
                ผู้ใช้นอกโดเมน จะเข้าสู่ระบบผ่าน Google ได้ก็ต่อเมื่อแอดมินเชิญไว้ล่วงหน้าแล้ว
              </li>
              <li>
                ระบบไม่บันทึกรหัสผ่านของ Google ใช้เพียง OAuth
                เพื่อยืนยันตัวตนเท่านั้น
              </li>
            </ul>
          </Card>
        </div>

        <Note>
          หากกด Google Login แล้วขึ้นว่า{' '}
          <span className="text-red-300">
            บัญชี Google นี้ไม่ได้รับสิทธิ์เข้าใช้ระบบ
          </span>{' '}
          แปลว่าอีเมลของคุณไม่อยู่ในโดเมนที่อนุญาตและยังไม่ได้รับการเชิญ
          โปรดติดต่อผู้ดูแลระบบให้เพิ่มบัญชีของคุณก่อน
        </Note>
      </Section>

      {/* Footer tip */}
      <div className="mt-8 px-5 py-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
        <p className="text-slate-300 text-sm">
          <span className="text-white font-medium">ต้องการความช่วยเหลือเพิ่มเติม?</span>{' '}
          ติดต่อผู้ดูแลระบบผ่านช่องทางภายในของบริษัท
          หรือตรวจดูบันทึกการดำเนินการของคุณที่หน้า{' '}
          <span className="text-blue-300">งานของฉัน</span>
        </p>
      </div>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="text-slate-300 text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  )
}

function SubSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <Icon className="w-4 h-4 text-slate-400" />
        <h3 className="text-white font-medium text-sm">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-slate-900 border border-white/5 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className="w-4 h-4 text-blue-400" />
        <h3 className="text-white font-medium text-sm">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
      <p className="text-slate-300 text-xs leading-relaxed">
        <span className="text-amber-400 font-medium">หมายเหตุ: </span>
        {children}
      </p>
    </div>
  )
}
