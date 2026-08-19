import { Phone, Loader2 } from "lucide-react";

function SmsOtpForm({
  otp,
  inputRefs,
  timeLeft,
  loading,
  canResend,
  resending,
  resendCooldown,
  formatTime,
  onChange,
  onKeyDown,
  onPaste,
  onSubmit,
  onResend,
}) {
  return (
    <>
      <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-gray-50 px-4 py-2">
        <span className="text-sm text-gray-600">Còn lại:</span>
        <span
          className={`font-mono text-lg font-bold ${
            timeLeft < 60 ? "text-red-600" : "text-gray-900"
          }`}
        >
          {formatTime(timeLeft)}
        </span>
      </div>

      {timeLeft === 0 && (
        <p className="mt-2 text-center text-sm text-red-600">
          Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.
        </p>
      )}

      <div className="mb-6 mt-6">
        <label className="mb-3 block text-center text-sm font-medium text-gray-700">
          Nhập mã OTP gồm 6 số
        </label>

        <div className="flex justify-center gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => onChange(index, e.target.value)}
              onKeyDown={(e) => onKeyDown(index, e)}
              onPaste={onPaste}
              disabled={loading || timeLeft === 0}
              className="h-12 w-12 rounded-lg border-2 border-gray-200 text-center text-xl font-bold text-gray-900 transition focus:border-[#ffba00] focus:outline-none focus:ring-2 focus:ring-[#ffba00]/20 disabled:bg-gray-100 disabled:text-gray-400 sm:h-14 sm:w-14"
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading || otp.join("").length !== 6 || timeLeft === 0}
        className="mb-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#ffba00] font-semibold text-[#6c4d00] shadow-sm transition hover:bg-[#e6a800] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Đang xác thực...
          </>
        ) : (
          "Xác thực OTP"
        )}
      </button>

      <div className="mt-6 border-t border-gray-200 pt-6 text-center">
        <p className="mb-3 text-sm text-gray-600">Không nhận được mã?</p>

        {canResend ? (
          <button
            type="button"
            onClick={onResend}
            disabled={resending}
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#b17b00] transition hover:text-[#7b5800] hover:underline disabled:text-gray-400"
          >
            {resending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Phone size={16} />
                Gửi lại mã OTP
              </>
            )}
          </button>
        ) : (
          <p className="text-sm text-gray-400">Gửi lại sau {resendCooldown}s</p>
        )}
      </div>

      <div className="mt-6 rounded-lg bg-blue-50 p-4 text-xs text-blue-800">
        <p className="mb-2 font-semibold">Lưu ý:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Nhập mã OTP đã khai báo trên Firebase Console</li>
          <li>Bạn có thể dán (paste) mã OTP 6 số</li>
          <li>Sau khi OTP đúng sẽ chuyển sang bước thông tin tài khoản</li>
        </ul>
      </div>
    </>
  );
}

export default SmsOtpForm;
