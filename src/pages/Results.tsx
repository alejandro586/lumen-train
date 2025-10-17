import { useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Download,
  CheckCircle2,
  Database,
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
        <Card className="p-6 border border-primary/30 bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-500">
...
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
...
        </Card>

        {/* Matriz de confusión */}
        <Card className="p-8 border border-border/50 bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-500">
...
        </Card>

        {/* Dataset */}
        <Card className="p-6 border border-border/50 bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-500">
...
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
