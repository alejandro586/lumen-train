import { useState, useEffect } from "react";
import { Settings, ArrowRight, Play, Code2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";

const Train = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { csvData, csvColumns } = useData();
  const [framework, setFramework] = useState("sklearn");
  const [isTraining, setIsTraining] = useState(false);

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

  const handleTrain = () => {
    const selectedColumns = csvColumns?.filter((c) => c.selected) || [];

    setIsTraining(true);
    toast({
      title: "Entrenamiento iniciado",
      description: `Modelo ${config.modelType} con ${framework} usando ${csvData?.length} filas y ${selectedColumns.length} columnas`,
    });

    setTimeout(() => {
      setIsTraining(false);
      toast({
        title: "Entrenamiento completado",
        description: "Revisa los resultados",
      });
      navigate("/results");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background dark text-foreground relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.12),transparent_50%)]"></div>
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/50 bg-card/30 backdrop-blur-xl shadow-lg">
        <div className="container mx-auto px-6 py-5 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2 hover:text-primary"
          >
            ← Dashboard
          </Button>

          <div className="w-12 h-12 rounded-2xl bg-gradient-cyber flex items-center justify-center shadow-glow">
            <Settings className="w-6 h-6 text-primary-foreground" />
          </div>

          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Entrenamiento de Modelos
            </h1>
            <p className="text-sm text-muted-foreground">
              Configura, ajusta y entrena tus modelos ML
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">

          {/* Framework Selector */}
          <Card className="p-8 border border-border/50 bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-cyber flex items-center justify-center shadow-glow">
                <Code2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Framework de ML</h2>
                <p className="text-sm text-muted-foreground">
                  Selecciona el motor de entrenamiento
                </p>
              </div>
            </div>

            <Tabs
              value={framework}
              onValueChange={setFramework}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 bg-muted/40 rounded-lg">
                <TabsTrigger value="sklearn">Scikit-Learn</TabsTrigger>
                <TabsTrigger value="pytorch">PyTorch</TabsTrigger>
                <TabsTrigger value="tensorflow">TensorFlow</TabsTrigger>
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
          <Card className="p-6 bg-gradient-card border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-500">
...
          </Card>

          {/* Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => navigate("/clean")}
              className="hover:bg-primary/10 hover:border-primary transition-all"
            >
              ← Volver a Limpiar
            </Button>
            <Button
              onClick={handleTrain}
              size="lg"
              className="gap-2 bg-gradient-primary shadow-card hover:opacity-90 hover:shadow-glow transition-all"
              disabled={isTraining}
            >
              {isTraining ? "Entrenando..." : (
                <>
                  <Play className="w-4 h-4" />
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

