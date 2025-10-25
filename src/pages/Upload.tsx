import { useState } from "react";
import { Upload as UploadIcon, Database, ArrowRight, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";

const Upload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCsvData, setCsvColumns, setFileName } = useData();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dbConfig, setDbConfig] = useState({
    host: "",
    database: "",
    username: "",
    password: "",
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setUploadedFile(file);
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());
        const headers = lines[0].split(",").map((h) => h.trim());

        const data = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim());
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || null;
            return obj;
          }, {} as any);
        });

        const columns = headers.map((header, index) => {
          const nullCount = data.filter((row) => !row[header] || row[header] === "").length;
          const isNumeric = data.some((row) => row[header] && !isNaN(Number(row[header])));
          return {
            id: index + 1,
            name: header,
            type: isNumeric ? "float" : "string",
            selected: true,
            nulls: nullCount,
          };
        });

        setCsvData(data);
        setCsvColumns(columns);
      };

      reader.readAsText(file);

      toast({
        title: "Archivo cargado",
        description: `${file.name} está listo para procesar`,
      });
    } else {
      toast({
        title: "Error",
        description: "Por favor sube un archivo CSV válido",
        variant: "destructive",
      });
    }
  };

  const handleProceed = () => {
    if (!uploadedFile) {
      toast({
        title: "Sin archivo",
        description: "Por favor sube un archivo CSV primero",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Redirigiendo",
      description: "Preparando datos para limpieza...",
    });

    setTimeout(() => navigate("/clean"), 1000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Fondo decorativo futurista */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-accent/5 to-background"></div>
      <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[130px] animate-float"></div>
      <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[110px] animate-float" style={{ animationDelay: '2s' }}></div>

      {/* Header mejorado */}
      <header className="border-b border-border/30 bg-card/20 backdrop-blur-2xl sticky top-0 z-10 shadow-xl">
        <div className="container mx-auto px-6 py-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2 hover:text-primary transition-all hover:scale-105"
          >
            ← Dashboard
          </Button>
          <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse-glow">
            <UploadIcon className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Cargar Datos
            </h1>
            <p className="text-sm text-muted-foreground">Sube CSV o conecta bases de datos</p>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
          {/* Sección de subida CSV mejorada */}
          <Card className="p-10 border-2 border-border/40 bg-gradient-card backdrop-blur-md shadow-card hover:shadow-glow transition-all duration-500 rounded-2xl hover:scale-[1.01]">
            <div className="space-y-7">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse-glow">
                  <FileText className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Subir Archivo CSV</h2>
                  <p className="text-sm text-muted-foreground">Formatos: .csv • Máximo 100MB</p>
                </div>
              </div>

              <div className="border-2 border-dashed border-primary/40 rounded-2xl p-12 text-center hover:border-primary/80 hover:bg-primary/5 transition-all duration-300 bg-card/30 backdrop-blur-sm">
                <UploadIcon className="w-16 h-16 mx-auto mb-6 text-muted-foreground animate-float" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="space-y-3">
                    <p className="text-lg font-bold text-foreground">
                      Arrastra tu archivo aquí o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-muted-foreground">Procesamiento rápido y seguro</p>
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </Label>
              </div>

              {uploadedFile && (
                <div className="flex items-center gap-4 p-6 bg-gradient-neon border-2 border-primary/40 rounded-xl shadow-glow animate-scale-in">
                  <CheckCircle2 className="w-7 h-7 text-primary-foreground" />
                  <div className="flex-1">
                    <p className="font-bold text-lg text-primary-foreground">{uploadedFile.name}</p>
                    <p className="text-sm text-primary-foreground/80">
                      {(uploadedFile.size / 1024).toFixed(2)} KB • Listo para procesar
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Sección de conexión a BD */}
          <Card className="p-8 border border-border/50 bg-gradient-card backdrop-blur-md shadow-card hover:shadow-card-hover transition-all duration-500 rounded-2xl">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-neon flex items-center justify-center shadow-glow">
                  <Database className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Conectar Base de Datos</h2>
                  <p className="text-sm text-muted-foreground">PostgreSQL, MySQL, SQLite</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["host", "database", "username", "password"].map((field, i) => (
                  <div className="space-y-2" key={i}>
                    <Label htmlFor={field} className="text-foreground capitalize">
                      {field === "database" ? "Base de Datos" : field === "username" ? "Usuario" : field.charAt(0).toUpperCase() + field.slice(1)}
                    </Label>
                    <Input
                      id={field}
                      type={field === "password" ? "password" : "text"}
                      placeholder={field === "host" ? "localhost:5432" : field === "database" ? "mi_database" : field === "username" ? "usuario" : "••••••••"}
                      value={dbConfig[field as keyof typeof dbConfig]}
                      onChange={(e) =>
                        setDbConfig({ ...dbConfig, [field]: e.target.value })
                      }
                      className="bg-card/50 border-border/50 focus:border-primary"
                    />
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full border-border/50 hover:bg-primary/10 hover:border-primary transition-all"
              >
                Probar Conexión
              </Button>
            </div>
          </Card>

          {/* Botón final mejorado */}
          <div className="flex justify-end pt-8">
            <Button
              onClick={handleProceed}
              size="lg"
              className="gap-3 text-lg px-8 py-6 bg-gradient-cyber font-bold hover:opacity-90 hover:shadow-neon hover:scale-105 transition-all rounded-xl shadow-glow animate-pulse-glow"
              disabled={!uploadedFile}
            >
              Continuar a Limpiar Datos
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;
