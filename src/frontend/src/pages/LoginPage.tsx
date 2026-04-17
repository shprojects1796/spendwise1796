import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { BarChart3, Eye, EyeOff, Shield, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import { useStore } from "../store/useStore";

const FEATURES = [
  { icon: BarChart3, text: "AI-powered spending insights" },
  { icon: Zap, text: "Real-time expense tracking" },
  { icon: Shield, text: "Smart budget alerts" },
];

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter a password.");
      return;
    }

    setIsLoading(true);
    // Simulate async login
    await new Promise((r) => setTimeout(r, 800));
    login(username.trim());
    setIsLoading(false);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background flex items-stretch overflow-hidden">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col w-1/2 gradient-primary p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white/5" />

        <div className="relative z-10 flex items-center gap-3 mb-16">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white tracking-tight">
            SpendWise
          </span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h1 className="font-display font-bold text-4xl text-white leading-tight mb-4">
            Take control of your finances
          </h1>
          <p className="text-white/75 text-lg leading-relaxed mb-12">
            AI-powered insights to analyze your spending habits, predict future
            expenses, and build better financial routines.
          </p>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4.5 h-4.5 text-white" size={18} />
                </div>
                <span className="text-white/90 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/50 text-sm mt-8">
          Your data is stored locally and processed with privacy in mind.
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-elevated">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-foreground tracking-tight">
              Spend<span className="text-primary">Wise</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="font-display font-bold text-3xl text-foreground tracking-tight">
              Sign in
            </h2>
            <p className="text-muted-foreground mt-1.5">
              Enter any credentials to access your dashboard
            </p>
          </div>

          <Card className="p-6 border border-border bg-card shadow-elevated">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-medium text-foreground"
                >
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="e.g. sarah_jones"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  data-ocid="login.username_input"
                  className="bg-background border-input"
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Any password works"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-ocid="login.password_input"
                    className="bg-background border-input pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-fast"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg"
                  data-ocid="login.error_state"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full gradient-primary text-white font-semibold border-0 hover:opacity-90 transition-smooth"
                disabled={isLoading}
                data-ocid="login.submit_button"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  "Sign in to SpendWise"
                )}
              </Button>
            </form>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            © {new Date().getFullYear()} SpendWise. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.hostname : "",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
