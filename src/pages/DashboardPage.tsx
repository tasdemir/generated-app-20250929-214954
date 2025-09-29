import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, BarChart3, FilePlus, Search, CalendarClock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { User, Field, Match } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ userCount: 0, fieldCount: 0, topPlayer: 'N/A' });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await api<{ items: User[] }>('/api/users');
        const fieldsData = await api<{ items: Field[] }>('/api/fields');
        const topPlayer = usersData.items.length > 0 ? [...usersData.items].sort((a, b) => b.stats.points - a.stats.points)[0].username : 'N/A';
        setStats({
          userCount: usersData.items.length,
          fieldCount: fieldsData.items.length,
          topPlayer,
        });
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Kullanıcı Yönetimi</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.userCount}</div>}
          <p className="text-xs text-muted-foreground">Toplam kayıtlı kullanıcı</p>
          <Button className="mt-4" size="sm" onClick={() => navigate('/app/admin/users')}>Kullanıcıları Yönet</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saha Yönetimi</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.fieldCount}</div>}
          <p className="text-xs text-muted-foreground">Kayıtlı halı saha</p>
          <Button className="mt-4" size="sm" onClick={() => navigate('/app/admin/fields')}>Sahaları Yönet</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Skorboard Lideri</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats.topPlayer}</div>}
          <p className="text-xs text-muted-foreground">En yüksek puanlı oyuncu</p>
          <Button className="mt-4" size="sm" onClick={() => navigate('/app/scoreboard')}>Skorboard'a Git</Button>
        </CardContent>
      </Card>
    </div>
  );
};
const CoachDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [matchCount, setMatchCount] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) return;
      try {
        const data = await api<{ items: Match[] }>('/api/matches');
        const coachMatches = data.items.filter(m => m.coachId === user.id && m.status === 'upcoming');
        setMatchCount(coachMatches.length);
      } catch (error) {
        console.error("Failed to fetch coach matches", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [user]);
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Yeni Maç Oluştur</CardTitle>
          <FilePlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Yeni bir maç organize et ve oyuncuları davet et.</p>
          <Button className="mt-4" size="sm" onClick={() => navigate('/app/coach/create-match')}>Maç Oluştur</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Yaklaşan Maçların</CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{matchCount}</div>}
          <p className="text-xs text-muted-foreground">Yönettiğin yaklaşan maç</p>
          <Button className="mt-4" size="sm" onClick={() => navigate('/app/matches')}>Maçlarımı Görünt��le</Button>
        </CardContent>
      </Card>
    </div>
  );
};
const PlayerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Maç Ara</CardTitle>
          <Search className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Maç kodunu girerek yeni bir maça katıl.</p>
          <Button className="mt-4" size="sm" onClick={() => navigate('/app/player/search-match')}>Maç Bul</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Puanın</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{user?.stats.points || 0} Puan</div>
          <p className="text-xs text-muted-foreground">Toplam {user?.stats.matchesPlayed || 0} maç oynadın.</p>
          <Button className="mt-4" size="sm" onClick={() => navigate('/app/scoreboard')}>Skorboard'u Görüntüle</Button>
        </CardContent>
      </Card>
    </div>
  );
};
export function DashboardPage() {
  const { user } = useAuthStore();
  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'coach':
        return <CoachDashboard />;
      case 'player':
        return <PlayerDashboard />;
      default:
        return <p>Rolünüz belirlenemedi.</p>;
    }
  };
  return (
    <div className="flex flex-col space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Hoşgeldin, {user?.username}!</h1>
        <p className="text-muted-foreground">
          İ��te senin için hazırladığımız kontrol paneli.
        </p>
      </div>
      {renderDashboard()}
    </div>
  );
}