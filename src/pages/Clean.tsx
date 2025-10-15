import { useState } from "react";
import { Sparkles, ArrowRight, Trash2, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const Clean = () => {
  const navigate = useNavigate();
  
  // Mock data
  const [columns, setColumns] = useState([
    { id: 1, name: "customer_id", type: "int", selected: true, nulls: 0 },
    { id: 2, name: "purchase_amount", type: "float", selected: true, nulls: 3 },
    { id: 3, name: "product_category", type: "string", selected: true, nulls: 0 },
    { id: 4, name: "timestamp", type: "datetime", selected: true, nulls: 1 },
    { id: 5, name: "customer_email", type: "string", selected: false, nulls: 5 },
  ]);

  const mockData = [
    { customer_id: 1001, purchase_amount: 45.99, product_category: "Electronics", timestamp: "2024-01-15 10:30" },
    { customer_id: 1002, purchase_amount: 78.50, product_category: "Clothing", timestamp: "2024-01-15 11:20" },
    { customer_id: 1003, purchase_amount: null, product_category: "Books", timestamp: "2024-01-15 12:45" },
    { customer_id: 1004, purchase_amount: 120.00, product_category: "Electronics", timestamp: null },
  ];

  const stats = {
    totalRows: 1247,
    selectedColumns: columns.filter(c => c.selected).length,
    totalNulls: columns.reduce((sum, col) => sum + col.nulls, 0),
    duplicates: 12
  };

  const toggleColumn = (id: number) => {
    setColumns(columns.map(col => 
      col.id === id ? { ...col, selected: !col.selected } : col
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              ← Dashboard
            </Button>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-secondary-purple-light flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Limpiar Datos</h1>
              <p className="text-sm text-muted-foreground">Visualiza y prepara tus datos</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="space-y-8 animate-fade-in">
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6 shadow-card bg-gradient-card border-border/50">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Filas</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalRows.toLocaleString()}</p>
              </div>
            </Card>
            <Card className="p-6 shadow-card bg-gradient-card border-border/50">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Columnas Seleccionadas</p>
                <p className="text-3xl font-bold text-primary">{stats.selectedColumns}/{columns.length}</p>
              </div>
            </Card>
            <Card className="p-6 shadow-card bg-gradient-card border-border/50">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Valores Nulos</p>
                <p className="text-3xl font-bold text-accent">{stats.totalNulls}</p>
              </div>
            </Card>
            <Card className="p-6 shadow-card bg-gradient-card border-border/50">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Duplicados</p>
                <p className="text-3xl font-bold text-destructive">{stats.duplicates}</p>
              </div>
            </Card>
          </div>

          {/* Column Selection */}
          <Card className="p-8 shadow-card bg-gradient-card border-border/50">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Selección de Columnas</h2>
                  <p className="text-sm text-muted-foreground">Elige las columnas para el entrenamiento</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filtrar
                </Button>
              </div>

              <div className="space-y-3">
                {columns.map((col) => (
                  <div 
                    key={col.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={col.selected}
                        onCheckedChange={() => toggleColumn(col.id)}
                      />
                      <div>
                        <p className="font-medium text-foreground">{col.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{col.type}</Badge>
                          {col.nulls > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {col.nulls} nulls
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Data Preview */}
          <Card className="p-8 shadow-card bg-gradient-card border-border/50">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Vista Previa de Datos</h2>
                  <p className="text-sm text-muted-foreground">Primeras 4 filas del dataset</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Exportar
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {columns.filter(c => c.selected).map((col) => (
                        <th key={col.id} className="text-left p-3 text-sm font-semibold text-foreground">
                          {col.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockData.map((row, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        {columns.filter(c => c.selected).map((col) => (
                          <td key={col.id} className="p-3 text-sm text-muted-foreground font-mono">
                            {row[col.name as keyof typeof row] ?? <span className="text-destructive">null</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/upload")}>
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
