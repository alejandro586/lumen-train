import { useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Download,
  CheckCircle2,
  Database,
  Columns,
  FileText,
  Share2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";

const Results = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { csvData, csvColumns, fileName } = useData();

  useEffect(() => {
    if (!csvData || !csvColumns) {
      toast({
        title: "Sin datos",
        description: "Por favor completa el flujo de entrenamiento primero",
        variant: "destructive",
      });
      navigate("/upload");
    }
  }, [csvData, csvColumns, navigate, toast]);

  const selectedColumns = csvColumns?.filter((c) => c.selected) || [];
  const totalSamples = csvData?.length || 0;
  const trainingSamples = Math.floor(totalSamples * 0.8);
  const testSamples = totalSamples - trainingSamples;

  const metrics = [
    { label: "Accuracy", value: 94.7 },
    { label: "Precision", value: 92.3 },
    { label: "Recall", value: 91.8 },
    { label: "F1-Score", value: 93.1 },
  ];

  const trainingHistory = [
    { epoch: 1, loss: 0.543, accuracy: 78.2, valLoss: 0.489, valAccuracy: 81.3 },
    { epoch: 25, loss: 0.234, accuracy: 89.7, valLoss: 0.256, valAccuracy: 87.9 },
    { epoch: 50, loss: 0.142, accuracy: 93.4, valLoss: 0.178, valAccuracy: 91.2 },
    { epoch: 75, loss: 0.098, accuracy: 95.1, valLoss: 0.134, valAccuracy: 93.5 },
    { epoch: 100, loss: 0.067, accuracy: 96.3, valLoss: 0.112, valAccuracy: 94.7 },
  ];

  const confusionMatrix = [
    [245, 12],
    [8, 235],
  ];

  return (
    <div className="min-h-screen bg-background dark text-foreground relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.12),transparent_60%)]"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse"></div>
      
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card/30 backdrop-blur-xl border-b border-border/50 shadow-lg">
        <div className="container mx-auto px-6 py-5 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="hover:text-primary transition-colors"
          >
            ← Dashboard
          </Button>

          <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <BarChart3 className="w-6 h-6 text-primary-foreground" />
          </div>

          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Resultados del Modelo
            </h1>
            <p className="text-sm text-muted-foreground">
              Métricas y análisis del entrenamiento
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-6 py-10 space-y-10 animate-fade-in relative z-10">
        {/* Banner */}
        <Card className="p-6 bg-gradient-primary border-none shadow-glow animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">
                ¡Entrenamiento Exitoso!
              </h2>
              <p className="text-white/80">
                Tu modelo ha sido entrenado y está listo para usar
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="lg"
                className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Download className="w-5 h-5" />
                Descargar
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Share2 className="w-5 h-5" />
                Compartir
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/train")}
                className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RefreshCw className="w-5 h-5" />
                Re-entrenar
              </Button>
            </div>
          </div>
        </Card>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {metrics.map((metric, i) => (
            <Card
              key={metric.label}
              className="p-6 border border-border/50 bg-gradient-card backdrop-blur-sm hover:scale-[1.05] hover:-translate-y-1 transition-all duration-500 shadow-card animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {metric.value}%
                </h3>
                <Progress value={metric.value} className="h-2" />
              </div>
            </Card>
          ))}
        </div>

        {/* Historial */}
        <Card className="p-8 border border-border/50 bg-gradient-card backdrop-blur-sm shadow-card hover:shadow-card-hover transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Historial de Entrenamiento</h2>
              <p className="text-sm text-muted-foreground">
                Evolución del loss y accuracy por época
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 hover:bg-primary/10">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border/20">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-primary/10 to-accent/10">
                <tr>
                  {["Época", "Loss", "Accuracy", "Val Loss", "Val Accuracy"].map((head) => (
                    <th
                      key={head}
                      className="text-left p-3 font-semibold text-foreground"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trainingHistory.map((row) => (
                  <tr
                    key={row.epoch}
                    className="border-t border-border/30 hover:bg-primary/5 transition-colors"
                  >
                    <td className="p-3">{row.epoch}</td>
                    <td className="p-3 text-muted-foreground">{row.loss.toFixed(3)}</td>
                    <td className="p-3 text-primary font-semibold">
                      {row.accuracy.toFixed(1)}%
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {row.valLoss.toFixed(3)}
                    </td>
                    <td className="p-3 text-accent font-semibold">
                      {row.valAccuracy.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Matriz de confusión */}
        <Card className="p-8 border border-border/50 bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-500">
          <h2 className="text-xl font-semibold mb-2">Matriz de Confusión</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Comparación entre predicciones y valores reales
          </p>

          <div className="max-w-md mx-auto grid grid-cols-3 gap-2 text-center">
            <div></div>
            <div className="font-semibold text-muted-foreground">Pred: 0</div>
            <div className="font-semibold text-muted-foreground">Pred: 1</div>

            <div className="font-semibold text-muted-foreground">Real: 0</div>
            <div className="aspect-square rounded-xl bg-primary/10 border border-primary/50 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">{confusionMatrix[0][0]}</span>
            </div>
            <div className="aspect-square rounded-xl bg-destructive/10 border border-destructive/40 flex items-center justify-center">
              <span className="text-lg font-bold text-destructive">{confusionMatrix[0][1]}</span>
            </div>

            <div className="font-semibold text-muted-foreground">Real: 1</div>
            <div className="aspect-square rounded-xl bg-destructive/10 border border-destructive/40 flex items-center justify-center">
              <span className="text-lg font-bold text-destructive">{confusionMatrix[1][0]}</span>
            </div>
            <div className="aspect-square rounded-xl bg-primary/10 border border-primary/50 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">{confusionMatrix[1][1]}</span>
            </div>
          </div>
        </Card>

        {/* Dataset */}
        <Card className="p-8 border border-border/50 bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-500">
          <h3 className="font-semibold mb-6 flex items-center gap-2 text-xl">
            <Database className="w-5 h-5 text-primary" /> Dataset Procesado y Utilizado
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="p-4 rounded-xl bg-card/50 border border-border/30">
              <p className="text-sm text-muted-foreground mb-1">Total Samples</p>
              <p className="text-2xl font-bold text-foreground">{totalSamples.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-card/50 border border-border/30">
              <p className="text-sm text-muted-foreground mb-1">Training Set</p>
              <p className="text-2xl font-bold text-primary">{trainingSamples.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">80%</p>
            </div>
            <div className="p-4 rounded-xl bg-card/50 border border-border/30">
              <p className="text-sm text-muted-foreground mb-1">Test Set</p>
              <p className="text-2xl font-bold text-accent">{testSamples.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">20%</p>
            </div>
            <div className="p-4 rounded-xl bg-card/50 border border-border/30">
              <p className="text-sm text-muted-foreground mb-1">Features</p>
              <p className="text-2xl font-bold text-foreground">{selectedColumns.length}</p>
              <p className="text-xs text-muted-foreground">columnas activas</p>
            </div>
          </div>

          {/* Data Sample */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Columns className="w-4 h-4" /> Muestra de Datos Utilizados
            </h4>
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="border-b border-border/30">
                    <th className="text-left p-3 font-semibold">#</th>
                    {selectedColumns.slice(0, 5).map((col) => (
                      <th key={col.id} className="text-left p-3 font-semibold">
                        <div className="flex flex-col gap-1">
                          <span>{col.name}</span>
                          <Badge variant="outline" className="text-xs w-fit">{col.type}</Badge>
                        </div>
                      </th>
                    ))}
                    {selectedColumns.length > 5 && (
                      <th className="text-left p-3 font-semibold text-muted-foreground">
                        +{selectedColumns.length - 5} más
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {csvData?.slice(0, 8).map((row, idx) => (
                    <tr key={idx} className="border-b border-border/20 hover:bg-primary/5 transition-colors">
                      <td className="p-3 font-semibold text-muted-foreground">{idx + 1}</td>
                      {selectedColumns.slice(0, 5).map((col) => (
                        <td key={col.id} className="p-3 font-mono text-foreground">
                          {row[col.name] ?? <span className="text-destructive">null</span>}
                        </td>
                      ))}
                      {selectedColumns.length > 5 && (
                        <td className="p-3 text-muted-foreground">...</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {csvData && csvData.length > 8 && (
              <p className="text-sm text-muted-foreground text-center">
                ... y {(csvData.length - 8).toLocaleString()} filas más usadas en el entrenamiento
              </p>
            )}
          </div>
        </Card>

        {/* Botones */}
        <div className="flex justify-between items-center pt-6">
          <Button variant="outline" onClick={() => navigate("/train")} className="hover:bg-primary/10 hover:border-primary transition-all">
            ← Reentrenar
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-primary shadow-card hover:opacity-90 hover:shadow-glow transition-all"
          >
            Volver al Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Results;
