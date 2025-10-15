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
    password: ""
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setUploadedFile(file);
      setFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || null;
            return obj;
          }, {} as any);
        });
        
        const columns = headers.map((header, index) => {
          const nullCount = data.filter(row => !row[header] || row[header] === '').length;
          const sampleValue = data.find(row => row[header])?.header;
          const isNumeric = data.some(row => row[header] && !isNaN(Number(row[header])));
          
          return {
            id: index + 1,
            name: header,
            type: isNumeric ? 'float' : 'string',
            selected: true,
            nulls: nullCount
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
        variant: "destructive"
      });
    }
  };

  const handleProceed = () => {
    if (!uploadedFile) {
      toast({
        title: "Sin archivo",
        description: "Por favor sube un archivo CSV primero",
        variant: "destructive"
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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <UploadIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Cargar Datos</h1>
              <p className="text-sm text-muted-foreground">Sube CSV o conecta a base de datos</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          
          {/* CSV Upload Section */}
          <Card className="p-8 shadow-card bg-gradient-card border-border/50">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Subir Archivo CSV</h2>
                  <p className="text-sm text-muted-foreground">Formatos aceptados: .csv</p>
                </div>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <UploadIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Arrastra tu archivo aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Máximo 100MB
                    </p>
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
                <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Database Connection Section */}
          <Card className="p-8 shadow-card bg-gradient-card border-border/50">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-secondary-purple-light flex items-center justify-center">
                  <Database className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Conectar Base de Datos</h2>
                  <p className="text-sm text-muted-foreground">PostgreSQL, MySQL, SQLite</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    placeholder="localhost:5432"
                    value={dbConfig.host}
                    onChange={(e) => setDbConfig({ ...dbConfig, host: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="database">Base de Datos</Label>
                  <Input
                    id="database"
                    placeholder="mi_database"
                    value={dbConfig.database}
                    onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    placeholder="usuario"
                    value={dbConfig.username}
                    onChange={(e) => setDbConfig({ ...dbConfig, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={dbConfig.password}
                    onChange={(e) => setDbConfig({ ...dbConfig, password: e.target.value })}
                  />
                </div>
              </div>

              <Button variant="outline" className="w-full">
                Probar Conexión
              </Button>
            </div>
          </Card>

          {/* Action Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleProceed}
              size="lg"
              className="gap-2 bg-gradient-primary hover:opacity-90 transition-opacity"
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
