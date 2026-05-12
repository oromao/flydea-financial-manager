"use client";

import { useState, useEffect } from "react";
import { Plus, ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/use-metrics";

const formSchema = z.object({
  type: z.enum(["EXPENSE", "INCOME"]),
  description: z.string().min(1, "Obrigatório"),
  amount: z.string().min(1, "Obrigatório"),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  date: z.string().min(1, "Obrigatório"),
});

type FormValues = z.infer<typeof formSchema>;

interface QuickAddProps {
  categories: Array<{ id: string; name: string; type: string }>;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function QuickAdd({
  categories,
  onSuccess,
  open: controlledOpen,
  onOpenChange: controlledSetOpen,
}: QuickAddProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledSetOpen || setInternalOpen;
  const toast = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "EXPENSE",
      description: "",
      amount: "",
      categoryId: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const {
    watch,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  const type = watch("type");
  const filteredCategories = categories.filter((c) => c.type === type);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = "hidden";
      reset({
        type: "EXPENSE",
        description: "",
        amount: "",
        categoryId: "",
        date: new Date().toISOString().split("T")[0],
      });
      return () => {
        document.documentElement.style.overflow = "";
      };
    }
  }, [open, reset]);

  const onSubmit = async (values: FormValues) => {
    const numAmount = parseFloat(values.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: values.type,
          description: values.description.trim(),
          amount: numAmount,
          date: values.date,
          categoryId: values.categoryId,
          paymentStatus: "PAID",
        }),
      });

      if (res.ok) {
        toast.success(
          `${values.type === "EXPENSE" ? "Despesa" : "Receita"} adicionada!`
        );
        trackEvent("quick_add", {
          type: values.type,
          amount: numAmount,
          category: values.categoryId,
        });
        onSuccess?.();
        setTimeout(() => setOpen(false), 600);
      } else {
        const error = await res.json().catch(() => ({}));
        toast.error(error.error || "Erro ao adicionar");
      }
    } catch {
      toast.error("Erro ao adicionar");
    }
  };

  return (
    <>
      {controlledOpen === undefined && !open && (
        <Button
          onClick={() => setOpen(true)}
          aria-label="Novo lançamento"
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-primary shadow-lg hover:bg-primary/90 transition-all hover:scale-110 z-40 md:hidden"
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}

      {controlledOpen === undefined && (
        <Button
          onClick={() => setOpen(true)}
          className="hidden md:flex items-center gap-2 h-12 px-6 rounded-full bg-primary shadow-lg hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold">Novo Lançamento</span>
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[420px] p-0">
          <div className="px-8 pt-10 pb-8">
            <DialogHeader className="text-left mb-10">
              <DialogTitle className="text-3xl font-black tracking-tight text-foreground leading-none">
                Novo Lançamento
              </DialogTitle>
            </DialogHeader>
          </div>

          <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            aria-label="Formulário de novo lançamento"
            className="space-y-8 px-8 pb-10"
          >
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2 p-1 bg-muted rounded-2xl" role="radiogroup" aria-label="Tipo de lançamento">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={field.value === "EXPENSE"}
                        onClick={() => field.onChange("EXPENSE")}
                        className={cn(
                          "flex-1 py-4 rounded-xl font-bold text-base transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30",
                          field.value === "EXPENSE"
                            ? "bg-destructive text-white shadow-md shadow-destructive/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                        )}
                      >
                        <ArrowDown className="w-5 h-5 inline-block mr-2" /> Despesa
                      </button>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={field.value === "INCOME"}
                        onClick={() => field.onChange("INCOME")}
                        className={cn(
                          "flex-1 py-4 rounded-xl font-bold text-base transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30",
                          field.value === "INCOME"
                            ? "bg-success text-white shadow-md shadow-success/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                        )}
                      >
                        <ArrowUp className="w-5 h-5 inline-block mr-2" /> Receita
                      </button>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                      O que?
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          type === "EXPENSE"
                            ? "Ex: Almoço, Transporte..."
                            : "Ex:freelance, Bongard..."
                        }
                        className="h-14 text-lg font-medium bg-muted/40 border-0 rounded-2xl focus:ring-2 focus:ring-foreground/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                      Quanto?
                    </FormLabel>
                    <div className="relative">
                      <span aria-hidden="true" className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground/50">R$</span>
                      <Input
                        type="number"
                        placeholder="0,00"
                        className="h-20 text-3xl font-bold bg-muted/40 border-0 rounded-2xl focus:ring-2 focus:ring-foreground/20 pl-14 text-right pr-6"
                        {...field}
                      />
                    </div>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                        Categoria
                      </FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={(val) => field.onChange(val)}
                      >
                        <FormControl>
                          <SelectTrigger className="h-14 bg-muted/40 border-0 rounded-2xl font-medium">
                            <SelectValue placeholder="Selecione">{field.value ? filteredCategories.find(c => c.id === field.value)?.name || "Selecione" : "Selecione"}</SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                        Quando?
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          className="h-14 bg-muted/40 border-0 rounded-2xl font-medium" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-8 border-t border-border/20">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 font-bold text-base bg-foreground text-background hover:bg-foreground/90 rounded-2xl"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Salvar transação"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
