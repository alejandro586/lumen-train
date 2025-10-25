import { useState, useEffect, useMemo, useCallback } from "react";
import { Settings, ArrowRight, Play, Code2, FileText, Zap, RefreshCw } from "lucide-react";
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

// Tabs con configuración funcional
const SklearnTab = ({ config, setConfig }: { config: any; setConfig: any }) => (
  <div className="space-y-8 mt-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label>Tipo de Modelo</Label>
        <Select value={config.modelType} onValueChange={(val) => setConfig({ ...config, modelType: val })}>
          <SelectTrigger className="bg-card/60 backdrop-blur-sm border-primary/30">
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
          onValueChange={(val) => setConfig({ ...config, testSize: val[0] })} 
          min={0.1} 
          max={0.5} 
          step={0.05} 
          className="cursor-pointer"
        />
      </div>
      <div className="space-y-2">
        <Label>Random State</Label>
        <Input 
          type="number" 
          value={config.randomState} 
          onChange={(e) => setConfig({ ...config, randomState: parseInt(e.target.value) || 42 })} 
          className="bg-card/60 backdrop-blur-sm border-primary/30" 
        />
      </div>
    </div>
  </div>
);
const PytorchTab = ({ config, setConfig }: { config: any; setConfig: any }) => (
  <div className="space-y-8 mt-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label>Arquitectura</Label>
        <Select value={config.architecture} onValueChange={(val) => setConfig({ ...config, architecture: val })}>
          <SelectTrigger className="bg-card/60 backdrop-blur-sm border-primary/30">
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
          onChange={(e) => setConfig({ ...config, epochs: parseInt(e.target.value) || 10 })} 
          className="bg-card/60 backdrop-blur-sm border-primary/30" 
        />
      </div>
      <div className="space-y-2">
        <Label>Batch Size</Label>
        <Input 
          type="number" 
          value={config.batchSize} 
          onChange={(e) => setConfig({ ...config, batchSize: parseInt(e.target.value) || 32 })} 
          className="bg-card/60 backdrop-blur-sm border-primary/30" 
        />
      </div>
      <div className="space-y-2">
        <Label>Learning Rate</Label>
        <Input 
          type="number" 
          step="0.0001" 
          value={config.learningRate} 
          onChange={(e) => setConfig({ ...config, learningRate: parseFloat(e.target.value) || 0.001 })} 
          className="bg-card/60 backdrop-blur-sm border-primary/30" 
        />
      </div>
    </div>
  </div>
);
const TensorflowTab = ({ config, setConfig }: { config: any; setConfig: any }) => (
  <div className="space-y-8 mt-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label>Modelo</Label>
        <Select value={config.tfModel} onValueChange={(val) => setConfig({ ...config, tfModel: val })}>
          <SelectTrigger className="bg-card/60 backdrop-blur-sm border-primary/30">
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
        <Select value={config.optimizer} onValueChange={(val) => setConfig({ ...config, optimizer: val })}>
          <SelectTrigger className="bg-card/60 backdrop-blur-sm border-primary/30">
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
          onChange={(e) => setConfig({ ...config, epochs: parseInt(e.target.value) || 10 })} 
          className="bg-card/60 backdrop-blur-sm border-primary/30" 
        />
      </div>
      <div className="space-y-2">
        <Label>Validation Split: {config.validationSplit}</Label>
        <Slider 
          value={[config.validationSplit]} 
          onValueChange={(val) => setConfig({ ...config, validationSplit: val[0] })} 
          min={0.1} 
          max={0.4} 
          step={0.05} 
          className="cursor-pointer"
        />
      </div>
    </div>
  </div>
);

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
  const [fastMode, setFastMode] = useState(true); // Toggle para mock rápido

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
    architecture: "feedforward",
    tfModel: "sequential",
    optimizer: "adam",
    validationSplit: 0.2,
    testSize: 0.2,
    randomState: 42,
    epochs: fastMode ? 10 : 100,
    batchSize: 32,
    learningRate: 0.001,
  });

  const selectedColumns = useMemo(() => csvColumns?.filter((c) => c.selected) || [], [csvColumns]);

  const handleTrain = useCallback(async () => {
    if (!csvData || csvData.length === 0 || selectedColumns.length < 2) {
      toast({
        title: "Datos insuficientes",
        description: "Selecciona al menos 1 feature y 1 target column para entrenar",
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
      title: "🚀 Entrenamiento iniciado",
      description: `Fast mode: ${fastMode ? 'Simulación rápida' : 'Real'}`,
    });

    if (fastMode) {
      // Mock rápido: 2s simulación con interval
      const interval = setInterval(() => {
        setTrainingProgress(prev => {
          const newProg = prev + Math.random() * 20;
          if (newProg >= 100) {
            clearInterval(interval);
            setIsTraining(false);
            const mockResults: TrainingResults = { 
              accuracy: 85 + Math.random() * 10, 
              trainTime: 2, 
              epochs: 10, 
              loss: 0.1,
              valAccuracy: 85 + Math.random() * 10,
              valLoss: 0.1,
              model: null as any
            };
            setTrainingResults(mockResults);
            toast({ title: "✅ Completado rápido", description: `Precisión simulada: ${mockResults.accuracy.toFixed(2)}%` });
            setTimeout(() => navigate("/results"), 1000);
            return 100;
          }
          setCurrentEpoch(prevEpoch => prevEpoch + 1);
          setCurrentLoss(1 - (newProg / 100));
          return newProg;
        });
      }, 100); // Actualiza cada 100ms para smooth
      return;
    }

    try {
      const results = await trainModel(
        csvData,
        selectedColumns,
        { ...config, framework },
        {
          onProgress: setTrainingProgress,
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
            setTimeout(() => navigate("/results"), 2000);
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
  }, [csvData, selectedColumns, config, framework, fastMode, toast, navigate]);

  // Dataset Info memoizado
  const datasetInfo = useMemo(() => {
    if (!csvData || !csvColumns) return null;
    const selectedCount = selectedColumns.length;
    return (
      <Card className="p-6 bg-gradient-card border border-primary/40 shadow-card">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-ice flex items-center justify-center shadow-glow">
            <FileText className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Dataset para Entrenamiento</h3>
            <p className="text-sm text-muted-foreground">{csvData.length.toLocaleString()} muestras × {selectedCount} features</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-gradient-card-hover border border-primary/20">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Filas</p>
            <p className="text-2xl font-bold text-foreground mt-1">{csvData.length.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-card-hover border border-primary/20">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Columnas Activas</p>
            <p className="text-2xl font-bold text-primary mt-1">{selectedCount}</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-card-hover border border-accent/20">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Set Entrenamiento</p>
            <p className="text-2xl font-bold text-accent mt-1">{Math.floor(csvData.length * 0.8).toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-card-hover border border-border/20">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Set Prueba</p>
            <p className="text-2xl font-bold text-foreground mt-1">{(csvData.length - Math.floor(csvData.length * 0.8)).toLocaleString()}</p>
          </div>
        </div>
      </Card>
    );
  }, [csvData, csvColumns, selectedColumns]);

  // Config Summary
  const configSummary = useMemo(() => (
    <Card className="p-7 bg-gradient-card border border-primary/30 shadow-card">
      <h3 className="font-bold text-xl mb-5 text-foreground flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary"></div>
        Resumen de Configuración
      </h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-4 rounded-xl bg-gradient-card-hover border border-primary/20">
          <p className="text-muted-foreground uppercase tracking-wider text-xs">Framework</p>
          <p className="font-bold text-primary text-lg capitalize mt-1">{framework}</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-card-hover border border-accent/20">
          <p className="text-muted-foreground uppercase tracking-wider text-xs">Modelo</p>
          <p className="font-bold text-accent text-lg mt-1">
            {framework === 'sklearn' ? config.modelType : 
             framework === 'pytorch' ? config.architecture : config.tfModel}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-card-hover border border-border/20">
          <p className="text-muted-foreground uppercase tracking-wider text-xs">Test Size</p>
          <p className="font-bold text-foreground text-lg mt-1">{config.testSize}</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-card-hover border border-border/20">
          <p className="text-muted-foreground uppercase tracking-wider text-xs">Random State</p>
          <p className="font-bold text-foreground text-lg mt-1">{config.randomState}</p>
        </div>
      </div>
    </Card>
  ), [framework, config]);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      {/* Header simplificado */}
      <header className="sticky top-0 z-10 border-b border-border/30 bg-card/40 backdrop-blur-2xl">
        <div className="container mx-auto px-6 py-5 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2 hover:text-primary transition-all duration-300"
          >
            ← Dashboard
          </Button>
          <div className="w-14 h-14 rounded-2xl bg-gradient-cyber flex items-center justify-center shadow-glow">
            <Settings className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
              Entrenamiento de Modelos
            </h1>
            <p className="text-sm text-muted-foreground">
              Configura, ajusta y entrena tus modelos ML con IA real
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-5xl mx-auto space-y-10">
          {datasetInfo}

          {/* Framework Selector */}
          <Card className="p-8 border border-primary/30 bg-gradient-card shadow-glow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-neon flex items-center justify-center shadow-neon">
                <Code2 className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Framework de ML</h2>
                <p className="text-sm text-muted-foreground">
                  Selecciona el motor de entrenamiento neuronal
                </p>
              </div>
            </div>

            <Tabs value={framework} onValueChange={setFramework} className="w-full">
              <TabsList className="grid grid-cols-3 bg-muted/20 rounded-xl p-1 border border-primary/20">
                <TabsTrigger value="sklearn" className="data-[state=active]:bg-gradient-cyber data-[state=active]:text-primary-foreground transition-all duration-300">Scikit-Learn</TabsTrigger>
                <TabsTrigger value="pytorch" className="data-[state=active]:bg-gradient-fire data-[state=active]:text-primary-foreground transition-all duration-300">PyTorch</TabsTrigger>
                <TabsTrigger value="tensorflow" className="data-[state=active]:bg-gradient-forest data-[state=active]:text-primary-foreground transition-all duration-300">TensorFlow</TabsTrigger>
              </TabsList>
              <TabsContent value="sklearn" className="mt-6"><SklearnTab config={config} setConfig={setConfig} /></TabsContent>
              <TabsContent value="pytorch" className="mt-6"><PytorchTab config={config} setConfig={setConfig} /></TabsContent>
              <TabsContent value="tensorflow" className="mt-6"><TensorflowTab config={config} setConfig={setConfig} /></TabsContent>
            </Tabs>
          </Card>

          {configSummary}

          {/* Fast Mode Toggle */}
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <Button variant="outline" size="sm" onClick={() => setFastMode(!fastMode)}>
              {fastMode ? '🚀 Modo Rápido (Mock)' : '🧠 Modo Real'}
            </Button>
            <p className="text-sm text-muted-foreground self-center">Modo rápido simula en 2s para pruebas</p>
          </div>

          {/* Training Progress */}
          {isTraining && (
            <Card className="p-7 bg-gradient-card border-2 border-primary shadow-neon">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-cyber flex items-center justify-center shadow-glow animate-pulse">
                      <Zap className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-bold text-xl text-foreground">Entrenamiento en Progreso</h3>
                  </div>
                  <span className="text-4xl font-bold bg-gradient-cyber bg-clip-text text-transparent">{Math.round(trainingProgress)}%</span>
                </div>
                
                <Progress value={trainingProgress} className="h-4 border border-primary/30" />
                
                <div className="grid grid-cols-3 gap-4 mt-5">
                  <div className="p-4 rounded-xl bg-gradient-card-hover border border-primary/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Época Actual</p>
                    <p className="text-2xl font-bold text-primary mt-1">{currentEpoch}/{config.epochs}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-card-hover border border-accent/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Loss</p>
                    <p className="text-2xl font-bold text-accent mt-1">
                      {currentLoss !== null ? currentLoss.toFixed(4) : '---'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-card-hover border border-border/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Framework</p>
                    <p className="text-2xl font-bold text-foreground mt-1 capitalize">{framework}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Training Results */}
          {trainingResults && !isTraining && (
            <Card className="p-7 bg-gradient-card border-2 border-green-500/50 shadow-glow">
              <div className="space-y-5">
                <h3 className="font-bold text-2xl text-foreground flex items-center gap-3">
                  <span className="text-3xl">✅</span>
                  <span className="bg-gradient-forest bg-clip-text text-transparent">Resultados del Entrenamiento</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-xl bg-gradient-forest/10 border-2 border-green-500/40">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Precisión</p>
                    <p className="text-3xl font-bold text-green-400 mt-2">{trainingResults.accuracy.toFixed(2)}%</p>
                  </div>
                  <div className="p-5 rounded-xl bg-gradient-card-hover border border-accent/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Loss Final</p>
                    <p className="text-3xl font-bold text-accent mt-2">{trainingResults.loss?.toFixed(4) || 'N/A'}</p>
                  </div>
                  <div className="p-5 rounded-xl bg-gradient-card-hover border border-primary/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Épocas</p>
                    <p className="text-3xl font-bold text-primary mt-2">{trainingResults.epochs || config.epochs}</p>
                  </div>
                  <div className="p-5 rounded-xl bg-gradient-card-hover border border-border/30">
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
              className="hover:bg-primary/10 hover:border-primary transition-all border-primary/30"
            >
              ← Volver a Limpiar
            </Button>
            <Button
              onClick={handleTrain}
              size="lg"
              className="gap-3 bg-gradient-neon shadow-glow hover:shadow-neon hover:scale-110 transition-all duration-500 text-lg font-bold px-10 py-7 disabled:opacity-50 rounded-xl animate-pulse-glow"
              disabled={isTraining || selectedColumns.length < 2}
            >
              {isTraining ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  Entrenando...
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" />
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
