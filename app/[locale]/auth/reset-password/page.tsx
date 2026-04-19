import SetPasswordPage from '../set-password/page'

export default function ResetPasswordPage({ params }: { params: { locale: string } }) {
  return <SetPasswordPage params={params} />
}
