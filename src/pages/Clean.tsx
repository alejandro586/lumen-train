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
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/40 bg-card/50 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-6 py-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2 hover:text-primary"
          >
            ← Dashboard
          </Button>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-secondary-purple-light flex items-center justify-center shadow-inner">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Limpieza de Datos
            </h1>
            <p className="text-sm text-muted-foreground">
              Visualiza, analiza y prepara tus datos para el modelo
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-6 py-12 animate-fade-in">
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
                className="relative overflow-hidden p-6 border border-border/50 bg-gradient-to-br from-card via-card/80 to-muted/30 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-muted/30">{item.icon}</div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Column Selection */}
          <Card className="p-8 bg-gradient-to-br from-card via-card/80 to-muted/30 border border-border/50 shadow-md hover:shadow-xl transition-all duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Selección de Columnas</h2>
                  <p className="text-sm text-muted-foreground">
                    Marca las columnas que deseas incluir en el entrenamiento
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 hover:bg-primary/10">
                  <Filter className="w-4 h-4" /> Filtrar
                </Button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {columns.map((col) => (
                  <div
                    key={col.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 bg-card/40 transition-all duration-300 hover:bg-muted/20"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={col.selected}
                        onCheckedChange={() => toggleColumn(col.id)}
                      />
                      <div>
                        <p className="font-medium">{col.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {col.type}
                          </Badge>
                          {col.nulls > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {col.nulls} nulos
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Data Preview */}
          <Card className="p-8 bg-gradient-to-br from-card via-card/80 to-muted/30 border border-border/50 shadow-md hover:shadow-xl transition-all duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Vista Previa de Datos</h2>
                  <p className="text-sm text-muted-foreground">
                    Muestra las primeras 10 filas del dataset
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 hover:bg-accent/10">
                  <Download className="w-4 h-4" /> Exportar
                </Button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border/40">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="border-b border-border/30">
                      {columns.filter((c) => c.selected).map((col) => (
                        <th key={col.id} className="text-left p-3 font-semibold">
                          {col.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 10).map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-border/20 hover:bg-muted/30 transition-colors"
                      >
                        {columns.filter((c) => c.selected).map((col) => (
                          <td key={col.id} className="p-3 font-mono text-muted-foreground">
                            {row[col.name] ?? (
                              <span className="text-destructive font-semibold">null</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => navigate("/upload")}
              className="hover:bg-muted/20"
            >
              ← Volver a Cargar
            </Button>
            <Button
              onClick={() => navigate("/train")}
              size="lg"
              className="gap-2 bg-gradient-primary hover:opacity-90 transition-opacity"
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
