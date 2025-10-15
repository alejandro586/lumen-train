import { useState, useEffect } from "react";
import { Settings, ArrowRight, Play, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        variant: "destructive"
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
    learningRate: 0.001
  });

  const handleTrain = () => {
    const selectedColumns = csvColumns?.filter(c => c.selected) || [];
    
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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Entrenar Modelos</h1>
              <p className="text-sm text-muted-foreground">Configura y entrena tu modelo ML</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
          
          {/* Framework Selection */}
          <Card className="p-8 shadow-card bg-gradient-card border-border/50">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Code2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Framework de ML</h2>
                  <p className="text-sm text-muted-foreground">Selecciona la herramienta de entrenamiento</p>
                </div>
              </div>

              <Tabs value={framework} onValueChange={setFramework} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="sklearn">Scikit-Learn</TabsTrigger>
                  <TabsTrigger value="pytorch">PyTorch</TabsTrigger>
                  <TabsTrigger value="tensorflow">TensorFlow</TabsTrigger>
                </TabsList>

                <TabsContent value="sklearn" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Tipo de Modelo</Label>
                      <Select value={config.modelType} onValueChange={(v) => setConfig({...config, modelType: v})}>
                        <SelectTrigger>
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
                        onValueChange={([v]) => setConfig({...config, testSize: v})}
                        min={0.1}
                        max={0.5}
                        step={0.05}
                        className="mt-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Random State</Label>
                      <Input 
                        type="number" 
                        value={config.randomState}
                        onChange={(e) => setConfig({...config, randomState: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pytorch" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Arquitectura</Label>
                      <Select defaultValue="feedforward">
                        <SelectTrigger>
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
                        onChange={(e) => setConfig({...config, epochs: parseInt(e.target.value)})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Batch Size</Label>
                      <Input 
                        type="number" 
                        value={config.batchSize}
                        onChange={(e) => setConfig({...config, batchSize: parseInt(e.target.value)})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Learning Rate</Label>
                      <Input 
                        type="number" 
                        step="0.0001"
                        value={config.learningRate}
                        onChange={(e) => setConfig({...config, learningRate: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tensorflow" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Modelo</Label>
                      <Select defaultValue="sequential">
                        <SelectTrigger>
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
                        <SelectTrigger>
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
                        onChange={(e) => setConfig({...config, epochs: parseInt(e.target.value)})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Validation Split</Label>
                      <Slider 
                        defaultValue={[0.2]} 
                        min={0.1}
                        max={0.4}
                        step={0.05}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Card>

          {/* Training Configuration Summary */}
          <Card className="p-6 shadow-card bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Configuración Actual</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Framework</p>
                  <p className="font-mono text-sm font-medium text-foreground capitalize">{framework}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Modelo</p>
                  <p className="font-mono text-sm font-medium text-foreground">{config.modelType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Test Size</p>
                  <p className="font-mono text-sm font-medium text-foreground">{(config.testSize * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Épocas</p>
                  <p className="font-mono text-sm font-medium text-foreground">{config.epochs}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/clean")}>
              ← Volver a Limpiar
            </Button>
            <Button 
              onClick={handleTrain}
              size="lg"
              className="gap-2 bg-gradient-primary hover:opacity-90 transition-opacity"
              disabled={isTraining}
            >
              {isTraining ? (
                <>Entrenando...</>
              ) : (
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
