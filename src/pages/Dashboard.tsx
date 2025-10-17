import { Database, Sparkles, Settings, BarChart3 } from "lucide-react";
import { ModuleCard } from "@/components/ModuleCard";

const Dashboard = () => {
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
    <div className="min-h-screen bg-background dark text-foreground relative overflow-hidden">
      {/* Fondo decorativo artístico */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.15),transparent_50%)]"></div>
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-6 py-5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Database className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ML Data Pipeline
            </h1>
            <p className="text-sm text-muted-foreground">Sistema de Machine Learning End-to-End</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 relative z-10">
        <div className="space-y-8 animate-fade-in">
          {/* Welcome Section */}
          <div className="text-center space-y-3">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Bienvenido a tu Pipeline
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Selecciona un módulo para comenzar tu flujo de trabajo de Machine Learning
            </p>
          </div>

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

          {/* Info Section */}
          <div className="mt-16 p-8 rounded-2xl bg-gradient-card border border-border/50 backdrop-blur-sm shadow-card hover:shadow-card-hover transition-all duration-300">
            <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
              <span className="text-2xl">🚀</span> Pipeline Completo
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
