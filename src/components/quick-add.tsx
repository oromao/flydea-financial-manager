"use client";

import { useState, useEffect } from "react";
import { Plus, ArrowDown, ArrowUp, Loader2 } from "lucide-react";
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
          aria-label="Novo lancamento"
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
          <span className="font-bold">Novo Lancamento</span>
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-md bg-surface border-none rounded-[32px] p-0 shadow-xl z-[9999]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-on-background">
                Novo Lancamento
              </DialogTitle>
            </DialogHeader>
          </div>

          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 px-6"
            >
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2 p-1 bg-surface rounded-full border border-outline/20">
                      <Toggle
                        pressed={field.value === "EXPENSE"}
                        onPressedChange={() => field.onChange("EXPENSE")}
                        className={cn(
                          "flex-1 h-10 rounded-full flex items-center justify-center gap-2 text-sm font-bold transition-all data-[state=on]:bg-destructive/10 data-[state=on]:text-destructive",
                          field.value !== "EXPENSE" &&
                            "text-on-surface-variant hover:bg-surface"
                        )}
                      >
                        <ArrowDown className="w-4 h-4" /> Despesa
                      </Toggle>
                      <Toggle
                        pressed={field.value === "INCOME"}
                        onPressedChange={() => field.onChange("INCOME")}
                        className={cn(
                          "flex-1 h-10 rounded-full flex items-center justify-center gap-2 text-sm font-bold transition-all data-[state=on]:bg-success/10 data-[state=on]:text-success",
                          field.value !== "INCOME" &&
                            "text-on-surface-variant hover:bg-surface"
                        )}
                      >
                        <ArrowUp className="w-4 h-4" /> Receita
                      </Toggle>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-on-surface-variant ml-1">
                      Descrição
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          type === "EXPENSE"
                            ? "Ex: Almoço, Transporte..."
                            : "Ex: Cliente X, Freelance..."
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-on-surface-variant ml-1">
                      Valor (R$)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0,00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-on-surface-variant ml-1">
                        Categoria
                      </FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={(val) => field.onChange(val)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-on-surface-variant ml-1">
                        Data
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="sticky bottom-0 py-4 border-t border-outline/10">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="default"
                  size="lg"
                  className="w-full h-12 font-bold"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Salvar"
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
