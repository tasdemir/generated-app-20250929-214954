import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Match, Field, User } from '@shared/types';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
type EnrichedMatch = Omit<Match, 'registrations'> & { field: Field | null; coach: Partial<User> | null; registrations: (Match['registrations'][0] & { username: string })[] };
type PlayerUpdate = { playerId: string; tags: string[] };
const performanceTags = ['En çok koşan', 'En çok gol kurtaran', 'En çok pas veren', 'Maçın Oyuncusu'];
export function ScoreMatchPage() {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const [match, setMatch] = useState<EnrichedMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<Match['result']>();
  const [playerUpdates, setPlayerUpdates] = useState<PlayerUpdate[]>([]);
  useEffect(() => {
    if (!matchId) {
      toast.error("Maç ID'si bulunamadı.");
      navigate('/app/matches');
      return;
    }
    const fetchMatchDetails = async () => {
      try {
        setLoading(true);
        const data = await api<EnrichedMatch>(`/api/matches/${matchId}`);
        setMatch(data);
        setPlayerUpdates(
          [...data.teamA, ...data.teamB].map(playerId => ({ playerId, tags: [] }))
        );
      } catch (error) {
        toast.error('Maç detayları getirilirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchMatchDetails();
  }, [matchId, navigate]);
  const handleTagChange = (playerId: string, tag: string, checked: boolean) => {
    setPlayerUpdates(prev => prev.map(p => {
      if (p.playerId === playerId) {
        const newTags = checked ? [...p.tags, tag] : p.tags.filter(t => t !== tag);
        return { ...p, tags: newTags };
      }
      return p;
    }));
  };
  const handleSubmitScore = async () => {
    if (!result) {
      toast.error('Lütfen maç sonucunu seçin.');
      return;
    }
    try {
      await api(`/api/matches/${matchId}/score`, {
        method: 'POST',
        body: JSON.stringify({ result, playerUpdates }),
      });
      toast.success('Maç başarıyla puanlandı!', {
        description: 'Geçmiş maçlar sayfasına yönlendiriliyorsunuz.',
      });
      navigate('/app/past-matches');
    } catch (error) {
      toast.error('Puanlama sırasında bir hata oluştu.');
    }
  };
  if (loading) return <Skeleton className="h-96 w-full" />;
  if (!match) return <p>Maç bulunamadı.</p>;
  const allPlayers = [...match.teamA, ...match.teamB];
  const getPlayerUsername = (playerId: string) => {
    return (match.registrations.find(r => r.playerId === playerId) as (Match['registrations'][0] & { username: string }) | undefined)?.username || playerId;
  };
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maçı Puanla: {match.shortCode}</h1>
          <p className="text-muted-foreground">Maç sonucunu girin ve oyunculara etiketler atayın.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Maç Sonucu</CardTitle>
          <CardDescription>Kazanan takımı seçin veya berabere bitti olarak işaretleyin.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={(value) => setResult(value as Match['result'])}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Sonuç seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Team A Win">A Takımı Kazandı</SelectItem>
              <SelectItem value="Team B Win">B Takımı Kazandı</SelectItem>
              <SelectItem value="Draw">Berabere</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Oyuncu Performansları</CardTitle>
          <CardDescription>Oyunculara performans etiketleri atayın.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Oyuncu</TableHead><TableHead>Takım</TableHead><TableHead>Etiketler</TableHead></TableRow></TableHeader>
            <TableBody>
              {allPlayers.map(playerId => (
                <TableRow key={playerId}>
                  <TableCell className="font-medium">{getPlayerUsername(playerId)}</TableCell>
                  <TableCell>
                    <Badge variant={match.teamA.includes(playerId) ? 'default' : 'secondary'}>
                      {match.teamA.includes(playerId) ? 'Takım A' : 'Takım B'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-4">
                      {performanceTags.map(tag => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${playerId}-${tag}`}
                            onCheckedChange={(checked) => handleTagChange(playerId, tag, !!checked)}
                          />
                          <label htmlFor={`${playerId}-${tag}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {tag}
                          </label>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={handleSubmitScore}>
          Puanlamayı Tamamla ve Maçı Bitir
        </Button>
      </div>
    </div>
  );
}