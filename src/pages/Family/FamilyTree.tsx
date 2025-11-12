import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../lib/api";
import Tree from "react-d3-tree";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function FamilyTree() {
  const { id } = useParams();
  const [family, setFamily] = useState<any>(null);
  const treeContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get(`/families/${id}`).then((res) => {
      setFamily(res.data);
    });
  }, [id]);

  if (!family) return <div className="p-6">Carregando...</div>;

  const buildTree = (family: any) => {
    const root = {
      name: family.head?.name || "Sem Chefe",
      children: family.members?.map((m: any) => ({
        name: m.name,
        attributes: {
          relação: m.relation || "Membro",
        },
      })),
    };
    return root;
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/families">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
        </Link>
        <h1 className="text-xl font-semibold text-gray-700">
          Árvore Genealógica: {family.name}
        </h1>
      </div>

      <div ref={treeContainer} style={{ width: "100%", height: "80vh" }}>
        <Tree
          data={buildTree(family)}
          orientation="vertical"
          translate={{ x: 400, y: 100 }}
          zoomable
          separation={{ siblings: 1.2, nonSiblings: 1.6 }}
          pathFunc="step"
         
        />
      </div>
    </div>
  );
}
 {/*styles={{
            nodes: {
              node: { circle: { fill: "#60a5fa" }, name: { fill: "#111827" } },
              leafNode: { circle: { fill: "#a7f3d0" }, name: { fill: "#111827" } },
            },
          }} as any*/}