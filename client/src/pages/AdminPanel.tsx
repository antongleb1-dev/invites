import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link, useLocation } from "wouter";
import { AuthDialog } from "@/components/AuthDialog";
import { 
  Users, FileText, Search, Eye, Calendar, Mail, Phone, 
  CreditCard, Sparkles, Shield, LayoutDashboard, ChevronLeft, 
  ChevronRight, ExternalLink, Gift, MessageCircle, UserCheck
} from "lucide-react";
import Header from "@/components/Header";

export default function AdminPanel() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  
  // Check if user is admin
  const { data: isAdmin, isLoading: adminLoading, refetch: refetchAdmin } = trpc.admin.isAdmin.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Stats
  const { data: stats } = trpc.admin.stats.useQuery(undefined, {
    enabled: isAdmin === true,
  });

  // Users tab state
  const [usersSearch, setUsersSearch] = useState("");
  const [usersPage, setUsersPage] = useState(0);
  const PAGE_SIZE = 20;

  // Invitations tab state
  const [invSearch, setInvSearch] = useState("");
  const [invPage, setInvPage] = useState(0);
  const [invEventType, setInvEventType] = useState<string>("all");
  const [invIsAI, setInvIsAI] = useState<string>("all");
  const [invIsPaid, setInvIsPaid] = useState<string>("all");

  // Selected invitation for details dialog
  const [selectedInvId, setSelectedInvId] = useState<number | null>(null);

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = trpc.admin.users.useQuery({
    search: usersSearch || undefined,
    limit: PAGE_SIZE,
    offset: usersPage * PAGE_SIZE,
  }, {
    enabled: isAdmin === true,
  });

  // Fetch invitations
  const { data: invData, isLoading: invLoading } = trpc.admin.invitations.useQuery({
    search: invSearch || undefined,
    eventType: invEventType !== "all" ? invEventType : undefined,
    isAI: invIsAI !== "all" ? invIsAI === "true" : undefined,
    isPaid: invIsPaid !== "all" ? invIsPaid === "true" : undefined,
    limit: PAGE_SIZE,
    offset: invPage * PAGE_SIZE,
  }, {
    enabled: isAdmin === true,
  });

  // Fetch invitation details
  const { data: invDetails, isLoading: invDetailsLoading } = trpc.admin.getInvitation.useQuery(
    { id: selectedInvId! },
    { enabled: selectedInvId !== null }
  );

  // Loading states
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-accent/10">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Требуется авторизация</h2>
            <p className="text-muted-foreground mb-4">Войдите в систему для доступа к админ-панели</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setAuthDialogOpen(true)}>Войти</Button>
              <Button variant="outline" onClick={() => setLocation("/")}>На главную</Button>
            </div>
          </CardContent>
        </Card>
        
        <AuthDialog 
          open={authDialogOpen} 
          onOpenChange={setAuthDialogOpen}
          onSuccess={() => {
            setAuthDialogOpen(false);
            window.location.reload();
          }}
        />
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Доступ запрещён</h2>
            <p className="text-muted-foreground mb-4">У вас нет прав администратора</p>
            <Button onClick={() => setLocation("/")}>На главную</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalUsersPages = Math.ceil((usersData?.total || 0) / PAGE_SIZE);
  const totalInvPages = Math.ceil((invData?.total || 0) / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/10">
      <Header />
      
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Админ-панель</h1>
            <p className="text-muted-foreground">Управление пользователями и приглашениями</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                  <p className="text-sm text-muted-foreground">Пользователей</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalInvitations || 0}</p>
                  <p className="text-sm text-muted-foreground">Приглашений</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.paidInvitations || 0}</p>
                  <p className="text-sm text-muted-foreground">Оплачено</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                  <Sparkles className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.aiInvitations || 0}</p>
                  <p className="text-sm text-muted-foreground">AI приглашений</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="invitations" className="gap-2">
              <FileText className="w-4 h-4" />
              Приглашения
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <CardTitle>Список пользователей</CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск по email или телефону"
                      value={usersSearch}
                      onChange={(e) => {
                        setUsersSearch(e.target.value);
                        setUsersPage(0);
                      }}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
                ) : usersData?.users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Пользователи не найдены</div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2 font-medium">ID</th>
                            <th className="text-left py-3 px-2 font-medium">Email</th>
                            <th className="text-left py-3 px-2 font-medium">Телефон</th>
                            <th className="text-left py-3 px-2 font-medium">Роль</th>
                            <th className="text-left py-3 px-2 font-medium">Регистрация</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersData?.users.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-2">{user.id}</td>
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-muted-foreground" />
                                  {user.email}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                {user.phone ? (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    {user.phone}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                              <td className="py-3 px-2">
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                  {user.role === 'admin' ? 'Админ' : 'Пользователь'}
                                </Badge>
                              </td>
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination */}
                    {totalUsersPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Всего: {usersData?.total} пользователей
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUsersPage(p => Math.max(0, p - 1))}
                            disabled={usersPage === 0}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <span className="text-sm">
                            {usersPage + 1} / {totalUsersPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUsersPage(p => Math.min(totalUsersPages - 1, p + 1))}
                            disabled={usersPage >= totalUsersPages - 1}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <CardTitle>Список приглашений</CardTitle>
                  <div className="flex flex-wrap gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Поиск по названию"
                        value={invSearch}
                        onChange={(e) => {
                          setInvSearch(e.target.value);
                          setInvPage(0);
                        }}
                        className="pl-9"
                      />
                    </div>
                    <Select value={invEventType} onValueChange={(v) => { setInvEventType(v); setInvPage(0); }}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Тип события" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все типы</SelectItem>
                        <SelectItem value="wedding">Свадьба</SelectItem>
                        <SelectItem value="birthday">День рождения</SelectItem>
                        <SelectItem value="corporate">Корпоратив</SelectItem>
                        <SelectItem value="anniversary">Юбилей</SelectItem>
                        <SelectItem value="sundettoi">Сүндет той</SelectItem>
                        <SelectItem value="other">Другое</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={invIsAI} onValueChange={(v) => { setInvIsAI(v); setInvPage(0); }}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="AI" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все</SelectItem>
                        <SelectItem value="true">AI</SelectItem>
                        <SelectItem value="false">Классика</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={invIsPaid} onValueChange={(v) => { setInvIsPaid(v); setInvPage(0); }}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Оплата" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все</SelectItem>
                        <SelectItem value="true">Оплачено</SelectItem>
                        <SelectItem value="false">Не оплачено</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {invLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
                ) : invData?.invitations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Приглашения не найдены</div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2 font-medium">ID</th>
                            <th className="text-left py-3 px-2 font-medium">Название</th>
                            <th className="text-left py-3 px-2 font-medium">Тип</th>
                            <th className="text-left py-3 px-2 font-medium">Владелец</th>
                            <th className="text-left py-3 px-2 font-medium">Статус</th>
                            <th className="text-left py-3 px-2 font-medium">Дата</th>
                            <th className="text-left py-3 px-2 font-medium">Действия</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invData?.invitations.map((inv) => (
                            <tr key={inv.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-2">{inv.id}</td>
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2">
                                  {inv.isAI && (
                                    <Badge variant="outline" className="text-purple-600 border-purple-300">
                                      <Sparkles className="w-3 h-3 mr-1" />
                                      AI
                                    </Badge>
                                  )}
                                  <span className="max-w-[200px] truncate">{inv.title}</span>
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <Badge variant="secondary">
                                  {getEventTypeLabel(inv.eventType)}
                                </Badge>
                              </td>
                              <td className="py-3 px-2">
                                <span className="text-muted-foreground text-xs">
                                  {inv.ownerEmail || '—'}
                                </span>
                              </td>
                              <td className="py-3 px-2">
                                <Badge variant={inv.isPaid ? 'default' : 'outline'} 
                                  className={inv.isPaid ? 'bg-green-600' : ''}>
                                  {inv.isPaid ? 'Оплачено' : 'Черновик'}
                                </Badge>
                              </td>
                              <td className="py-3 px-2">
                                <span className="text-muted-foreground text-xs">
                                  {new Date(inv.createdAt).toLocaleDateString('ru-RU')}
                                </span>
                              </td>
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedInvId(inv.id)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Link href={`/${inv.slug}`} target="_blank">
                                    <Button variant="ghost" size="sm">
                                      <ExternalLink className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination */}
                    {totalInvPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Всего: {invData?.total} приглашений
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setInvPage(p => Math.max(0, p - 1))}
                            disabled={invPage === 0}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <span className="text-sm">
                            {invPage + 1} / {totalInvPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setInvPage(p => Math.min(totalInvPages - 1, p + 1))}
                            disabled={invPage >= totalInvPages - 1}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Invitation Details Dialog */}
      <Dialog open={selectedInvId !== null} onOpenChange={(open) => !open && setSelectedInvId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Детали приглашения</DialogTitle>
          </DialogHeader>
          {invDetailsLoading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : invDetails ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Название</p>
                  <p className="font-medium">{invDetails.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Тип события</p>
                  <Badge variant="secondary">{getEventTypeLabel(invDetails.eventType)}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Дата события</p>
                  <p className="font-medium">{new Date(invDetails.date).toLocaleDateString('ru-RU')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Место</p>
                  <p className="font-medium">{invDetails.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ссылка</p>
                  <Link href={`/${invDetails.slug}`} target="_blank" className="text-primary hover:underline">
                    invites.kz/{invDetails.slug}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Статус</p>
                  <div className="flex gap-2">
                    {invDetails.isAI && (
                      <Badge variant="outline" className="text-purple-600">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    )}
                    <Badge variant={invDetails.isPaid ? 'default' : 'outline'}
                      className={invDetails.isPaid ? 'bg-green-600' : ''}>
                      {invDetails.isPaid ? 'Оплачено' : 'Черновик'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* RSVP */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold">RSVP ({invDetails.rsvps?.length || 0})</h3>
                </div>
                {invDetails.rsvps && invDetails.rsvps.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {invDetails.rsvps.map((rsvp: any) => (
                      <div key={rsvp.id} className="flex items-center justify-between text-sm bg-muted/50 rounded p-2">
                        <span>{rsvp.name}</span>
                        <Badge variant={rsvp.attending === 'yes' ? 'default' : 'secondary'}>
                          {rsvp.attending === 'yes' ? 'Придёт' : 'Не придёт'}
                          {rsvp.guestCount > 1 && ` (+${rsvp.guestCount - 1})`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Нет ответов</p>
                )}
              </div>

              {/* Wishlist */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-5 h-5 text-pink-600" />
                  <h3 className="font-semibold">Wishlist ({invDetails.wishlist?.length || 0})</h3>
                </div>
                {invDetails.wishlist && invDetails.wishlist.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {invDetails.wishlist.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-sm bg-muted/50 rounded p-2">
                        <span>{item.name}</span>
                        <Badge variant={item.isReserved ? 'default' : 'outline'}>
                          {item.isReserved ? `Зарезервировано: ${item.reservedBy}` : 'Доступно'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Список пуст</p>
                )}
              </div>

              {/* Wishes */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold">Пожелания ({invDetails.wishes?.length || 0})</h3>
                </div>
                {invDetails.wishes && invDetails.wishes.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {invDetails.wishes.map((wish: any) => (
                      <div key={wish.id} className="text-sm bg-muted/50 rounded p-2">
                        <p className="font-medium">{wish.guestName}</p>
                        <p className="text-muted-foreground">{wish.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Нет пожеланий</p>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getEventTypeLabel(type: string | null): string {
  const labels: Record<string, string> = {
    wedding: "Свадьба",
    birthday: "День рождения",
    corporate: "Корпоратив",
    anniversary: "Юбилей",
    sundettoi: "Сүндет той",
    tusaukeser: "Тұсау кесер",
    kyz_uzatu: "Қыз ұзату",
    betashar: "Бет ашар",
    other: "Другое",
  };
  return labels[type || ''] || type || "Неизвестно";
}

