"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";
import {
  Users, Activity, Eye, TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeaderSkeleton } from "@/components/ui/page-skeleton";

interface AnalyticsData {
  dau: { date: string; count: number }[];
  mau: { month: string; count: number }[];
  features: { name: string; count: number }[];
  pageViews: { path: string; count: number }[];
  totalUsers: number;
  period: number;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/metrics/usage?days=${days}`)
      .then(res => res.json())
      .then(json => {
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="premium-card p-8 text-center">
          <p className="text-destructive font-medium">Erro ao carregar analytics</p>
          <p className="text-sm text-on-surface-variant/70 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const totalPageViews = data?.pageViews?.reduce((sum, pv) => sum + pv.count, 0) ?? 0;
  const avgDau = data?.dau?.length ? Math.round(data.dau.reduce((sum, d) => sum + d.count, 0) / data.dau.length) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-background">Analytics</h1>
          <p className="text-sm text-on-surface-variant/70 mt-1">Métricas de uso do produto</p>
        </div>
        <select
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          className="h-11 rounded-xl border bg-card px-4 text-sm"
        >
          <option value={7}>7 dias</option>
          <option value={30}>30 dias</option>
          <option value={90}>90 dias</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard icon={Users} label="Média DAU" value={String(avgDau)} />
        <SummaryCard icon={Activity} label="Total de Eventos" value={String(data?.dau?.reduce((s, d) => s + d.count, 0) ?? 0)} />
        <SummaryCard icon={Eye} label="Page Views" value={String(totalPageViews)} />
        <SummaryCard icon={TrendingUp} label="Features Ativas" value={String(data?.features?.length ?? 0)} />
      </div>

      <Card className="p-6">
        <h2 className="font-bold text-on-background mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          DAU — Daily Active Users
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.dau ?? []}>
              <defs>
                <linearGradient id="dauGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline)" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--color-on-surface-variant)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--color-on-surface-variant)" />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid var(--color-outline)" }} />
              <Area type="monotone" dataKey="count" stroke="var(--color-primary)" fill="url(#dauGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-bold text-on-background mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Feature Adoption
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.features?.slice(0, 15) ?? []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline)" opacity={0.3} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--color-on-surface-variant)" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="var(--color-on-surface-variant)" width={120} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid var(--color-outline)" }} />
              <Bar dataKey="count" fill="var(--color-primary)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-bold text-on-background mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          Páginas Mais Visitadas
        </h2>
        <div className="space-y-2">
          {data?.pageViews?.slice(0, 10).map((pv, i) => (
            <div key={pv.path} className="flex items-center gap-3 p-3 rounded-xl bg-surface-variant/30">
              <span className="text-xs font-bold text-on-surface-variant/50 w-6">{i + 1}</span>
              <span className="text-sm text-on-background flex-1">{pv.path}</span>
              <span className="text-sm font-bold text-primary">{pv.count}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="premium-card p-5">
      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <p className="text-xs text-on-surface-variant/70 mb-1">{label}</p>
      <p className="text-2xl font-bold text-on-background">{value}</p>
    </motion.div>
  );
}
