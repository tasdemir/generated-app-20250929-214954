import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@shared/types';
import { Badge } from '@/components/ui/badge';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
const getInitials = (name: string) => name.substring(0, 2).toUpperCase();
const districtOptions = {
  Istanbul: ['Besiktas', 'Kadikoy'],
  Ankara: ['Ulus', 'Cankaya'],
};
export function ScoreboardPage() {
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await api<{ items: User[] }>('/api/users');
        setPlayers(data.items);
      } catch (error) {
        toast.error('Oyuncu verileri getirilirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);
  const filteredAndSortedPlayers = useMemo(() => {
    return players
      .filter(player => {
        if (cityFilter !== 'all' && player.city !== cityFilter) {
          return false;
        }
        if (districtFilter !== 'all' && player.district !== districtFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.stats.points - a.stats.points);
  }, [players, cityFilter, districtFilter]);
  const handleCityChange = (city: string) => {
    setCityFilter(city);
    setDistrictFilter('all'); // Reset district filter when city changes
  };
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skorboard</h1>
        <p className="text-muted-foreground">Oyuncu sıralamalarını ve istatistiklerini görüntüle.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Oyuncu Sıralaması</CardTitle>
          <CardDescription>En çok puandan en düşüğe doğru sıralanmıştır.</CardDescription>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
            <Select value={cityFilter} onValueChange={handleCityChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="İle Göre Filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm İller</SelectItem>
                <SelectItem value="Istanbul">İstanbul</SelectItem>
                <SelectItem value="Ankara">Ankara</SelectItem>
              </SelectContent>
            </Select>
            <Select value={districtFilter} onValueChange={setDistrictFilter} disabled={cityFilter === 'all'}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="İlçeye Göre Filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm İlçeler</SelectItem>
                {cityFilter === 'Istanbul' && districtOptions.Istanbul.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                {cityFilter === 'Ankara' && districtOptions.Ankara.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] text-center">Sıra</TableHead>
                  <TableHead>Oyuncu</TableHead>
                  <TableHead className="text-center">Puan</TableHead>
                  <TableHead className="text-center">Oynanan Maç</TableHead>
                  <TableHead className="text-center">G/B/M</TableHead>
                  <TableHead>Etiketler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-6 mx-auto" /></TableCell>
                      <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-4 w-24" /></div></TableCell>
                      <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredAndSortedPlayers.map((player, index) => (
                    <TableRow key={player.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-bold text-xl text-muted-foreground text-center">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/8.x/bottts/svg?seed=${player.username}`} />
                            <AvatarFallback>{getInitials(player.username)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{player.username}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-center text-lg text-kadro-green">{player.stats.points}</TableCell>
                      <TableCell className="text-center text-muted-foreground">{player.stats.matchesPlayed}</TableCell>
                      <TableCell className="text-center text-muted-foreground">{`${player.stats.wins}/${player.stats.draws}/${player.stats.losses}`}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {player.stats.tags.slice(0, 2).map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}