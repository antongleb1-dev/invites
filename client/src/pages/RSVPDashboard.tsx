import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Download, Users, CheckCircle, XCircle, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useRoute } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function RSVPDashboard() {
  const [, params] = useRoute("/rsvp-dashboard/:id");
  const weddingId = params?.id ? parseInt(params.id) : null;
  const { user, isAuthenticated } = useAuth();

  const { data: wedding } = trpc.wedding.getById.useQuery(
    { id: weddingId! },
    { enabled: !!weddingId }
  );

  const { data: rsvps, isLoading } = trpc.rsvp.list.useQuery(
    { weddingId: weddingId! },
    { enabled: !!weddingId }
  );

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dietaryFilter, setDietaryFilter] = useState<string>("all");
  const [parkingFilter, setParkingFilter] = useState<string>("all");
  const [transferFilter, setTransferFilter] = useState<string>("all");

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Требуется авторизация</CardTitle>
            <CardDescription>
              Пожалуйста, войдите в систему, чтобы увидеть RSVP
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!wedding || !rsvps) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Filter RSVPs
  const filteredRsvps = rsvps.filter((rsvp) => {
    if (statusFilter !== "all" && rsvp.attending !== statusFilter) return false;
    if (dietaryFilter === "has" && !rsvp.dietaryRestrictions) return false;
    if (dietaryFilter === "none" && rsvp.dietaryRestrictions) return false;
    if (parkingFilter === "yes" && !rsvp.needsParking) return false;
    if (parkingFilter === "no" && rsvp.needsParking) return false;
    if (transferFilter === "yes" && !rsvp.needsTransfer) return false;
    if (transferFilter === "no" && rsvp.needsTransfer) return false;
    return true;
  });

  // Calculate statistics
  const stats = {
    total: rsvps.length,
    yes: rsvps.filter(r => r.attending === "yes").length,
    no: rsvps.filter(r => r.attending === "no").length,
    plusOne: rsvps.filter(r => r.attending === "yes_plus_one").length,
    plusSpouse: rsvps.filter(r => r.attending === "yes_with_spouse").length,
    dietary: rsvps.filter(r => r.dietaryRestrictions).length,
    parking: rsvps.filter(r => r.needsParking).length,
    transfer: rsvps.filter(r => r.needsTransfer).length,
  };

  const totalAttending = stats.yes + stats.plusOne + stats.plusSpouse;
  const attendanceRate = stats.total > 0 ? Math.round((totalAttending / stats.total) * 100) : 0;

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Имя", "Email", "Телефон", "Статус", "Диета", "Парковка", "Трансфер"];
    const rows = filteredRsvps.map(rsvp => [
      rsvp.name,
      rsvp.email || "",
      rsvp.phone || "",
      getStatusLabel(rsvp.attending),
      rsvp.dietaryRestrictions || "Нет",
      rsvp.needsParking ? "Да" : "Нет",
      rsvp.needsTransfer ? "Да" : "Нет",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `rsvp-${wedding.slug}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  function getStatusLabel(status: string) {
    switch (status) {
      case "yes": return "Приду";
      case "no": return "Не приду";
      case "yes_plus_one": return "Приду +1";
      case "yes_with_spouse": return "Приду + супруг/а";
      default: return status;
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "yes":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Приду</Badge>;
      case "no":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Не приду</Badge>;
      case "yes_plus_one":
        return <Badge className="bg-blue-500"><UserPlus className="w-3 h-3 mr-1" />Приду +1</Badge>;
      case "yes_with_spouse":
        return <Badge className="bg-purple-500"><UserPlus className="w-3 h-3 mr-1" />Приду + супруг/а</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 py-8">
      <div className="container max-w-7xl">
        <Link href={`/manage/${wedding.slug}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к управлению
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">RSVP Dashboard</h1>
          <p className="text-muted-foreground">{wedding.title}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Всего ответов</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Придут</CardDescription>
              <CardTitle className="text-3xl text-green-600">{totalAttending}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{attendanceRate}% посещаемость</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Не придут</CardDescription>
              <CardTitle className="text-3xl text-red-600">{stats.no}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Особые требования</CardDescription>
              <CardTitle className="text-3xl">{stats.dietary + stats.parking + stats.transfer}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Диета: {stats.dietary} | Парковка: {stats.parking} | Трансфер: {stats.transfer}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Фильтры</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Статус</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="yes">Приду</SelectItem>
                    <SelectItem value="no">Не приду</SelectItem>
                    <SelectItem value="yes_plus_one">Приду +1</SelectItem>
                    <SelectItem value="yes_with_spouse">Приду + супруг/а</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Диета</label>
                <Select value={dietaryFilter} onValueChange={setDietaryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="has">Есть ограничения</SelectItem>
                    <SelectItem value="none">Нет ограничений</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Парковка</label>
                <Select value={parkingFilter} onValueChange={setParkingFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="yes">Нужна</SelectItem>
                    <SelectItem value="no">Не нужна</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Трансфер</label>
                <Select value={transferFilter} onValueChange={setTransferFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="yes">Нужен</SelectItem>
                    <SelectItem value="no">Не нужен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Показано {filteredRsvps.length} из {stats.total} ответов
              </p>
              <Button onClick={exportToCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Экспорт в CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RSVP Table */}
        <Card>
          <CardHeader>
            <CardTitle>Список ответов</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Контакты</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Диета</TableHead>
                  <TableHead>Парковка</TableHead>
                  <TableHead>Трансфер</TableHead>
                  <TableHead>Гостей</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRsvps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Нет RSVP, соответствующих фильтрам
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRsvps.map((rsvp) => (
                    <TableRow key={rsvp.id}>
                      <TableCell className="font-medium">{rsvp.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {rsvp.email && <div>{rsvp.email}</div>}
                          {rsvp.phone && <div className="text-muted-foreground">{rsvp.phone}</div>}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(rsvp.attending)}</TableCell>
                      <TableCell>
                        {rsvp.dietaryRestrictions ? (
                          <span className="text-sm">{rsvp.dietaryRestrictions}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {rsvp.needsParking ? (
                          <Badge variant="outline" className="bg-blue-50">Да</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {rsvp.needsTransfer ? (
                          <Badge variant="outline" className="bg-purple-50">Да</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{rsvp.guestCount}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

