import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { api } from '@/lib/api-client';
import { User } from '@shared/types';
import { BarChart3, Swords, Trophy, Handshake, ShieldX } from 'lucide-react';
const profileSchema = z.object({
  phone: z.string().min(10, 'Geçerli bir telefon numarası girin'),
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Geçerli bir tarih girin'),
  favoriteTeam: z.string().min(1, 'Takım seçimi zorunludur'),
  height: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number().int().positive('Geçerli bir boy girin (cm)').optional()
  ),
  weight: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number().int().positive('Geçerli bir kilo girin (kg)').optional()
  ),
});
type ProfileFormData = z.infer<typeof profileSchema>;
export function ProfilePage() {
  const { user, setUser } = useAuthStore();
  // Explicitly typing useForm with <ProfileFormData> fixes all TypeScript errors.
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phone: user?.phone || '',
      birthDate: user?.birthDate ? user.birthDate.split('T')[0] : '',
      favoriteTeam: user?.favoriteTeam || '',
      height: user?.height ?? undefined,
      weight: user?.weight ?? undefined,
    },
  });
  const handleUpdateProfile = async (data: ProfileFormData) => {
    if (!user) return;
    try {
      const payload = {
        ...data,
        id: user.id,
        height: data.height ? Number(data.height) : undefined,
        weight: data.weight ? Number(data.weight) : undefined,
      };
      const updatedUser = await api<User>('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setUser(updatedUser);
      toast.success('Profil bilgilerin güncellendi!');
    } catch (error) {
      toast.error('Profil güncellenirken bir hata oluştu.');
    }
  };
  if (!user) return null;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profilim</h1>
        <p className="text-muted-foreground">Kişisel bilgilerini ve istatistiklerini görüntüle.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puan</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats.points}</div>
            <p className="text-xs text-muted-foreground">Toplam Puan��n</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oynanan Maç</CardTitle>
            <Swords className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats.matchesPlayed}</div>
            <p className="text-xs text-muted-foreground">Toplam Maç Sayısı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Galibiyet</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats.wins}</div>
            <p className="text-xs text-muted-foreground">Kazanılan Maçlar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beraberlik</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats.draws}</div>
            <p className="text-xs text-muted-foreground">Berabere Biten Maçlar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mağlubiyet</CardTitle>
            <ShieldX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats.losses}</div>
            <p className="text-xs text-muted-foreground">Kaybedilen Maçlar</p>
          </CardContent>
        </Card>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Kullanıcı Bilgileri</CardTitle>
          <CardDescription>Bilgilerini güncel tutarak maçlara daha kolay katıl.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateProfile)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Kullanıcı Adı</Label>
                <Input id="username" defaultValue={user.username} disabled />
              </div>
              <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Cep Telefonu</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}
              />
              <FormField control={form.control} name="birthDate" render={({ field }) => (
                  <FormItem><FormLabel>Doğum Tarihi</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )}
              />
              <FormField control={form.control} name="favoriteTeam" render={({ field }) => (
                  <FormItem><FormLabel>Tuttuğu Takım</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="height" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Boy (cm)</FormLabel>
                      <FormControl><Input type="number" placeholder="180" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kilo (kg)</FormLabel>
                      <FormControl><Input type="number" placeholder="75" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Konum</Label>
                <Input value={`${user.city} / ${user.district}`} disabled />
              </div>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Güncelleniyor...' : 'Bilgileri Güncelle'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}