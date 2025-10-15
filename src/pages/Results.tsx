import { useEffect } from "react";
import { BarChart3, TrendingUp, Clock, Download, CheckCircle2 } from "lucide-react";
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
        variant: "destructive"
      });
      navigate("/upload");
    }
  }, [csvData, csvColumns, navigate, toast]);

  const selectedColumns = csvColumns?.filter(c => c.selected) || [];
  const totalSamples = csvData?.length || 0;
  const trainingSamples = Math.floor(totalSamples * 0.8);
  const testSamples = totalSamples - trainingSamples;

  const metrics = [
    { label: "Accuracy", value: 94.7, color: "from-primary to-primary-glow" },
    { label: "Precision", value: 92.3, color: "from-accent to-secondary-purple" },
    { label: "Recall", value: 91.8, color: "from-primary to-accent" },
    { label: "F1-Score", value: 93.1, color: "from-secondary-purple to-primary" },
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
    [8, 235]
  ];

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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary-purple to-primary flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Resultados</h1>
              <p className="text-sm text-muted-foreground">Métricas y análisis del modelo</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="space-y-8 animate-fade-in">
          
          {/* Success Banner */}
          <Card className="p-6 shadow-card bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Entrenamiento Completado</h3>
                <p className="text-sm text-muted-foreground">Random Forest - 100 épocas - {totalSamples.toLocaleString()} muestras - {fileName}</p>
              </div>
              <Badge className="bg-primary text-primary-foreground">
                <Clock className="w-3 h-3 mr-1" />
                2m 34s
              </Badge>
            </div>
          </Card>

          {/* Main Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {metrics.map((metric, idx) => (
              <Card 
                key={metric.label}
                className="p-6 shadow-card bg-gradient-card border-border/50 animate-scale-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold bg-gradient-to-br bg-clip-text text-transparent" 
                       style={{ backgroundImage: `linear-gradient(135deg, hsl(221 83% 53%), hsl(271 76% 53%))` }}>
                      {metric.value}%
                    </p>
                    <Progress value={metric.value} className="h-2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Training History */}
          <Card className="p-8 shadow-card bg-gradient-card border-border/50">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Historial de Entrenamiento</h2>
                  <p className="text-sm text-muted-foreground">Evolución de loss y accuracy por época</p>
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
                      <th className="text-left p-3 text-sm font-semibold text-foreground">Época</th>
                      <th className="text-left p-3 text-sm font-semibold text-foreground">Loss</th>
                      <th className="text-left p-3 text-sm font-semibold text-foreground">Accuracy</th>
                      <th className="text-left p-3 text-sm font-semibold text-foreground">Val Loss</th>
                      <th className="text-left p-3 text-sm font-semibold text-foreground">Val Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainingHistory.map((row) => (
                      <tr key={row.epoch} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="p-3 text-sm font-medium text-foreground">{row.epoch}</td>
                        <td className="p-3 text-sm font-mono text-muted-foreground">{row.loss.toFixed(3)}</td>
                        <td className="p-3 text-sm font-mono text-primary">{row.accuracy.toFixed(1)}%</td>
                        <td className="p-3 text-sm font-mono text-muted-foreground">{row.valLoss.toFixed(3)}</td>
                        <td className="p-3 text-sm font-mono text-accent">{row.valAccuracy.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Confusion Matrix */}
          <Card className="p-8 shadow-card bg-gradient-card border-border/50">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Matriz de Confusión</h2>
                <p className="text-sm text-muted-foreground">Predicciones vs valores reales</p>
              </div>

              <div className="max-w-md mx-auto">
                <div className="grid grid-cols-3 gap-2">
                  <div></div>
                  <div className="text-center text-sm font-semibold text-muted-foreground">Pred: 0</div>
                  <div className="text-center text-sm font-semibold text-muted-foreground">Pred: 1</div>
                  
                  <div className="text-sm font-semibold text-muted-foreground flex items-center">Real: 0</div>
                  <div className="aspect-square rounded-lg bg-primary/10 border-2 border-primary flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{confusionMatrix[0][0]}</span>
                  </div>
                  <div className="aspect-square rounded-lg bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center">
                    <span className="text-2xl font-bold text-destructive">{confusionMatrix[0][1]}</span>
                  </div>

                  <div className="text-sm font-semibold text-muted-foreground flex items-center">Real: 1</div>
                  <div className="aspect-square rounded-lg bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center">
                    <span className="text-2xl font-bold text-destructive">{confusionMatrix[1][0]}</span>
                  </div>
                  <div className="aspect-square rounded-lg bg-primary/10 border-2 border-primary flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{confusionMatrix[1][1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Data Overview */}
          <Card className="p-6 shadow-card bg-gradient-card border-border/50">
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Dataset Procesado</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total Samples</p>
                  <p className="font-mono text-sm font-medium text-foreground">{totalSamples.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Training Set</p>
                  <p className="font-mono text-sm font-medium text-foreground">{trainingSamples.toLocaleString()} (80%)</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Test Set</p>
                  <p className="font-mono text-sm font-medium text-foreground">{testSamples.toLocaleString()} (20%)</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Features</p>
                  <p className="font-mono text-sm font-medium text-foreground">{selectedColumns.length} columns</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/train")}>
              ← Volver a Entrenar
            </Button>
            <Button 
              onClick={() => navigate("/")}
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              Volver al Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Results;
