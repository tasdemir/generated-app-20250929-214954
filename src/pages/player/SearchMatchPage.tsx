import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { Match, Field, User, PlayerRegistration } from '@shared/types';
import { useAuthStore } from '@/stores/auth-store';
import { Skeleton } from '@/components/ui/skeleton';
type EnrichedMatch = Match & { field: Field | null; coach: Partial<User> | null };
export function SearchMatchPage() {
  const [match, setMatch] = useState<EnrichedMatch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<PlayerRegistration['status']>('Mutlaka geleceğim');
  const { user } = useAuthStore();
  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = (event.currentTarget.elements.namedItem('match-code') as HTMLInputElement).value;
    if (!code) {
      toast.error('Lütfen bir maç kodu girin.');
      return;
    }
    setIsLoading(true);
    setMatch(null);
    try {
      const foundMatch = await api<EnrichedMatch>(`/api/matches/search/${code}`);
      setMatch(foundMatch);
      toast.success('Maç bulundu!');
    } catch (error) {
      toast.error('Maç bulunamadı. Kodu kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleRegister = async () => {
    if (!match || !user) return;
    setIsRegistering(true);
    try {
      await api(`/api/matches/${match.id}/register`, {
        method: 'POST',
        body: JSON.stringify({
          playerId: user.id,
          status: registrationStatus,
        }),
      });
      toast.success('Maça başarıyla kayıt oldun!');
      setMatch(null);
    } catch (error) {
      toast.error('Kayıt sırasında bir hata oluştu.');
    } finally {
      setIsRegistering(false);
    }
  };
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Maç Ara ve Katıl</h1>
        <p className="text-muted-foreground">Koçundan aldığın maç kodunu girerek maça katıl.</p>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Maç Kodu ile Ara</CardTitle>
          <CardDescription>4 Rakam ve 2 Harften oluşan kodu girin.</CardDescription>
        </CardHeader>
        <CardContent>
          {!match ? (
            <form onSubmit={handleSearch} className="flex items-start space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="match-code" className="sr-only">Maç Kodu</Label>
                <Input id="match-code" placeholder="Örn: 1234AB" disabled={isLoading} />
              </div>
              <Button type="submit" className="px-6" disabled={isLoading}>
                {isLoading ? 'Aranıyor...' : 'Ara'}
              </Button>
            </form>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <Card>
                <CardHeader><CardTitle>Maç Bilgileri</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Tarih:</strong> {match.date}, {match.time}</p>
                  <p><strong>Saha:</strong> {match.field?.name || 'Bilinmiyor'}</p>
                  <p><strong>Koç:</strong> {match.coach?.username || 'Bilinmiyor'}</p>
                  <p><strong>Durum:</strong> {match.registrations.filter(r => r.status === 'Mutlaka geleceğim').length}/{match.mainTeamSize} oyuncu kayıt oldu.</p>
                </CardContent>
              </Card>
              <div className="space-y-4">
                <Label className="text-base font-semibold">Katılım Durumunu Bildir</Label>
                <RadioGroup value={registrationStatus} onValueChange={(v) => setRegistrationStatus(v as PlayerRegistration['status'])}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Mutlaka geleceğim" id="r1" /><Label htmlFor="r1">Mutlaka geleceğim</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Belki gelirim" id="r2" /><Label htmlFor="r2">Belki gelirim</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Gelemem" id="r3" /><Label htmlFor="r3">Gelemem</Label></div>
                </RadioGroup>
              </div>
              <Button onClick={handleRegister} className="w-full bg-green-600 hover:bg-green-700" disabled={isRegistering}>
                {isRegistering ? 'Kaydediliyor...' : 'Maça Kayıt Ol'}
              </Button>
            </div>
          )}
          {isLoading && !match && (
            <div className="space-y-4 mt-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}