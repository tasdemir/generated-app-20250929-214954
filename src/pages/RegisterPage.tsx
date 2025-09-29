import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { api } from '@/lib/api-client';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i - 16));
const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const registerSchema = z.object({
  username: z.string().min(3, 'Kullanıcı adı en az 3 karakter olmalı').regex(/^[a-z0-9_]+$/, 'Sadece küçük harf, rakam ve alt çizgi kullanabilirsiniz.'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
  phone: z.string().min(10, 'Geçerli bir telefon numarası girin'),
  birthDay: z.string({ required_error: "Gün zorunludur." }).min(1, 'Gün zorunludur'),
  birthMonth: z.string({ required_error: "Ay zorunludur." }).min(1, 'Ay zorunludur'),
  birthYear: z.string({ required_error: "Yıl zorunludur." }).min(1, 'Yıl zorunludur'),
  favoriteTeam: z.string().min(1, 'Takım seçimi zorunludur'),
  city: z.enum(['Istanbul', 'Ankara'], { required_error: "İl seçimi zorunludur." }),
  district: z.enum(['Besiktas', 'Kadikoy', 'Ulus', 'Cankaya'], { required_error: "İlçe seçimi zorunludur." }),
});
type RegisterFormData = z.infer<typeof registerSchema>;
export function RegisterPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      phone: '',
      favoriteTeam: '',
      birthDay: undefined,
      birthMonth: undefined,
      birthYear: undefined,
      city: undefined,
      district: undefined,
    },
  });
  const city = form.watch('city');
  useEffect(() => {
    if (city) {
      form.resetField('district');
    }
  }, [city, form]);
  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const birthDate = `${data.birthYear}-${data.birthMonth}-${data.birthDay}`;
      const { birthDay, birthMonth, birthYear, ...rest } = data;
      await api('/api/register', {
        method: 'POST',
        body: JSON.stringify({ ...rest, birthDate }),
      });
      setShowSuccessDialog(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bir hata oluştu.';
      const { toast } = await import('sonner');
      toast.error('Kayıt Başarısız!', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4">
        <Card className="mx-auto max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Oyuncu Kayıt</CardTitle>
            <CardDescription>Hesap oluşturmak için bilgilerinizi girin</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField control={form.control} name="username" render={({ field }) => (
                    <FormItem><FormLabel>Kullanıcı Adı</FormLabel><FormControl><Input placeholder="ornek_kullanici" {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                />
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Şifre</FormLabel><FormControl><Input type="password" placeholder="••••••" {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                />
                <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Cep Telefonu</FormLabel><FormControl><Input type="tel" placeholder="555-123-4567" {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Doğum Tarihi</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    <FormField control={form.control} name="birthDay" render={({ field }) => (
                        <FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Gün" /></SelectTrigger></FormControl><SelectContent>{days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                      )}
                    />
                    <FormField control={form.control} name="birthMonth" render={({ field }) => (
                        <FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Ay" /></SelectTrigger></FormControl><SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                      )}
                    />
                    <FormField control={form.control} name="birthYear" render={({ field }) => (
                        <FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Yıl" /></SelectTrigger></FormControl><SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                      )}
                    />
                  </div>
                </FormItem>
                <FormField control={form.control} name="favoriteTeam" render={({ field }) => (
                    <FormItem><FormLabel>Tuttuğu Takım</FormLabel><FormControl><Input placeholder="Örn: Beşiktaş" {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                />
                <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem><FormLabel>İl</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="İl seçin" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Istanbul">İstanbul</SelectItem><SelectItem value="Ankara">Ankara</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )}
                />
                {city && (
                  <FormField control={form.control} name="district" render={({ field }) => (
                      <FormItem><FormLabel>İlçe</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="İlçe seçin" /></SelectTrigger></FormControl><SelectContent>{city === 'Istanbul' ? (<><SelectItem value="Besiktas">Beşiktaş</SelectItem><SelectItem value="Kadikoy">Kadıköy</SelectItem></>) : (<><SelectItem value="Ulus">Ulus</SelectItem><SelectItem value="Cankaya">Çankaya</SelectItem></>)}</SelectContent></Select><FormMessage /></FormItem>
                    )}
                  />
                )}
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                  {isSubmitting ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur'}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              Zaten hesabın var mı?{' '}
              <Link to="/" className="underline">Giriş yap</Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kayıt Başarılı!</AlertDialogTitle>
            <AlertDialogDescription>
              Hesabınız başarıyla oluşturuldu. ��imdi giriş yapabilirsiniz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => navigate('/')}>Giriş Yap</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}