import { Database, Sparkles, Settings, BarChart3 } from "lucide-react";
import { ModuleCard } from "@/components/ModuleCard";

const Dashboard = () => {
  const modules = [
    {
      title: "Cargar Datos",
      description: "Sube archivos CSV o conecta bases de datos externas para comenzar tu pipeline",
      icon: Database,
      route: "/upload",
      gradient: "from-primary to-primary-glow"
    },
    {
      title: "Limpiar Datos",
      description: "Visualiza, limpia y transforma tus datos con herramientas interactivas",
      icon: Sparkles,
      route: "/clean",
      gradient: "from-accent to-secondary-purple-light"
    },
    {
      title: "Entrenar Modelos",
      description: "Configura y entrena modelos con sklearn, PyTorch o TensorFlow",
      icon: Settings,
      route: "/train",
      gradient: "from-primary to-accent"
    },
    {
      title: "Resultados",
      description: "Analiza métricas, precisión y visualiza el historial de entrenamiento",
      icon: BarChart3,
      route: "/results",
      gradient: "from-secondary-purple to-primary"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Database className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                ML Data Pipeline
              </h1>
              <p className="text-sm text-muted-foreground">Sistema de Machine Learning End-to-End</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="space-y-8 animate-fade-in">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">
              Bienvenido a tu Pipeline
            </h2>
            <p className="text-muted-foreground text-lg">
              Selecciona un módulo para comenzar tu flujo de trabajo de Machine Learning
            </p>
          </div>

          {/* Module Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((module, index) => (
              <div 
                key={module.route}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ModuleCard {...module} />
              </div>
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-12 p-6 rounded-lg bg-gradient-card border border-border/50 shadow-card">
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              Pipeline Completo
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Este sistema te permite cargar datos desde múltiples fuentes, limpiarlos y prepararlos, 
              entrenar modelos de ML con diferentes frameworks, y analizar los resultados con métricas detalladas.
              Todo listo para conectar con tu backend Python a través de APIs.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
