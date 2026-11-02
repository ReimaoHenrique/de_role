"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, LogOut, TrendingUp, Users, DollarSign, Calendar, Eye, EyeOff } from "lucide-react";
import { MESSAGES } from "@/lib/constants";
import { Festa } from "@/types";

const TOKEN_STORAGE_KEY = "admin_token";

interface AdminFestasResponse {
  sucesso: boolean;
  data?: Festa[];
  mensagem?: string;
  resumo?: {
    totalFestas: number;
    festasAtivas: number;
    festasFinalizadas: number;
    lucroTotal: number;
  };
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hashInput, setHashInput] = useState("");
  const [showHash, setShowHash] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [festas, setFestas] = useState<Festa[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setHashInput("");
    setLoginError("");
    setFestas([]);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, []);

  const loadFestas = useCallback(
    async (token: string) => {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/festas", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        });

        const result: AdminFestasResponse = await response
          .json()
          .catch(() => ({ sucesso: false }));

        if (response.status === 401 || response.status === 403) {
          handleLogout();
          setLoginError(MESSAGES.LOGIN_INVALIDO);
          return;
        }

        if (!response.ok || !result.sucesso) {
          throw new Error(result.mensagem || "Erro ao carregar festas.");
        }

        setFestas(result.data ?? []);
      } catch (error) {
        console.error("Erro ao carregar festas:", error);
        setLoginError(
          error instanceof Error
            ? error.message
            : "Erro ao carregar festas. Tente novamente."
        );
      } finally {
        setLoading(false);
      }
    },
    [handleLogout]
  );

  useEffect(() => {
    // Verifica se já existe um token salvo
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (savedToken) {
      // Restaura a sessão a partir do localStorage no mount
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthenticated(true);
      loadFestas(savedToken);
    }
  }, [loadFestas]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/festas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash: hashInput }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.sucesso || !result.token) {
        throw new Error(result.mensagem || MESSAGES.LOGIN_INVALIDO);
      }

      localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
      setIsAuthenticated(true);
      setHashInput("");
      await loadFestas(result.token);
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : MESSAGES.LOGIN_INVALIDO
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativa':
        return <Badge className="bg-green-100 text-green-800">Ativa</Badge>;
      case 'finalizada':
        return <Badge className="bg-blue-100 text-blue-800">Finalizada</Badge>;
      case 'cancelada':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const calculateTotals = () => {
    const totalLucroAtual = festas.reduce((sum, festa) => sum + festa.lucroAtual, 0);
    const totalLucroPotencial = festas.reduce((sum, festa) => sum + festa.lucroTotal, 0);
    const totalIngressosVendidos = festas.reduce((sum, festa) => sum + festa.quantidadeVendidos, 0);
    const totalIngressosDisponiveis = festas.reduce((sum, festa) => sum + festa.quantidadeTotal, 0);

    return {
      totalLucroAtual,
      totalLucroPotencial,
      totalIngressosVendidos,
      totalIngressosDisponiveis
    };
  };

  // Tela de Login
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin - Dashboard</h1>
            <p className="text-gray-600">
              Digite o hash de acesso para entrar no painel administrativo.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Login Administrativo</CardTitle>
              <CardDescription>
                Acesso restrito apenas para administradores autorizados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hash">Hash de Acesso</Label>
                  <div className="relative">
                    <Input
                      id="hash"
                      type={showHash ? "text" : "password"}
                      placeholder="Digite o hash de acesso"
                      value={hashInput}
                      onChange={(e) => setHashInput(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowHash(!showHash)}
                    >
                      {showHash ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {loginError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">
                      {loginError}
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={!hashInput || loading}>
                  {loading ? "Entrando..." : "Entrar no Dashboard"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Dashboard Administrativo
  const totals = calculateTotals();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600">Visão geral das festas e vendas de ingressos</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>

      {loginError && (
        <Alert className="border-red-200 bg-red-50 mb-6">
          <AlertDescription className="text-red-800">
            {loginError}
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lucro Atual</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totals.totalLucroAtual)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lucro Potencial</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totals.totalLucroPotencial)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingressos Vendidos</p>
                <p className="text-2xl font-bold text-orange-600">
                  {totals.totalIngressosVendidos}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Eventos</p>
                <p className="text-2xl font-bold text-purple-600">
                  {festas.length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Festas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Festas Cadastradas</CardTitle>
          <CardDescription>
            Informações detalhadas sobre todas as festas e vendas de ingressos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando dados...</p>
            </div>
          ) : festas.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              Nenhuma festa cadastrada.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Evento</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Ingressos</TableHead>
                    <TableHead className="text-right">Vendidos</TableHead>
                    <TableHead className="text-right">Valor Unit.</TableHead>
                    <TableHead className="text-right">Lucro Atual</TableHead>
                    <TableHead className="text-right">Lucro Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {festas.map((festa) => (
                    <TableRow key={festa.id}>
                      <TableCell className="font-medium">{festa.nome}</TableCell>
                      <TableCell>{formatDate(festa.data)}</TableCell>
                      <TableCell>{getStatusBadge(festa.status)}</TableCell>
                      <TableCell className="text-right">{festa.quantidadeTotal}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">{festa.quantidadeVendidos}</span>
                        <span className="text-gray-500 text-sm ml-1">
                          ({festa.quantidadeTotal > 0
                            ? ((festa.quantidadeVendidos / festa.quantidadeTotal) * 100).toFixed(0)
                            : 0}
                          %)
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(festa.valorUnitario)}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(festa.lucroAtual)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-blue-600">
                        {formatCurrency(festa.lucroTotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
