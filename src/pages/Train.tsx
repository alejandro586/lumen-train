import { useState, useEffect } from "react";
import { Settings, ArrowRight, Play, Code2, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { trainModel, type TrainingResults } from "@/utils/mlTraining";

const Train = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { csvData, csvColumns } = useData();
  const [framework, setFramework] = useState("sklearn");
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [currentLoss, setCurrentLoss] = useState<number | null>(null);
  const [trainingResults, setTrainingResults] = useState<TrainingResults | null>(null);

  useEffect(() => {
    if (!csvData || !csvColumns) {
      toast({
        title: "Sin datos",
        description: "Por favor sube y limpia un archivo CSV primero",
        variant: "destructive",
      });
      navigate("/upload");
    }
  }, [csvData, csvColumns, navigate, toast]);

  const [config, setConfig] = useState({
    modelType: "random_forest",
    testSize: 0.2,
    randomState: 42,
    epochs: 100,
    batchSize: 32,
    learningRate: 0.001,
  });

  const handleTrain = async () => {
    const selectedColumns = csvColumns?.filter((c) => c.selected) || [];

    if (!csvData || csvData.length === 0 || selectedColumns.length === 0) {
      toast({
        title: "Datos insuficientes",
        description: "Los datos no se pueden procesar o entrenar por motivos de falta de datos",
        variant: "destructive",
      });
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    setCurrentEpoch(0);
    setCurrentLoss(null);
    setTrainingResults(null);

    toast({
      title: "🚀 Entrenamiento real iniciado",
      description: `Modelo ${config.modelType} con ${framework} usando ${csvData?.length} filas y ${selectedColumns.length} columnas`,
    });

    try {
      const results = await trainModel(
        csvData,
        selectedColumns,
        {
          ...config,
          framework
        },
        {
          onProgress: (progress) => {
            setTrainingProgress(progress);
          },
          onEpochEnd: (epoch, logs) => {
            setCurrentEpoch(epoch + 1);
            setCurrentLoss(logs?.loss);
          },
          onComplete: (results) => {
            setTrainingResults(results);
            toast({
              title: "✅ Entrenamiento completado",
              description: `Precisión: ${results.accuracy.toFixed(2)}% - Tiempo: ${results.trainTime.toFixed(2)}s`,
            });
            setTimeout(() => {
              navigate("/results");
            }, 2000);
          }
        }
      );
    } catch (error) {
      console.error('Error en entrenamiento:', error);
      toast({
        title: "❌ Error en entrenamiento",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
      setIsTraining(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark text-foreground relative overflow-hidden">
      {/* Fondo decorativo futurista */}
      <div className="absolute inset-0 bg-gradient-glow opacity-30"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-cyber opacity-20 rounded-full blur-3xl animate-pulse-glow"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-neon opacity-20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-gradient-ice opacity-15 rounded-full blur-3xl"></div>
      
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/30 bg-card/40 backdrop-blur-2xl shadow-neon">
        <div className="container mx-auto px-6 py-5 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2 hover:text-primary hover:shadow-glow transition-all duration-300"
          >
            ← Dashboard
          </Button>

          <div className="w-14 h-14 rounded-2xl bg-gradient-cyber flex items-center justify-center shadow-glow-lg animate-pulse-glow">
            <Settings className="w-7 h-7 text-primary-foreground" />
          </div>

          <div>
            <h1 className="text-3xl font-bold bg-gradient-cyber bg-clip-text text-transparent animate-glow">
              Entrenamiento de Modelos
            </h1>
            <p className="text-sm text-muted-foreground">
              Configura, ajusta y entrena tus modelos ML con IA real
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">

          {/* Dataset Info */}
          {csvData && csvColumns && (
            <Card className="p-6 bg-gradient-card border border-primary/40 shadow-card-hover hover:shadow-glow-lg transition-all duration-500 animate-slide-up">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-ice flex items-center justify-center shadow-glow animate-float">
                  <FileText className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground text-glow">Dataset para Entrenamiento</h3>
                  <p className="text-sm text-muted-foreground">{csvData?.length.toLocaleString()} muestras × {csvColumns?.filter(c => c.selected).length} features</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-gradient-card-hover border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Filas</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{csvData.length.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-card-hover border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Columnas Activas</p>
                  <p className="text-2xl font-bold text-primary mt-1">{csvColumns.filter(c => c.selected).length}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-card-hover border border-accent/20 hover:border-accent/40 transition-all duration-300 hover:scale-105">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Set Entrenamiento</p>
                  <p className="text-2xl font-bold text-accent mt-1">{Math.floor(csvData.length * 0.8).toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-card-hover border border-border/20 hover:border-border/40 transition-all duration-300 hover:scale-105">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Set Prueba</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{(csvData.length - Math.floor(csvData.length * 0.8)).toLocaleString()}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Framework Selector */}
          <Card className="p-8 border border-primary/30 bg-gradient-card shadow-glow hover:shadow-glow-lg transition-all duration-500 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-neon flex items-center justify-center shadow-neon animate-pulse-glow">
                <Code2 className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-glow">Framework de ML</h2>
                <p className="text-sm text-muted-foreground">
                  Selecciona el motor de entrenamiento neuronal
                </p>
              </div>
            </div>

            <Tabs
              value={framework}
              onValueChange={setFramework}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 bg-muted/20 rounded-xl p-1 border border-primary/20">
                <TabsTrigger value="sklearn" className="data-[state=active]:bg-gradient-cyber data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all duration-300">Scikit-Learn</TabsTrigger>
                <TabsTrigger value="pytorch" className="data-[state=active]:bg-gradient-fire data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all duration-300">PyTorch</TabsTrigger>
                <TabsTrigger value="tensorflow" className="data-[state=active]:bg-gradient-forest data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all duration-300">TensorFlow</TabsTrigger>
              </TabsList>

              {/* SKLEARN */}
              <TabsContent value="sklearn" className="space-y-8 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Tipo de Modelo</Label>
                    <Select
                      value={config.modelType}
                      onValueChange={(v) =>
                        setConfig({ ...config, modelType: v })
                      }
                    >
                      <SelectTrigger className="bg-card/60 backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="random_forest">Random Forest</SelectItem>
                        <SelectItem value="gradient_boosting">Gradient Boosting</SelectItem>
                        <SelectItem value="svm">SVM</SelectItem>
                        <SelectItem value="logistic_regression">Logistic Regression</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Test Size: {config.testSize}</Label>
                    <Slider
                      value={[config.testSize]}
                      onValueChange={([v]) => setConfig({ ...config, testSize: v })}
                      min={0.1}
                      max={0.5}
                      step={0.05}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Random State</Label>
                    <Input
                      type="number"
                      value={config.randomState}
                      onChange={(e) =>
                        setConfig({ ...config, randomState: parseInt(e.target.value) })
                      }
                      className="bg-card/60 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* PYTORCH */}
              <TabsContent value="pytorch" className="space-y-8 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Arquitectura</Label>
                    <Select defaultValue="feedforward">
                      <SelectTrigger className="bg-card/60 backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feedforward">Feedforward NN</SelectItem>
                        <SelectItem value="cnn">CNN</SelectItem>
                        <SelectItem value="rnn">RNN</SelectItem>
                        <SelectItem value="transformer">Transformer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Épocas</Label>
                    <Input
                      type="number"
                      value={config.epochs}
                      onChange={(e) =>
                        setConfig({ ...config, epochs: parseInt(e.target.value) })
                      }
                      className="bg-card/60 backdrop-blur-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Batch Size</Label>
                    <Input
                      type="number"
                      value={config.batchSize}
                      onChange={(e) =>
                        setConfig({ ...config, batchSize: parseInt(e.target.value) })
                      }
                      className="bg-card/60 backdrop-blur-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Learning Rate</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={config.learningRate}
                      onChange={(e) =>
                        setConfig({ ...config, learningRate: parseFloat(e.target.value) })
                      }
                      className="bg-card/60 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* TENSORFLOW */}
              <TabsContent value="tensorflow" className="space-y-8 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Modelo</Label>
                    <Select defaultValue="sequential">
                      <SelectTrigger className="bg-card/60 backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sequential">Sequential</SelectItem>
                        <SelectItem value="functional">Functional API</SelectItem>
                        <SelectItem value="keras">Keras Model</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Optimizer</Label>
                    <Select defaultValue="adam">
                      <SelectTrigger className="bg-card/60 backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adam">Adam</SelectItem>
                        <SelectItem value="sgd">SGD</SelectItem>
                        <SelectItem value="rmsprop">RMSprop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Épocas</Label>
                    <Input
                      type="number"
                      value={config.epochs}
                      onChange={(e) =>
                        setConfig({ ...config, epochs: parseInt(e.target.value) })
                      }
                      className="bg-card/60 backdrop-blur-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Validation Split</Label>
                    <Slider defaultValue={[0.2]} min={0.1} max={0.4} step={0.05} />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Config Summary */}
          <Card className="p-7 bg-gradient-card border border-primary/30 shadow-card-hover hover:shadow-neon transition-all duration-500 animate-scale-in">
            <h3 className="font-bold text-xl mb-5 text-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow"></div>
              Resumen de Configuración
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl bg-gradient-card-hover border border-primary/20 hover:border-primary/50 transition-all duration-300">
                <p className="text-muted-foreground uppercase tracking-wider text-xs">Framework</p>
                <p className="font-bold text-primary text-lg capitalize mt-1">{framework}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-card-hover border border-accent/20 hover:border-accent/50 transition-all duration-300">
                <p className="text-muted-foreground uppercase tracking-wider text-xs">Modelo</p>
                <p className="font-bold text-accent text-lg mt-1">{config.modelType}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-card-hover border border-border/20 hover:border-border/50 transition-all duration-300">
                <p className="text-muted-foreground uppercase tracking-wider text-xs">Test Size</p>
                <p className="font-bold text-foreground text-lg mt-1">{config.testSize}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-card-hover border border-border/20 hover:border-border/50 transition-all duration-300">
                <p className="text-muted-foreground uppercase tracking-wider text-xs">Random State</p>
                <p className="font-bold text-foreground text-lg mt-1">{config.randomState}</p>
              </div>
            </div>
          </Card>

          {/* Training Progress */}
          {isTraining && (
            <Card className="p-7 bg-gradient-card border-2 border-primary shadow-neon animate-neon-pulse animate-fade-in">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-cyber flex items-center justify-center shadow-glow-lg animate-pulse">
                      <Zap className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-bold text-xl text-foreground text-glow">Entrenamiento Real en Progreso</h3>
                  </div>
                  <span className="text-4xl font-bold bg-gradient-cyber bg-clip-text text-transparent animate-glow">{Math.round(trainingProgress)}%</span>
                </div>
                
                <Progress value={trainingProgress} className="h-4 border border-primary/30" />
                
                <div className="grid grid-cols-3 gap-4 mt-5">
                  <div className="p-4 rounded-xl bg-gradient-card-hover border border-primary/30 hover:border-primary/60 transition-all duration-300">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Época Actual</p>
                    <p className="text-2xl font-bold text-primary mt-1">{currentEpoch}/{config.epochs}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-card-hover border border-accent/30 hover:border-accent/60 transition-all duration-300">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Loss</p>
                    <p className="text-2xl font-bold text-accent mt-1">
                      {currentLoss !== null ? currentLoss.toFixed(4) : '---'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-card-hover border border-border/30 hover:border-border/60 transition-all duration-300">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Framework</p>
                    <p className="text-2xl font-bold text-foreground mt-1 capitalize">{framework}</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 pt-3 text-sm text-muted-foreground">
                  <Zap className="w-5 h-5 text-primary animate-pulse" />
                  <span className="font-semibold">Entrenamiento real con TensorFlow.js</span>
                </div>
              </div>
            </Card>
          )}

          {/* Training Results */}
          {trainingResults && !isTraining && (
            <Card className="p-7 bg-gradient-card border-2 border-green-500/50 shadow-glow-lg animate-scale-in">
              <div className="space-y-5">
                <h3 className="font-bold text-2xl text-foreground flex items-center gap-3">
                  <span className="text-3xl">✅</span>
                  <span className="bg-gradient-forest bg-clip-text text-transparent">Resultados del Entrenamiento</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-xl bg-gradient-forest/10 border-2 border-green-500/40 hover:border-green-500/70 transition-all duration-300 hover:scale-105">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Precisión</p>
                    <p className="text-3xl font-bold text-green-400 mt-2 text-glow">{trainingResults.accuracy.toFixed(2)}%</p>
                  </div>
                  <div className="p-5 rounded-xl bg-gradient-card-hover border border-accent/30 hover:border-accent/60 transition-all duration-300 hover:scale-105">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Loss Final</p>
                    <p className="text-3xl font-bold text-accent mt-2">{trainingResults.loss.toFixed(4)}</p>
                  </div>
                  <div className="p-5 rounded-xl bg-gradient-card-hover border border-primary/30 hover:border-primary/60 transition-all duration-300 hover:scale-105">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Épocas</p>
                    <p className="text-3xl font-bold text-primary mt-2">{trainingResults.epochs}</p>
                  </div>
                  <div className="p-5 rounded-xl bg-gradient-card-hover border border-border/30 hover:border-border/60 transition-all duration-300 hover:scale-105">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Tiempo</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{trainingResults.trainTime.toFixed(2)}s</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Buttons */}
          <div className="flex justify-between pt-8">
            <Button
              variant="outline"
              onClick={() => navigate("/clean")}
              className="hover:bg-primary/10 hover:border-primary hover:shadow-glow transition-all duration-300 border-primary/30"
            >
              ← Volver a Limpiar
            </Button>
            <Button
              onClick={handleTrain}
              size="lg"
              className="gap-3 bg-gradient-cyber shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all duration-300 text-lg px-8 py-6"
              disabled={isTraining}
            >
              {isTraining ? (
                <>
                  <Zap className="w-5 h-5 animate-pulse" />
                  Entrenando...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Iniciar Entrenamiento
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Train;

