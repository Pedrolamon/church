import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Users, TreePine } from "lucide-react";

export default function FamiliesList() {
  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/families").then(res => {
      setFamilies(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">Famílias</h1>
        <Link to="/families/new">
          <Button>Nova Família</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {families.map((family) => (
          <Card
            key={family.id}
            className="p-4 border-gray-200 hover:shadow-md transition"
          >
            <div className="flex items-center gap-3 mb-3">
              <Users className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-medium">{family.name}</h2>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Membros: {family.members?.length || 0}
            </p>

            <div className="flex gap-2">
              <Link to={`/families/tree/${family.id}`}>
                <Button variant="secondary" size="sm">
                  <TreePine className="h-4 w-4 mr-1" /> Ver Árvore
                </Button>
              </Link>
              <Link to={`/families/edit/${family.id}`}>
                <Button variant="outline" size="sm">
                  Editar
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
