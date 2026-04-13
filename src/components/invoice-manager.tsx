"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Button } from "./ui/button";

interface Installment {
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: "PENDING" | "RECEIVED" | "OVERDUE";
}

interface InvoiceFormData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  description: string;
  totalAmount: number;
  emissionDate: string;
  dueDate: string;
  paymentMethod: string;
  observations: string;
  installments: Installment[];
}

interface InvoiceManagerProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function InvoiceManager({ onSuccess, onError }: InvoiceManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [numInstallments, setNumInstallments] = useState(1);
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: "",
    clientName: "",
    clientEmail: "",
    description: "",
    totalAmount: 0,
    emissionDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    paymentMethod: "",
    observations: "",
    installments: [
      {
        installmentNumber: 1,
        amount: 0,
        dueDate: new Date().toISOString().split("T")[0],
        status: "PENDING"
      }
    ]
  });

  const handleInstallmentCountChange = (count: number) => {
    setNumInstallments(count);
    const newInstallments = Array.from({ length: count }, (_, i) => ({
      installmentNumber: i + 1,
      amount: formData.totalAmount / count,
      dueDate: new Date(new Date().setMonth(new Date().getMonth() + i))
        .toISOString()
        .split("T")[0],
      status: "PENDING" as const
    }));
    setFormData({ ...formData, installments: newInstallments });
  };

  const handleInstallmentChange = (index: number, field: string, value: any) => {
    const newInstallments = [...formData.installments];
    newInstallments[index] = { ...newInstallments[index], [field]: value };
    setFormData({ ...formData, installments: newInstallments });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Erro ao criar nota");

      onSuccess?.("Nota criada com sucesso!");
      setShowForm(false);
      setFormData({
        invoiceNumber: "",
        clientName: "",
        clientEmail: "",
        description: "",
        totalAmount: 0,
        emissionDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        paymentMethod: "",
        observations: "",
        installments: [
          {
            installmentNumber: 1,
            amount: 0,
            dueDate: new Date().toISOString().split("T")[0],
            status: "PENDING"
          }
        ]
      });
    } catch (error) {
      console.error("Error:", error);
      onError?.("Erro ao criar nota");
    }
  };

  return (
    <div className="space-y-6">
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full">
          <Plus size={18} className="mr-2" /> Nova Nota de Receita
        </Button>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-surface p-4 sm:p-6 rounded-lg border border-outline/50"
        >
          <h3 className="text-lg sm:text-xl font-bold mb-4">Criar Nota de Receita</h3>

          {/* Dados da Nota */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
            <div>
              <label className="text-xs font-semibold text-on-surface-variant mb-1 block">
                Número da Nota*
              </label>
              <input
                type="text"
                required
                value={formData.invoiceNumber}
                onChange={(e) =>
                  setFormData({ ...formData, invoiceNumber: e.target.value })
                }
                className="w-full border border-outline/50 bg-surface rounded-lg px-3 py-2 text-on-surface focus:border-secondary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface-variant mb-1 block">
                Nome do Cliente*
              </label>
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={(e) =>
                  setFormData({ ...formData, clientName: e.target.value })
                }
                className="w-full border border-outline/50 bg-surface rounded-lg px-3 py-2 text-on-surface focus:border-secondary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface-variant mb-1 block">
                Email do Cliente
              </label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) =>
                  setFormData({ ...formData, clientEmail: e.target.value })
                }
                className="w-full border border-outline/50 bg-surface rounded-lg px-3 py-2 text-on-surface focus:border-secondary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface-variant mb-1 block">
                Valor Total*
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.totalAmount}
                onChange={(e) => {
                  const total = parseFloat(e.target.value);
                  setFormData({ ...formData, totalAmount: total });
                  handleInstallmentCountChange(numInstallments);
                }}
                className="w-full border border-outline/50 bg-surface rounded-lg px-3 py-2 text-on-surface focus:border-secondary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface-variant mb-1 block">
                Data Emissão*
              </label>
              <input
                type="date"
                required
                value={formData.emissionDate}
                onChange={(e) =>
                  setFormData({ ...formData, emissionDate: e.target.value })
                }
                className="w-full border border-outline/50 bg-surface rounded-lg px-3 py-2 text-on-surface focus:border-secondary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface-variant mb-1 block">
                Número de Parcelas*
              </label>
              <select
                value={numInstallments}
                onChange={(e) => handleInstallmentCountChange(parseInt(e.target.value))}
                className="w-full border border-outline/50 bg-surface rounded-lg px-3 py-2 text-on-surface focus:border-secondary"
              >
                {[1, 2, 3, 4, 6, 12].map((n) => (
                  <option key={n} value={n}>
                    {n}x
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Parcelas */}
          <div className="mb-6">
            <h4 className="text-base sm:text-lg font-semibold text-on-surface mb-4">Parcelas</h4>
            <div className="space-y-2 sm:space-y-3">
              {formData.installments.map((inst, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 p-2 sm:p-3 bg-surface-variant rounded-md"
                >
                  <div>
                    <label className="text-xs text-on-surface-variant block mb-1">
                      Parcela {inst.installmentNumber}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={inst.amount}
                      onChange={(e) =>
                        handleInstallmentChange(idx, "amount", parseFloat(e.target.value))
                      }
                      className="w-full border border-outline/50 bg-surface rounded-lg px-2 py-1 text-on-surface text-sm focus:border-secondary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-on-surface-variant block mb-1">
                      Vencimento
                    </label>
                    <input
                      type="date"
                      value={inst.dueDate}
                      onChange={(e) =>
                        handleInstallmentChange(idx, "dueDate", e.target.value)
                      }
                      className="w-full border border-outline/50 bg-surface rounded-lg px-2 py-1 text-on-surface text-sm focus:border-secondary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-on-surface-variant block mb-1">Status</label>
                    <select
                      value={inst.status}
                      onChange={(e) =>
                        handleInstallmentChange(idx, "status", e.target.value)
                      }
                      className="w-full border border-outline/50 bg-surface rounded-lg px-2 py-1 text-on-surface text-sm focus:border-secondary"
                    >
                      <option value="PENDING">Pendente</option>
                      <option value="RECEIVED">Recebida</option>
                      <option value="OVERDUE">Vencida</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-on-surface-variant mb-1 block">
              Observações
            </label>
            <textarea
              value={formData.observations}
              onChange={(e) =>
                setFormData({ ...formData, observations: e.target.value })
              }
              className="w-full border border-outline/50 bg-surface rounded-lg px-3 py-2 text-on-surface text-sm focus:border-secondary"
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <Button type="submit" className="flex-1 text-sm sm:text-base h-10 sm:h-11">
              <Check size={18} className="mr-2" /> Salvar Nota
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 text-sm sm:text-base h-10 sm:h-11"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
