import CheckInForm from './checkin-form'

export default function CheckInPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-5 pt-12 pb-6 border-b">
        <p className="text-gray-500 text-sm">오늘의 시작 ☀️</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">체크인</h1>
      </div>
      <div className="flex-1 px-5 py-6">
        <CheckInForm />
      </div>
    </div>
  )
}
