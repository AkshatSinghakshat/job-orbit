import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, ShieldCheck, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function EmailOtpVerification({ email }) {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  // A countdown that starts when the OTP screen opens.
  // It is for UI convenience; the backend remains authoritative.
  useState(() => {
    const timer = setInterval(() => {
      setCooldown((value) => {
        if (value <= 1) {
          clearInterval(timer);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  });

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!/^\d{4}$/.test(otp)) {
      setError("Please enter the 4-digit verification code.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/auth/verify-email`, {
        email,
        otp,
      });

      if (response.data.success) {
        navigate("/login", {
          replace: true,
          state: {
            message:
              "Email verified and registration completed. Please log in.",
          },
        });
      } else {
        setError(response.data.message || "Verification failed.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to verify the code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setError("");
    setMessage("");

    try {
      setResending(true);

      const response = await axios.post(`${API_URL}/auth/resend-otp`, {
        email,
      });

      setMessage(response.data.message || "A new code has been sent.");
      setOtp("");
      setCooldown(60);

      const timer = setInterval(() => {
        setCooldown((value) => {
          if (value <= 1) {
            clearInterval(timer);
            return 0;
          }
          return value - 1;
        });
      }, 1000);
    } catch (err) {
      const wait = Number(err.response?.data?.retryAfterSeconds || 60);
      setCooldown(wait);
      setError(
        err.response?.data?.message || "Could not resend the code."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
          <ShieldCheck size={28} />
        </div>

        <h1 className="text-center text-2xl font-bold text-slate-900">
          Verify your email
        </h1>

        <p className="mt-2 text-center text-sm text-slate-600">
          Enter the 4-digit code sent to
        </p>

        <p className="mb-6 mt-1 break-all text-center font-semibold text-blue-700">
          <Mail className="mr-1 inline" size={16} />
          {email}
        </p>

        <form onSubmit={verifyOtp}>
          <label
            htmlFor="otp"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Verification code
          </label>

          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={4}
            pattern="[0-9]{4}"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 4));
              setError("");
            }}
            placeholder="0000"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-4 text-center text-2xl font-bold tracking-[0.6em] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="mt-3 text-sm text-green-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 4}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? "Verifying..." : "Verify & Create Account"}
          </button>
        </form>

        <button
          type="button"
          onClick={resendOtp}
          disabled={resending || cooldown > 0}
          className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resending
            ? "Sending..."
            : cooldown > 0
              ? `Resend code in ${cooldown}s`
              : "Resend verification code"}
        </button>

        <p className="mt-4 text-center text-xs text-slate-500">
          The code expires after 5 minutes. Never share it with anyone.
        </p>
      </div>
    </div>
  );
}