import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import Signup from "./Signup";

const inputCls =
  "px-3.5 py-2.5 text-sm rounded-md border border-line bg-surface focus:border-accent-400 outline-none w-full placeholder:text-faint";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      const token = data.session.access_token;
      localStorage.setItem("token", token);

      navigate("/");
    }
    else {
      setErrorMsg(error.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 rounded-md bg-accent-600 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
              <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
              <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
              <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
            </svg>
          </div>
          <span className="font-serif text-xl font-semibold">Notegrid</span>
        </div>

        <div className="border border-line rounded-card bg-surface p-7">
          <h1 className="text-lg font-medium mb-1.5 text-center">Sign in</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-muted">Email</span>
              <input type="email" required placeholder="you@university.edu.np" className={inputCls} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-muted">Password</span>
              <input type="password" required placeholder="Enter your password" className={inputCls} onChange={(e) => setPassword(e.target.value)} />
            </label>
            {errorMsg && <p className="text-sm text-error-600">{errorMsg}</p>}
            <button
              type="submit"
              className="mt-2 py-2.5 rounded-md bg-accent-600 text-white text-sm font-medium hover:bg-accent-700 transition-colors"
            >
              Sign in
            </button>
          </form>

          <p className="text-sm text-muted text-center mt-5">
            New here?{" "}
            <Link to="/signup" className="text-accent-700 font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
