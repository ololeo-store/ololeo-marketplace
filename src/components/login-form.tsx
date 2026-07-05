"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/store/useAuth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/shop");
    } catch (err: any) {
      setError(err.message || "Email atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-0 shadow-xl shadow-pink-100/30">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <Link
                  href="/"
                  className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 dark:from-secondary to-purple-400 dark:to-primary"
                >
                  Ololeo Store
                </Link>
                <p className="text-balance text-muted-foreground text-sm">
                  Masuk ke akunmu untuk mulai belanja
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium text-center">
                  {error}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-pink-400 dark:from-secondary to-purple-400 dark:to-primary hover:from-pink-500 hover:to-purple-500 text-white font-bold shadow-md shadow-pink-200/50">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Masuk...
                    </span>
                  ) : (
                    "Masuk"
                  )}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Belum punya akun?{" "}
                <Link href="/signup" className="text-pink-500 dark:text-primary font-semibold hover:underline">
                  Daftar
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-gradient-to-br from-pink-100 to-purple-100 dark:bg-none dark:bg-muted md:flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🌸</div>
              <h3 className="text-xl font-bold text-gray-700 dark:text-muted-foreground mb-2">
                Selamat Datang Kembali
              </h3>
              <p className="text-sm text-gray-500 dark:text-muted-foreground">
                Temukan buket bunga cantik untuk setiap momen spesialmu
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
