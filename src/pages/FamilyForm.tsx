import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function FamilyForm() {
  const [form, setForm] = useState({ name: "", headId: "" });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      api.get(`/families/${id}`).then((res) => setForm(res.data));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      await api.put(`/families/${id}`, form);
    } else {
      await api.post("/families", form);
    }
    navigate("/families");
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/families">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
        </Link>
        <h1 className="text-xl font-semibold text-gray-700">
          {id ? "Editar Família" : "Nova Família"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Nome da Família</label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">ID do Chefe (opcional)</label>
          <Input
            value={form.headId}
            onChange={(e) => setForm({ ...form, headId: e.target.value })}
          />
        </div>

        <Button type="submit" className="w-full">
          Salvar
        </Button>
      </form>
    </div>
  );
}
