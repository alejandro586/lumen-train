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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-foreground relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.15),transparent_70%)] blur-3xl"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.1),transparent_80%)] blur-3xl"></div>

      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-5 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2 text-white hover:text-indigo-300 transition-colors"
          >
            ← Dashboard
          </Button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <UploadIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Cargar Datos
            </h1>
            <p className="text-sm text-muted-foreground">Sube CSV o conecta una base de datos</p>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
          {/* Sección de subida CSV */}
          <Card className="p-8 border border-white/10 bg-white/5 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Subir Archivo CSV</h2>
                  <p className="text-sm text-muted-foreground">Formatos aceptados: .csv</p>
                </div>
              </div>

              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-indigo-400/60 transition-colors bg-white/5">
                <UploadIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white">
                      Arrastra tu archivo aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-muted-foreground">Máximo 100MB</p>
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
                <div className="flex items-center gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                  <div className="flex-1">
                    <p className="font-medium text-white">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Sección de conexión a BD */}
          <Card className="p-8 border border-white/10 bg-white/5 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center shadow-md">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Conectar Base de Datos</h2>
                  <p className="text-sm text-muted-foreground">PostgreSQL, MySQL, SQLite</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["host", "database", "username", "password"].map((field, i) => (
                  <div className="space-y-2" key={i}>
                    <Label htmlFor={field} className="text-white capitalize">
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
                      className="bg-white/10 border-white/20 focus:border-indigo-400 text-white"
                    />
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 transition-all"
              >
                Probar Conexión
              </Button>
            </div>
          </Card>

          {/* Botón final */}
          <div className="flex justify-end">
            <Button
              onClick={handleProceed}
              size="lg"
              className="gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition-all rounded-xl shadow-lg"
              disabled={!uploadedFile}
            >
              Continuar a Limpiar Datos
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;
