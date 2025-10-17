import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Trash2, Filter, Download, Columns } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";

const Clean = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { csvData, csvColumns, setCsvColumns } = useData();

  const [columns, setColumns] = useState(csvColumns || []);
  const [data, setData] = useState(csvData || []);

  useEffect(() => {
    if (!csvData || !csvColumns) {
      toast({
        title: "Sin datos",
        description: "Por favor sube un archivo CSV primero",
        variant: "destructive",
      });
      navigate("/upload");
    } else {
      setColumns(csvColumns);
      setData(csvData);
    }
  }, [csvData, csvColumns, navigate, toast]);

  const stats = {
    totalRows: data.length,
    selectedColumns: columns.filter((c) => c.selected).length,
    totalNulls: columns.reduce((sum, col) => sum + col.nulls, 0),
    duplicates: 0,
  };

  const toggleColumn = (id: number) => {
    const newColumns = columns.map((col) =>
      col.id === id ? { ...col, selected: !col.selected } : col
    );
    setColumns(newColumns);
    setCsvColumns(newColumns);
  };

  return (
    <div className="min-h-screen bg-background dark text-foreground relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_60%)]"></div>
      <div className="absolute top-40 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/50 bg-card/30 backdrop-blur-xl shadow-lg">
        <div className="container mx-auto px-6 py-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2 hover:text-primary"
          >
            ← Dashboard
          </Button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-neon flex items-center justify-center shadow-glow">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Limpieza de Datos
            </h1>
            <p className="text-sm text-muted-foreground">
              Visualiza, analiza y prepara tus datos para el modelo
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-6 py-12 animate-fade-in relative z-10">
        <div className="space-y-10 max-w-6xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Total Filas", value: stats.totalRows.toLocaleString(), icon: <Columns />, color: "text-foreground" },
              { label: "Columnas Seleccionadas", value: `${stats.selectedColumns}/${columns.length}`, icon: <Filter />, color: "text-primary" },
              { label: "Valores Nulos", value: stats.totalNulls, icon: <Trash2 />, color: "text-accent" },
              { label: "Duplicados", value: stats.duplicates, icon: <Sparkles />, color: "text-destructive" },
            ].map((item, idx) => (
              <Card
                key={idx}
                className="relative overflow-hidden p-6 border border-border/50 bg-gradient-card backdrop-blur-sm shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-500"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">{item.icon}</div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Column Selection */}
          <Card className="p-8 bg-gradient-card border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-500">
...
          </Card>

          {/* Data Preview */}
          <Card className="p-8 bg-gradient-card border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-500">
...
          </Card>

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => navigate("/upload")}
              className="hover:bg-primary/10 hover:border-primary transition-all"
            >
              ← Volver a Cargar
            </Button>
            <Button
              onClick={() => navigate("/train")}
              size="lg"
              className="gap-2 bg-gradient-primary hover:opacity-90 hover:shadow-glow transition-all shadow-card"
            >
              Continuar a Entrenar
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Clean;
