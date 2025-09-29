import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Match, Field, User } from '@shared/types';
import { useAuthStore } from '@/stores/auth-store';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { EmptyState } from '@/components/EmptyState';
import { ListX } from 'lucide-react';
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};
export function MatchListPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
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
        setMatches(matchesData.items.filter(m => m.status === 'upcoming'));
        setFields(fieldsData.items.reduce((acc, field) => {
          acc[field.id] = field;
          return acc;
        }, {} as Record<string, Field>));
        setCoaches(usersData.items.reduce((acc, u) => {
          acc[u.id] = u;
          return acc;
        }, {} as Record<string, User>));
      } catch (error) {
        toast.error('Veriler getirilirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const getPageTitle = () => {
    switch (user?.role) {
      case 'admin': return 'Tüm Maçlar';
      case 'coach': return 'Yönettiğim Maçlar';
      case 'player': return 'Katıldığım Aktif Maçlar';
      default: return 'Maç Listesi';
    }
  };
  const getPageDescription = () => {
    switch (user?.role) {
      case 'admin': return 'Sistemdeki tüm yakla��an maçları görüntüleyin.';
      case 'coach': return 'Oluşturduğunuz ve yaklaşan maçların listesi.';
      case 'player': return 'Kayıt olduğunuz ve henüz oynanmamış maçlar.';
      default: return 'Yaklaşan maçlar.';
    }
  };
  const displayedMatches = matches.filter(match => {
    if (!user) return false;
    switch (user.role) {
      case 'admin':
        return true;
      case 'coach':
        return match.coachId === user.id;
      case 'player':
        return match.registrations.some(reg => reg.playerId === user.id);
      default:
        return false;
    }
  });
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{getPageTitle()}</h1>
        <p className="text-muted-foreground">{getPageDescription()}</p>
      </div>
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2 mt-2" /></CardHeader>
              <CardContent><Skeleton className="h-4 w-1/3" /><Skeleton className="h-4 w-1/4 mt-2" /></CardContent>
              <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
            </Card>
          ))}
        </div>
      ) : displayedMatches.length > 0 ? (
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {displayedMatches.map(match => (
            <motion.div key={match.id} variants={itemVariants}>
              <Card className="flex flex-col h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{fields[match.fieldId]?.name || 'Bilinmeyen Saha'}</CardTitle>
                      <CardDescription>{match.date} - {match.time}</CardDescription>
                    </div>
                    <Badge variant="secondary">{match.shortCode}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">Koç: {coaches[match.coachId]?.username || 'Bilinmeyen Koç'}</p>
                  <p className="text-sm text-muted-foreground">Kadro: {match.mainTeamSize}v{match.mainTeamSize}</p>
                </CardContent>
                <CardFooter>
                  {user?.role === 'coach' && (
                    <Button className="w-full" onClick={() => navigate(`/app/coach/match/${match.id}`)}>
                      Detayları Görüntüle
                    </Button>
                  )}
                  {user?.role === 'player' && (
                    <Button className="w-full" variant="outline" disabled>Kayıtlısın</Button>
                  )}
                  {user?.role === 'admin' && (
                    <Button className="w-full" variant="outline" onClick={() => navigate(`/app/coach/match/${match.id}`)}>
                      Maçı Gözlemle
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={ListX}
              title="Aktif Maç Bulunmuyor"
              description="Görünüşe göre gösterilecek yaklaşan bir maç yok."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}