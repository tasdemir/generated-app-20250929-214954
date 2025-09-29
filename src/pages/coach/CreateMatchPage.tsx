import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Field, Match } from '@shared/types';
import { useAuthStore } from '@/stores/auth-store';
const matchSchema = z.object({
  day: z.string().min(1, 'Gün seçimi zorunludur'),
  month: z.string().min(1, 'Ay seçimi zorunludur'),
  time: z.string().min(1, 'Maç saati zorunludur'),
  mainTeamSize: z.number().min(5).max(8),
  fieldSelectionType: z.enum(['existing', 'custom']),
  fieldId: z.string().optional(),
  customFieldName: z.string().optional(),
}).refine(data => {
  if (data.fieldSelectionType === 'existing') return !!data.fieldId;
  if (data.fieldSelectionType === 'custom') return !!data.customFieldName && data.customFieldName.length >= 3;
  return false;
}, {
  message: 'Lütfen geçerli bir saha seçin veya yeni saha adı girin (en az 3 karakter).',
  path: ['fieldId'],
});
type MatchFormData = z.infer<typeof matchSchema>;
const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
export function CreateMatchPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const form = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      time: '',
      mainTeamSize: 7,
      fieldSelectionType: 'existing',
    },
  });
  const fieldSelectionType = form.watch('fieldSelectionType');
  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoading(true);
        const data = await api<{ items: Field[] }>('/api/fields');
        setFields(data.items);
      } catch (error) {
        toast.error('Sahalar getirilirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchFields();
  }, []);
  const onSubmit = async (data: MatchFormData) => {
    if (!user) {
      toast.error('Maç oluşturmak için giriş yapmalısınız.');
      return;
    }
    try {
      const newMatchData = {
        date: `${data.day} ${data.month}`,
        time: data.time,
        mainTeamSize: data.mainTeamSize,
        coachId: user.id,
        fieldId: data.fieldSelectionType === 'custom' ? 'CUSTOM' : data.fieldId,
        customFieldName: data.fieldSelectionType === 'custom' ? data.customFieldName : undefined,
      };
      const newMatch = await api<Match>('/api/matches', {
        method: 'POST',
        body: JSON.stringify(newMatchData),
      });
      toast.success('Maç Başarıyla Oluşturuldu!', {
        description: `Maç Kodu: ${newMatch.shortCode}. Bu kodu oyuncularla paylaşın.`,
        duration: 10000,
      });
      form.reset();
    } catch (error) {
      toast.error('Maç oluşturulurken bir hata oluştu.');
    }
  };
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Yeni Maç Oluştur</h1>
        <p className="text-muted-foreground">Maç detaylarını girerek yeni bir etkinlik oluşturun.</p>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Maç Detayları</CardTitle>
          <CardDescription>Maç için gerekli bilgileri doldurun.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField control={form.control} name="day" render={({ field }) => (
                  <FormItem><FormLabel>Gün</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Gün" /></SelectTrigger></FormControl>
                      <SelectContent>{days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="month" render={({ field }) => (
                  <FormItem><FormLabel>Ay</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Ay" /></SelectTrigger></FormControl>
                      <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="time" render={({ field }) => (
                  <FormItem><FormLabel>Maç Saati</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="fieldSelectionType" render={({ field }) => (
                <FormItem className="space-y-3"><FormLabel>Halı Saha Seçimi</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4">
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="existing" /></FormControl><FormLabel className="font-normal">Mevcut Sahalardan Seç</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="custom" /></FormControl><FormLabel className="font-normal">Yeni Saha Ekle</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl><FormMessage />
                </FormItem>
              )} />
              {fieldSelectionType === 'existing' ? (
                <FormField control={form.control} name="fieldId" render={({ field }) => (
                  <FormItem><FormLabel>Halı Saha</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                      <FormControl><SelectTrigger><SelectValue placeholder={loading ? "Sahalar yükleniyor..." : "Saha seçin"} /></SelectTrigger></FormControl>
                      <SelectContent>{loading ? <SelectItem value="loading" disabled>Yükleniyor...</SelectItem> : fields.map(f => <SelectItem key={f.id} value={f.id}>{f.name} ({f.district})</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
              ) : (
                <FormField control={form.control} name="customFieldName" render={({ field }) => (
                  <FormItem><FormLabel>Yeni Saha Adı</FormLabel><FormControl><Input placeholder="Örn: Dostluk Halı Saha" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              )}
              <FormField control={form.control} name="mainTeamSize" render={({ field }) => (
                <FormItem><FormLabel>Ana Takım Oyuncu Sayısı</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value, 10))} defaultValue={String(field.value)}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Oyuncu sayısı seçin" /></SelectTrigger></FormControl>
                    <SelectContent>{[5, 6, 7, 8].map(size => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Yedekler sınırsızdır.</p><FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Oluşturuluyor...' : 'Maç Oluştur ve Kod Al'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}