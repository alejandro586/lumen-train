import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Trash2, Filter, Download, Columns, Search, RefreshCw } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

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

  const filteredColumns = columns.filter((col) => {
    const matchesSearch = col.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || col.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleResetColumns = () => {
    const newColumns = columns.map(col => ({ ...col, selected: true }));
    setColumns(newColumns);
    setCsvColumns(newColumns);
    toast({
      title: "Columnas restablecidas",
      description: "Todas las columnas han sido seleccionadas nuevamente",
    });
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
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-cyber flex items-center justify-center shadow-glow">
                    <Filter className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Selección de Columnas</h2>
                    <p className="text-sm text-muted-foreground">
                      Elige las variables para tu modelo
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetColumns}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Restablecer
                </Button>
              </div>

              {/* Search and Filter Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    placeholder="Buscar columnas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 px-3 py-2 rounded-md bg-card/60 backdrop-blur-sm border border-input text-sm"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 rounded-md bg-card/60 backdrop-blur-sm border border-input text-sm"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="number">Numérico</option>
                  <option value="string">Texto</option>
                  <option value="boolean">Booleano</option>
                </select>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {filteredColumns.map((col) => (
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
          <Card className="p-8 bg-gradient-card border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-500">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Vista Previa de Datos - {data.length.toLocaleString()} filas totales</h2>
                  <p className="text-sm text-muted-foreground">
                    Mostrando las primeras 15 filas del dataset cargado
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 hover:bg-accent/10">
                  <Download className="w-4 h-4" /> Exportar
                </Button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border/40">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 sticky top-0">
                    <tr className="border-b border-border/30">
                      <th className="text-left p-3 font-semibold text-muted-foreground">#</th>
                      {columns.filter((c) => c.selected).map((col) => (
                        <th key={col.id} className="text-left p-3 font-semibold">
                          <div className="flex flex-col gap-1">
                            <span>{col.name}</span>
                            <Badge variant="outline" className="text-xs w-fit">{col.type}</Badge>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 15).map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-border/20 hover:bg-primary/5 transition-colors"
                      >
                        <td className="p-3 text-muted-foreground font-semibold">{idx + 1}</td>
                        {columns.filter((c) => c.selected).map((col) => (
                          <td key={col.id} className="p-3 font-mono text-foreground">
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
              
              {data.length > 15 && (
                <p className="text-sm text-muted-foreground text-center">
                  ... y {(data.length - 15).toLocaleString()} filas más
                </p>
              )}
            </div>
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
