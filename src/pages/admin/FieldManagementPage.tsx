import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Field } from '@shared/types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ShieldOff } from 'lucide-react';
const fieldSchema = z.object({
  name: z.string().min(3, 'Saha adı en az 3 karakter olmalı'),
  city: z.enum(['Istanbul', 'Ankara']),
  district: z.enum(['Besiktas', 'Kadikoy', 'Ulus', 'Cankaya']),
});
type FieldFormData = z.infer<typeof fieldSchema>;
export function FieldManagementPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const form = useForm<FieldFormData>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: '',
    }
  });
  const city = form.watch('city');
  useEffect(() => {
    form.resetField('district');
  }, [city, form]);
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
  useEffect(() => {
    fetchFields();
  }, []);
  const onSubmit = async (data: FieldFormData) => {
    try {
      const newField = await api<Field>('/api/fields', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setFields(prev => [...prev, newField]);
      toast.success('Yeni saha başarıyla eklendi!');
      form.reset({ name: '', city: undefined, district: undefined });
    } catch (error) {
      toast.error('Saha eklenirken bir hata oluştu.');
    }
  };
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Saha Yönetimi</h1>
        <p className="text-muted-foreground">Sisteme yeni halı sahalar ekleyin ve mevcutları yönetin.</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Yeni Saha Ekle</CardTitle>
            <CardDescription>Yeni bir halı saha eklemek için formu doldurun.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Saha Adı</FormLabel><FormControl><Input placeholder="Örn: Şampiyon Halı Saha" {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                />
                <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem><FormLabel>İl</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="İl seçin" /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="Istanbul">İstanbul</SelectItem><SelectItem value="Ankara">Ankara</SelectItem></SelectContent>
                      </Select><FormMessage />
                    </FormItem>
                  )}
                />
                {city && (
                  <FormField control={form.control} name="district" render={({ field }) => (
                      <FormItem><FormLabel>İlçe</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="İlçe seçin" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {city === 'Istanbul' ? (<><SelectItem value="Besiktas">Beşiktaş</SelectItem><SelectItem value="Kadikoy">Kadıköy</SelectItem></>) : (<><SelectItem value="Ulus">Ulus</SelectItem><SelectItem value="Cankaya">Çankaya</SelectItem></>)}
                          </SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Saha Ekle</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mevcut Sahalar</CardTitle>
            <CardDescription>Sistemde kay��tlı halı sahalar.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Saha Adı</TableHead><TableHead>Şehir</TableHead><TableHead>İlçe</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}><TableCell><Skeleton className="h-4 w-[150px]" /></TableCell><TableCell><Skeleton className="h-4 w-[80px]" /></TableCell><TableCell><Skeleton className="h-4 w-[80px]" /></TableCell></TableRow>
                  ))
                ) : fields.length > 0 ? (
                  fields.map((field) => (
                    <TableRow key={field.id}><TableCell className="font-medium">{field.name}</TableCell><TableCell>{field.city}</TableCell><TableCell>{field.district}</TableCell></TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <EmptyState
                        icon={ShieldOff}
                        title="Henüz Saha Eklenmemiş"
                        description="Yeni bir saha ekleyerek başlayabilirsiniz."
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}