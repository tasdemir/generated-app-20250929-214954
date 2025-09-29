import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Match, Field, User } from '@shared/types';
import { ArrowLeft, Users, Calendar, Clock, Shield, CheckCircle, ArrowUpCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
type EnrichedMatch = Omit<Match, 'registrations'> & { field: Field | null; coach: Partial<User> | null; registrations: (Match['registrations'][0] & { username: string })[] };
export function MatchDetailPage() {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const [match, setMatch] = useState<EnrichedMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchMatchDetails = useCallback(async () => {
    if (!matchId) return;
    try {
      setLoading(true);
      const data = await api<EnrichedMatch>(`/api/matches/${matchId}`);
      setMatch(data);
    } catch (error) {
      toast.error('Maç detayları getirilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [matchId]);
  useEffect(() => {
    if (!matchId) {
      toast.error("Maç ID'si bulunamadı.");
      navigate('/app/matches');
      return;
    }
    fetchMatchDetails();
  }, [matchId, navigate, fetchMatchDetails]);
  const handleAssignment = async (playerId: string, team: 'A' | 'B' | 'none') => {
    if (!matchId) return;
    try {
      const updatedMatch = await api<Match>(`/api/matches/${matchId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ playerId, team }),
      });
      // Optimistically update UI and then refetch for consistency
      setMatch(prev => {
        if (!prev) return null;
        const newTeamA = prev.teamA.filter(id => id !== playerId);
        const newTeamB = prev.teamB.filter(id => id !== playerId);
        if (team === 'A') newTeamA.push(playerId);
        if (team === 'B') newTeamB.push(playerId);
        return { ...prev, teamA: newTeamA, teamB: newTeamB };
      });
      toast.success('Takım ataması güncellendi.');
      await fetchMatchDetails(); // Refetch to get the most accurate state
    } catch (error) {
      toast.error('Takım ataması güncellenirken bir hata oluştu.');
    }
  };
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-80 mt-2" /></div>
        </div>
        <Card><CardHeader><Skeleton className="h-6 w-48" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
        <div className="grid gap-8 md:grid-cols-2">
          <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-24" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }
  if (!match) return <p>Maç bulunamadı.</p>;
  type EnrichedRegistration = EnrichedMatch['registrations'][0];
  const mainSquadPlayers: EnrichedRegistration[] = match.registrations
    .filter(r => r.status === 'Mutlaka geleceğim' && !match.teamA.includes(r.playerId) && !match.teamB.includes(r.playerId))
    .sort((a, b) => new Date(a.registrationTime).getTime() - new Date(b.registrationTime).getTime());
  const teamAPlayers: EnrichedRegistration[] = match.registrations.filter(r => match.teamA.includes(r.playerId));
  const teamBPlayers: EnrichedRegistration[] = match.registrations.filter(r => match.teamB.includes(r.playerId));
  const mainSquad: EnrichedRegistration[] = [...teamAPlayers, ...teamBPlayers, ...mainSquadPlayers].slice(0, match.mainTeamSize);
  const substitutes: EnrichedRegistration[] = [...teamAPlayers, ...teamBPlayers, ...mainSquadPlayers].slice(match.mainTeamSize);
  const getPlayerTeam = (playerId: string) => {
    if (match.teamA.includes(playerId)) return 'A';
    if (match.teamB.includes(playerId)) return 'B';
    return 'none';
  };
  const isSquadFull = mainSquad.length >= match.mainTeamSize;
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Maç Detayı: {match.shortCode}</h1>
            <p className="text-muted-foreground">Kayıt olan oyuncuları yönetin ve takımları oluşturun.</p>
          </div>
        </div>
        {match.status === 'upcoming' && (
          <Button onClick={() => navigate(`/app/coach/score-match/${match.id}`)} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="mr-2 h-4 w-4" />
            Maçı Puanla
          </Button>
        )}
      </div>
      <Card>
        <CardHeader><CardTitle>Maç Bilgileri</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /> <strong>Tarih:</strong> {match.date}</div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> <strong>Saat:</strong> {match.time}</div>
          <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-muted-foreground" /> <strong>Saha:</strong> {match.field?.name || 'Bilinmiyor'}</div>
          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /> <strong>Kadro:</strong> {match.mainTeamSize} Kişi</div>
        </CardContent>
      </Card>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Ana Kadro ({mainSquad.length}/{match.mainTeamSize})</CardTitle>
              <div className="flex gap-2 text-xs">
                <Badge variant="default">A Takımı: {match.teamA.length}</Badge>
                <Badge variant="secondary">B Takımı: {match.teamB.length}</Badge>
              </div>
            </div>
            <CardDescription>Maça kesin geleceğini bildiren oyuncular.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Oyuncu</TableHead><TableHead>Takım</TableHead><TableHead>Takım Ata</TableHead></TableRow></TableHeader>
              <TableBody>
                {mainSquad.map(reg => {
                  const team = getPlayerTeam(reg.playerId);
                  return (
                    <TableRow key={reg.playerId}>
                      <TableCell className="font-medium">{reg.username}</TableCell>
                      <TableCell>
                        {team === 'A' && <Badge variant="default">A Takımı</Badge>}
                        {team === 'B' && <Badge variant="secondary">B Takımı</Badge>}
                        {team === 'none' && <Badge variant="outline">Atanmadı</Badge>}
                      </TableCell>
                      <TableCell>
                        <Select value={team} onValueChange={(value) => handleAssignment(reg.playerId, value as 'A' | 'B' | 'none')}>
                          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Seçim yap" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A Takımı</SelectItem>
                            <SelectItem value="B">B Takımı</SelectItem>
                            <SelectItem value="none">Kadro Dışı Bırak</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Yedekler ({substitutes.length})</CardTitle>
            <CardDescription>Ana kadro dolduktan sonraki oyuncular.</CardDescription>
          </CardHeader>
          <CardContent>
            {substitutes.length > 0 ? (
              <Table>
                <TableHeader><TableRow><TableHead>Oyuncu</TableHead><TableHead>Aksiyon</TableHead></TableRow></TableHeader>
                <TableBody>
                  {substitutes.map(reg => (
                    <TableRow key={reg.playerId}>
                      <TableCell className="font-medium">{reg.username}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isSquadFull}
                          onClick={() => handleAssignment(reg.playerId, 'A')}
                        >
                          <ArrowUpCircle className="mr-2 h-4 w-4" />
                          Kadroya Al
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (<p className="text-sm text-muted-foreground">Yedek oyuncu bulunmuyor.</p>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}