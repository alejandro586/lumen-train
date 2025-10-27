import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Database, Sparkles, Settings, BarChart3, FileText, Columns, Download, BarChart, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { ModuleCard } from "@/components/ModuleCard";
import { useData } from "@/contexts/DataContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnalysisDialog } from "@/components/AnalysisDialog";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { csvData, csvColumns, fileName } = useData();
  const { toast } = useToast();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  const handleExport = () => {
    if (!csvData || !csvColumns) return;

    // Convertir datos a CSV
    const headers = csvColumns.map(col => col.name).join(",");
    const rows = csvData.map(row => 
      csvColumns.map(col => {
        const value = row[col.name];
        // Escapar valores que contienen comas
        if (value && value.toString().includes(",")) {
          return `"${value}"`;
        }
        return value ?? "";
      }).join(",")
    ).join("\n");

    const csvContent = `${headers}\n${rows}`;
    
    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", fileName || "datos_exportados.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportación exitosa",
      description: `${fileName || "Datos"} exportado correctamente`,
    });
  };

  const handleAnalyze = () => {
    setShowAnalysis(true);
  };
  
  const modules = [
    {
      title: "Cargar Datos",
      description: "Sube archivos CSV o conecta bases de datos externas para comenzar tu pipeline",
      icon: Database,
      route: "/upload",
      gradient: "from-indigo-500 via-blue-500 to-cyan-400"
    },
    {
      title: "Limpiar Datos",
      description: "Visualiza, limpia y transforma tus datos con herramientas interactivas",
      icon: Sparkles,
      route: "/clean",
      gradient: "from-pink-500 via-purple-500 to-indigo-400"
    },
    {
      title: "Entrenar Modelos",
      description: "Configura y entrena modelos con sklearn, PyTorch o TensorFlow",
      icon: Settings,
      route: "/train",
      gradient: "from-emerald-500 via-teal-400 to-cyan-400"
    },
    {
      title: "Resultados",
      description: "Analiza métricas, precisión y visualiza el historial de entrenamiento",
      icon: BarChart3,
      route: "/results",
      gradient: "from-amber-400 via-orange-500 to-rose-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Fondo decorativo futurista mejorado */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-20 right-20 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] animate-pulse"></div>
      </div>

      {/* Header mejorado */}
      <header className="border-b border-border/30 bg-card/20 backdrop-blur-2xl sticky top-0 z-20 shadow-xl">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-cyber flex items-center justify-center shadow-glow animate-pulse-glow">
              <Database className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
                ML Data Pipeline
              </h1>
              <p className="text-sm text-muted-foreground">Sistema de Machine Learning End-to-End con IA Real</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 border border-border/50">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/auth")}
                className="gap-2 bg-gradient-cyber hover:opacity-90"
              >
                <User className="w-4 h-4" />
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 relative z-10">
        <div className="space-y-8 animate-fade-in">
          {/* Welcome Section mejorado */}
          <div className="text-center space-y-5 mb-8">
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-cyber bg-clip-text text-transparent animate-gradient-shift">
              Bienvenido a tu Pipeline
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              Plataforma completa de Machine Learning con entrenamiento real usando <span className="text-primary font-semibold">TensorFlow.js</span>
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Badge variant="outline" className="text-sm px-4 py-2 border-primary/40 bg-primary/5">
                <Sparkles className="w-3 h-3 mr-1" /> Entrenamiento Real
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-2 border-accent/40 bg-accent/5">
                <BarChart3 className="w-3 h-3 mr-1" /> 3 Frameworks
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-2 border-border/40">
                <Settings className="w-3 h-3 mr-1" /> Pipeline Completo
              </Badge>
            </div>
          </div>

          {/* CSV Info Card mejorado */}
          {csvData && csvColumns && fileName && (
            <Card className="p-7 bg-gradient-card border-2 border-primary/40 shadow-neon animate-scale-in hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-neon flex items-center justify-center shadow-glow animate-pulse-glow">
                    <FileText className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">Archivo CSV Cargado</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      {fileName}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                    <Download className="w-4 h-4" />
                    Exportar
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleAnalyze}>
                    <BarChart className="w-4 h-4" />
                    Analizar
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-card/50">
                  <p className="text-xs text-muted-foreground">Total Filas</p>
                  <p className="text-lg font-bold text-foreground">{csvData.length.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-card/50">
                  <p className="text-xs text-muted-foreground">Total Columnas</p>
                  <p className="text-lg font-bold text-primary">{csvColumns.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-card/50">
                  <p className="text-xs text-muted-foreground">Columnas Seleccionadas</p>
                  <p className="text-lg font-bold text-accent">{csvColumns.filter(c => c.selected).length}</p>
                </div>
                <div className="p-3 rounded-lg bg-card/50">
                  <p className="text-xs text-muted-foreground">Valores Nulos</p>
                  <p className="text-lg font-bold text-destructive">{csvColumns.reduce((sum, col) => sum + col.nulls, 0).toLocaleString()}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Module Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {modules.map((module, index) => (
              <div
                key={module.route}
                style={{ animationDelay: `${index * 100}ms` }}
                className="animate-fade-in"
              >
                <ModuleCard {...module} />
              </div>
            ))}
          </div>

          {/* Info Section mejorado */}
          <div className="mt-16 p-10 rounded-2xl bg-gradient-card border-2 border-primary/30 backdrop-blur-sm shadow-neon hover:shadow-glow transition-all duration-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-fire flex items-center justify-center shadow-glow animate-pulse-glow">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground">Pipeline Completo de Machine Learning</h3>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Sistema end-to-end que te permite cargar datos desde múltiples fuentes, limpiarlos y prepararlos con herramientas avanzadas,
              entrenar modelos reales usando <span className="text-primary font-semibold">TensorFlow.js</span> con 3 frameworks diferentes 
              (Scikit-learn, PyTorch, TensorFlow), y analizar resultados con métricas detalladas y visualizaciones profesionales.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-card-hover border border-primary/20">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4" /> Carga Flexible
                </h4>
                <p className="text-sm text-muted-foreground">CSV, PostgreSQL, MySQL, SQLite</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-card-hover border border-accent/20">
                <h4 className="font-semibold text-accent mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Limpieza Inteligente
                </h4>
                <p className="text-sm text-muted-foreground">Nulos, duplicados, tipos, filtros</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-card-hover border border-border/20">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> IA Real
                </h4>
                <p className="text-sm text-muted-foreground">TensorFlow.js con redes neuronales</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Analysis Dialog */}
      {csvData && csvColumns && (
        <AnalysisDialog
          open={showAnalysis}
          onOpenChange={setShowAnalysis}
          data={csvData}
          columns={csvColumns}
        />
      )}
    </div>
  );
};

export default Dashboard;
