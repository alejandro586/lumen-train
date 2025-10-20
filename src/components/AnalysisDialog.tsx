import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, PieChart, TrendingUp, AlertCircle } from "lucide-react";

interface AnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any[];
  columns: Array<{ id: number; name: string; type: string; selected: boolean; nulls: number }>;
}

export const AnalysisDialog = ({ open, onOpenChange, data, columns }: AnalysisDialogProps) => {
  // Calcular estadísticas
  const totalRows = data.length;
  const totalColumns = columns.length;
  const selectedColumns = columns.filter(c => c.selected).length;
  const totalNulls = columns.reduce((sum, col) => sum + col.nulls, 0);
  const completeness = ((totalRows * totalColumns - totalNulls) / (totalRows * totalColumns) * 100).toFixed(2);

  // Calcular estadísticas por tipo de columna
  const numericColumns = columns.filter(c => c.type === "float" || c.type === "int");
  const stringColumns = columns.filter(c => c.type === "string");

  // Obtener estadísticas numéricas
  const numericStats = numericColumns.map(col => {
    const values = data
      .map(row => row[col.name])
      .filter(val => val !== null && val !== undefined && val !== "")
      .map(val => Number(val));

    if (values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const sortedValues = [...values].sort((a, b) => a - b);
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];
    const median = sortedValues[Math.floor(sortedValues.length / 2)];

    return {
      name: col.name,
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      min: min.toFixed(2),
      max: max.toFixed(2),
      count: values.length,
    };
  }).filter(Boolean);

  // Obtener valores únicos de columnas string
  const categoricalStats = stringColumns.slice(0, 3).map(col => {
    const values = data
      .map(row => row[col.name])
      .filter(val => val !== null && val !== undefined && val !== "");
    
    const uniqueValues = [...new Set(values)];
    const valueCounts = uniqueValues.map(val => ({
      value: val,
      count: values.filter(v => v === val).length
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    return {
      name: col.name,
      unique: uniqueValues.length,
      topValues: valueCounts,
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <BarChart3 className="w-6 h-6 text-primary" />
            Análisis de Datos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Resumen General */}
          <Card className="p-5 bg-gradient-card border-primary/30">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Resumen General
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Registros</p>
                <p className="text-2xl font-bold text-primary">{totalRows.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Columnas</p>
                <p className="text-2xl font-bold text-accent">{totalColumns}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Valores Nulos</p>
                <p className="text-2xl font-bold text-destructive">{totalNulls}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Completitud</p>
                <p className="text-2xl font-bold text-foreground">{completeness}%</p>
              </div>
            </div>
          </Card>

          {/* Estadísticas Numéricas */}
          {numericStats.length > 0 && (
            <Card className="p-5 bg-card">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Columnas Numéricas
              </h3>
              <div className="space-y-3">
                {numericStats.map((stat: any, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <p className="font-semibold text-foreground mb-2">{stat.name}</p>
                    <div className="grid grid-cols-5 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Media</p>
                        <p className="font-semibold text-primary">{stat.mean}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Mediana</p>
                        <p className="font-semibold">{stat.median}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Mínimo</p>
                        <p className="font-semibold">{stat.min}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Máximo</p>
                        <p className="font-semibold">{stat.max}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Registros</p>
                        <p className="font-semibold">{stat.count}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Estadísticas Categóricas */}
          {categoricalStats.length > 0 && (
            <Card className="p-5 bg-card">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Columnas Categóricas
              </h3>
              <div className="space-y-3">
                {categoricalStats.map((stat, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-foreground">{stat.name}</p>
                      <Badge variant="secondary">{stat.unique} valores únicos</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground mb-2">Top 5 valores:</p>
                      {stat.topValues.map((val: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{val.value}</span>
                          <Badge variant="outline" className="ml-2">{val.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Calidad de Datos */}
          <Card className="p-5 bg-card">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Calidad de Datos
            </h3>
            <div className="space-y-2">
              {columns.map(col => (
                <div key={col.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-foreground">{col.name}</span>
                    <Badge variant="outline">{col.type}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {col.nulls > 0 ? (
                      <Badge variant="destructive">{col.nulls} nulos</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-400">
                        Sin nulos
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
