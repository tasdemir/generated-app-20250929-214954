import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
export function HomePage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      toast.loading('Giriş yapılıyor...');
      await login(username, password);
      toast.dismiss();
      toast.success('Başarıyla giriş yapıldı!', {
        description: 'Kontrol paneline yönlendiriliyorsunuz.',
      });
      navigate('/app');
    } catch (error) {
      toast.dismiss();
      const errorMessage = error instanceof Error ? error.message : 'Giriş başarısız oldu.';
      toast.error('Giriş Başarısız!', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-kadro-navy p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,197,94,0.15),rgba(255,255,255,0))]"></div>
      <Card className="mx-auto max-w-sm w-full z-10 bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src="https://raw.githubusercontent.com/user-attachments/assets/9b4a2754-2f3a-4ac2-8302-311124e75f3a" alt="KadroKur Logo" className="h-16 w-16" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-foreground">KadroKur</CardTitle>
            <CardDescription className="text-muted-foreground">Amatör futbol maç organizasyonu</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                type="text"
                placeholder="kullanici_adi"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Hesabın yok mu?{' '}
            <Link to="/register" className="underline text-kadro-green font-semibold">
              Kayıt ol
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}