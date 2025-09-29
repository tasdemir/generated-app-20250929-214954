import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Match, Field, User } from '@shared/types';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth-store';
import { EmptyState } from '@/components/EmptyState';
import { History } from 'lucide-react';
export function PastMatchesPage() {
  const { user } = useAuthStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [fields, setFields] = useState<Record<string, Field>>({});
  const [coaches, setCoaches] = useState<Record<string, Partial<User>>>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [matchesData, fieldsData, usersData] = await Promise.all([
          api<{ items: Match[] }>('/api/matches'),
          api<{ items: Field[] }>('/api/fields'),
          api<{ items: User[] }>('/api/users'),
        ]);
        setMatches(matchesData.items.filter(m => m.status === 'completed'));
        setFields(fieldsData.items.reduce((acc, field) => {
          acc[field.id] = field;
          return acc;
        }, {} as Record<string, Field>));
        setCoaches(usersData.items.reduce((acc, u) => {
          acc[u.id] = u;
          return acc;
        }, {} as Record<string, User>));
      } catch (error) {
        toast.error('Geçmiş maçlar getirilirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const getMatchResultForPlayer = (match: Match) => {
    if (!user || !match.result) return { text: 'Sonuç Yok', points: 0, variant: 'secondary' as const, className: '' };
    const isTeamA = match.teamA.includes(user.id);
    const isTeamB = match.teamB.includes(user.id);
    if (match.result === 'Draw') return { text: 'Beraberlik', points: 2, variant: 'outline' as const, className: '' };
    if ((match.result === 'Team A Win' && isTeamA) || (match.result === 'Team B Win' && isTeamB)) {
      return { text: 'Galibiyet', points: 3, variant: 'default' as const, className: 'bg-green-600' };
    }
    if ((match.result === 'Team A Win' && isTeamB) || (match.result === 'Team B Win' && isTeamA)) {
      return { text: 'Mağlubiyet', points: 1, variant: 'destructive' as const, className: '' };
    }
    return { text: 'Oynamadı', points: 0, variant: 'secondary' as const, className: '' };
  };
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Geçmiş Maçlar</h1>
        <p className="text-muted-foreground">Tamamlanan maçların ve sonuçların.</p>
      </div>
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2 mt-2" /></CardHeader>
              <CardContent><Skeleton className="h-4 w-1/3" /><Skeleton className="h-4 w-1/4 mt-2" /></CardContent>
              <CardFooter><Skeleton className="h-4 w-1/2" /></CardFooter>
            </Card>
          ))}
        </div>
      ) : matches.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {matches.map(match => {
            const result = getMatchResultForPlayer(match);
            return (
              <Card key={match.id}>
                <CardHeader>
                  <CardTitle>{fields[match.fieldId]?.name || 'Bilinmeyen Saha'}</CardTitle>
                  <CardDescription>{match.date} - {match.time}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Sonuç: <Badge variant={result.variant} className={result.className}>{result.text}</Badge></p>
                  <p className="text-sm mt-2">Kazanılan Puan: <span className="font-bold">{result.points} Puan</span></p>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">Koç: {coaches[match.coachId]?.username || 'Bilinmeyen Koç'}</p>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={History}
              title="Geçmiş Maç Bulunmuyor"
              description="Henüz tamamlanmış bir maçın yok."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}