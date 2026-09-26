"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Phone, Mail, X, Check, Users } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

type FormState = { name: string; phone: string; email: string };
const emptyForm: FormState = { name: "", phone: "", email: "" };

export function ContactsManager() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchContacts = useCallback(async () => {
    const res = await fetch("/api/contacts");
    if (res.ok) setContacts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  function startEdit(contact: Contact) {
    setEditingId(contact.id);
    setForm({ name: contact.name, phone: contact.phone, email: contact.email ?? "" });
    setIsAdding(false);
    setError("");
  }

  function cancelForm() {
    setIsAdding(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/contacts/${editingId}` : "/api/contacts";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao salvar contato.");
      return;
    }

    await fetchContacts();
    cancelForm();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover "${name}" dos seus contatos de emergência?`)) return;
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    await fetchContacts();
  }

  return (
    <div className="card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Contatos de Emergência</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Mantenha aqui as pessoas para acionar em caso de queda detectada.
          </p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => { setIsAdding(true); setEditingId(null); setForm(emptyForm); setError(""); }}
            className="btn-primary text-sm py-2 px-4"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        )}
      </div>

      {/* Form */}
      {(isAdding || editingId) && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-2xl bg-blue-50 p-5 ring-1 ring-blue-200"
        >
          <h3 className="mb-4 font-semibold text-gray-900">
            {editingId ? "Editar contato" : "Novo contato"}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="input-field text-sm py-2.5"
                placeholder="Nome do contato"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Telefone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                className="input-field text-sm py-2.5"
                placeholder="(11) 99999-9999"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Email (opcional)
              </label>
              <input
                type="email"
                className="input-field text-sm py-2.5"
                placeholder="email@contato.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-sm py-2 px-5"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Salvando…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Salvar
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="btn-ghost text-sm py-2 px-5"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="py-8 text-center text-gray-400">Carregando…</div>
      ) : contacts.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <Users className="mb-3 h-10 w-10 text-gray-300" />
          <p className="font-medium text-gray-500">Nenhum contato cadastrado ainda.</p>
          <p className="mt-1 text-sm text-gray-400">
            Adicione contatos para ter à mão em caso de queda.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {contacts.map((contact) => (
            <li
              key={contact.id}
              className={`flex items-center justify-between rounded-2xl border p-4 transition ${
                editingId === contact.id
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-100 bg-gray-50 hover:border-gray-200"
              }`}
            >
              <div>
                <p className="font-semibold text-gray-900">{contact.name}</p>
                <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {contact.phone}
                  </span>
                  {contact.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {contact.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(contact)}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-100 hover:text-blue-700"
                  aria-label="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(contact.id, contact.name)}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-red-100 hover:text-red-600"
                  aria-label="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
