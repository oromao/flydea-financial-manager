"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Camera, User as UserIcon, Trash2, Save, ShieldCheck, RefreshCw, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function PerfilPage() {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setName(data.user?.name || "");
      setEmail(data.user?.email || "");
      setAvatarUrl(data.user?.avatarUrl || "");
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatarUrl }),
      });
      if (res.ok) {
        toast.success("Perfil salvo com sucesso!");
      } else {
        toast.error("Erro ao salvar perfil. Tente novamente.");
      }
    } catch (e) {
      toast.error("Falha na comunicação com o servidor.");
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const filename = `avatar_${Date.now()}.${file.name.split('.').pop() || 'jpg'}`;
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || `Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      const uploadUrl = data.url || data.downloadUrl || data.pathname;

      if (!uploadUrl) {
        throw new Error("Resposta inválida do servidor");
      }

      setAvatarUrl(uploadUrl);
      toast.success("Foto atualizada com sucesso!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao enviar foto";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-0 space-y-8">
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <p className="text-xs sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-bold text-on-surface-variant/80">Perfil</p>
        <h1 className="text-3xl font-bold tracking-tight text-on-background">Seu perfil</h1>
        <p className="text-on-surface-variant text-sm max-w-2xl">Atualize seu nome e escolha uma foto para aparecer no sistema.</p>
      </motion.header>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="premium-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-surface-variant border border-outline/20 flex items-center justify-center relative shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl.includes("blob.vercel") ? `/api/image-proxy?url=${encodeURIComponent(avatarUrl)}` : avatarUrl}
                  alt="Foto do perfil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserIcon className="w-10 h-10 text-on-surface-variant" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-on-background truncate">{name || "Usuário"}</h2>
              <p className="text-sm text-on-surface-variant truncate">{email}</p>
              <div className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                Conta ativa
              </div>
            </div>
          </div>

          <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-outline/30 bg-surface-variant/30 px-4 py-3 cursor-pointer hover:bg-surface-variant/50 transition-colors">
            <Camera className="w-4 h-4" />
            <span className="text-sm font-medium">Trocar foto</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadAvatar(file);
              }}
            />
          </label>
          {uploading && <p className="text-xs text-on-surface-variant">Enviando foto…</p>}
          <Button variant="outline" className="w-full rounded-xl" onClick={() => setAvatarUrl("")}>Remover foto</Button>
        </Card>

        <Card className="premium-card p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-on-background">Dados do perfil</h2>
            <p className="text-sm text-on-surface-variant">Essas informações aparecem no cabeçalho e nas áreas administrativas.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-on-background" htmlFor="profile-name">Nome</label>
            <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="h-11 rounded-xl" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-on-background" htmlFor="profile-email">Email</label>
            <Input id="profile-email" value={email} disabled className="h-11 rounded-xl" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-on-background" htmlFor="profile-avatar">URL da foto</label>
            <Input id="profile-avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." className="h-11 rounded-xl" />
            <p className="text-xs text-on-surface-variant">Você pode subir uma imagem ou colar uma URL pública.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={save} className="rounded-xl" disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? "Salvando…" : "Salvar perfil"}
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
