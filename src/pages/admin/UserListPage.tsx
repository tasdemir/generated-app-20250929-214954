import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from '@shared/types';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { Users } from 'lucide-react';
export function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api<{ items: User[] }>('/api/users');
      // Filter out the seed admin user from the main list
      setUsers(data.items.filter(u => u.username !== 'tasdemir'));
    } catch (error) {
      toast.error('Kullanıcılar getirilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  const handlePromote = async (user: User) => {
    try {
      await api(`/api/users/${user.id}/promote`, { method: 'PUT' });
      toast.success(`${user.username} başarıyla Koç rolüne yükseltildi!`);
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id ? { ...u, role: 'coach' } : u
        )
      );
    } catch (error) {
      toast.error('Kullanıcı rolü güncellenirken bir hata oluştu.');
    }
  };
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kullanıcı Listesi</h1>
        <p className="text-muted-foreground">Sistemdeki tüm kullanıcıları yönetin.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tüm Kullanıcılar</CardTitle>
          <CardDescription>Oyuncuları koç rolüne yükseltebilirsiniz.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı Adı</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Şehir</TableHead>
                <TableHead>İlçe</TableHead>
                <TableHead>Aksiyon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-[80px]" /></TableCell>
                  </TableRow>
                ))
              ) : users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'coach' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.city}</TableCell>
                    <TableCell>{user.district}</TableCell>
                    <TableCell>
                      {user.role === 'player' && (
                        <Button size="sm" onClick={() => handlePromote(user)}>
                          Koç Yap
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState
                      icon={Users}
                      title="Kayıtlı Kullanıcı Bulunmuyor"
                      description="Sisteme henüz admin dışında bir kullanıcı kayıt olmamış."
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}