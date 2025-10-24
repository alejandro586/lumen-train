import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Trash2, Filter, Download, Columns, Search, RefreshCw, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { isNumeric } from "@/utils/helpers"; // Asume que tienes una util para chequear numérico

const Clean = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { csvData, csvColumns, setCsvColumns, setCsvData } = useData(); // Agrega setCsvData si no lo tiene
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const [columns, setColumns] = useState(csvColumns || []);
  const [data, setData] = useState(csvData || []);

  useEffect(() => {
    if (!csvData || !csvColumns) {
      toast({
        title: "Sin datos",
        description: "Por favor sube un archivo CSV primero",
        variant: "destructive",
      });
      navigate("/upload");
    } else {
      setColumns(csvColumns);
      setData(csvData);
      // Re-inferencia tipos y nulls para manejar parsing malo
      reInferTypesAndNulls();
    }
  }, [csvData, csvColumns, navigate, toast]);

  // Función para re-inferir tipos y nulls (fix para CSV mal parseado)
  const reInferTypesAndNulls = () => {
    const updatedColumns = columns.map(col => {
      let nullCount = 0;
      let sampleValues = data.slice(0, 100).map(row => row[col.name]); // Sample para perf
      const numericCount = sampleValues.filter(val => isNumeric(val)).length;
      const isNumericCol = numericCount / sampleValues.length > 0.5; // >50% numéricos

      sampleValues.forEach(val => {
        if (val === null || val === undefined || val === '' || (isNumericCol && !isNumeric(val))) {
          nullCount++;
        }
      });

      return {
        ...col,
        type: isNumericCol ? 'number' : 'string',
        nulls: nullCount,
      };
    });

    setColumns(updatedColumns);
    setCsvColumns(updatedColumns);
  };

  // Calculate duplicates (mejorado para ignorar nulls)
  const getDuplicatesCount = () => {
    const seen = new Set();
    let duplicateCount = 0;
    data.forEach(row => {
      // Limpia row de nulls para comparación
      const cleanRow = { ...row };
      Object.keys(cleanRow).forEach(key => {
        if (cleanRow[key] === null || cleanRow[key] === undefined || cleanRow[key] === '') {
          cleanRow[key] = '__NULL__';
        }
      });
      const rowStr = JSON.stringify(cleanRow);
      if (seen.has(rowStr)) {
        duplicateCount++;
      } else {
        seen.add(rowStr);
      }
    });
    return duplicateCount;
  };

  const stats = {
    totalRows: data.length,
    selectedColumns: columns.filter((c) => c.selected).length,
    totalNulls: columns.reduce((sum, col) => sum + col.nulls, 0),
    duplicates: getDuplicatesCount(),
    numericSelected: columns.filter((c) => c.selected && c.type === 'number').length, // Nuevo: cuenta numéricas
  };

  const toggleColumn = (id: number) => {
    const newColumns = columns.map((col) =>
      col.id === id ? { ...col, selected: !col.selected } : col
    );
    setColumns(newColumns);
    setCsvColumns(newColumns);
  };

  const filteredColumns = columns.filter((col) => {
    const matchesSearch = col.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || col.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleResetColumns = () => {
    const newColumns = columns.map(col => ({ ...col, selected: true }));
    setColumns(newColumns);
    setCsvColumns(newColumns);
    toast({
      title: "Columnas restablecidas",
      description: "Todas las columnas han sido seleccionadas nuevamente",
    });
  };

  // Mejorado: Reemplaza nulls con media para numéricas, 'n/a' para strings
  const handleReplaceNulls = () => {
    const cleanedData = data.map(row => {
      const newRow = { ...row };
      Object.keys(newRow).forEach(key => {
        const col = columns.find(c => c.name === key);
        if (newRow[key] === null || newRow[key] === undefined || newRow[key] === '') {
          if (col?.type === 'number') {
            // Calcula media rápida del sample
            const sample = data.slice(0, 100).map(r => r[key]).filter(isNumeric);
            const mean = sample.length > 0 ? sample.reduce((a, b) => a + b, 0) / sample.length : 0;
            newRow[key] = mean;
          } else {
            newRow[key] = 'n/a';
          }
        }
      });
      return newRow;
    });
    
    // Update null counts
    const updatedColumns = columns.map(col => ({ ...col, nulls: 0 }));
    
    setData(cleanedData);
    setCsvData(cleanedData); // Actualiza context
    setColumns(updatedColumns);
    setCsvColumns(updatedColumns);
    
    toast({
      title: "Valores nulos reemplazados",
      description: `Reemplazados ${stats.totalNulls} valores (media para numéricas)`,
    });
  };

  const handleRemoveDuplicates = () => {
    const seen = new Set();
    const uniqueData = data.filter(row => {
      const cleanRow = { ...row };
      Object.keys(cleanRow).forEach(key => {
        if (cleanRow[key] === null || cleanRow[key] === undefined || cleanRow[key] === '') {
          cleanRow[key] = '__NULL__';
        }
      });
      const rowStr = JSON.stringify(cleanRow);
      if (seen.has(rowStr)) {
        return false;
      }
      seen.add(rowStr);
      return true;
    });
    
    const removedCount = data.length - uniqueData.length;
    setData(uniqueData);
    setCsvData(uniqueData);
    
    toast({
      title: "Duplicados eliminados",
      description: `Se eliminaron ${removedCount} filas duplicadas`,
    });
  };

  // Nuevo: Convierte strings a números para columnas seleccionadas
  const handleConvertToNumeric = () => {
    const numericCols = columns.filter(c => c.selected && c.type === 'string');
    if (numericCols.length === 0) {
      toast({
        title: "No hay columnas",
        description: "Selecciona columnas de texto para convertir a numéricas",
        variant: "destructive",
      });
      return;
    }

    const cleanedData = data.map(row => {
      const newRow = { ...row };
      numericCols.forEach(col => {
        const val = row[col.name];
        if (isNumeric(val)) {
          newRow[col.name] = parseFloat(val);
        }
      });
      return newRow;
    });

    const updatedColumns = columns.map(col => {
      if (numericCols.some(nc => nc.id === col.id)) {
        return { ...col, type: 'number' };
      }
      return col;
    });

    setData(cleanedData);
    setCsvData(cleanedData);
    setColumns(updatedColumns);
    setCsvColumns(updatedColumns);

    toast({
      title: "Columnas convertidas",
      description: `${numericCols.length} columnas de texto convertidas a numéricas`,
    });
  };

  // Nuevo: Filtra rows con valores válidos en columnas numéricas seleccionadas
  const handleFilterValidRows = () => {
    const numericSelected = columns.filter(c => c.selected && c.type === 'number');
    if (numericSelected.length === 0) {
      toast({
        title: "No hay columnas numéricas",
        description: "Selecciona al menos una columna numérica para filtrar",
        variant: "destructive",
      });
      return;
    }

    const filteredData = data.filter(row => {
      return numericSelected.every(col => isNumeric(row[col.name]));
    });

    const removedCount = data.length - filteredData.length;
    setData(filteredData);
    setCsvData(filteredData);

    toast({
      title: "Filas filtradas",
      description: `Eliminadas ${removedCount} filas con valores inválidos en columnas numéricas`,
    });
  };

  // Advertencia si <2 numéricas para training
  useEffect(() => {
    if (stats.numericSelected < 2) {
      toast({
        title: "Advertencia para Entrenamiento",
        description: `Solo ${stats.numericSelected} columnas numéricas seleccionadas. Necesitas al menos 2 para entrenar un modelo. Usa "Convertir a Numérico" o selecciona más.`,
        variant: "destructive",
      });
    }
  }, [stats.numericSelected]);

  return (
    <div className="min-h-screen bg-background dark text-foreground relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_60%)]"></div>
      <div className="absolute top-40 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/50 bg-card/30 backdrop-blur-xl shadow-lg">
        <div className="container mx-auto px-6 py-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2 hover:text-primary"
          >
            ← Dashboard
          </Button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-neon flex items-center justify-center shadow-glow">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Limpieza de Datos
            </h1>
            <p className="text-sm text-muted-foreground">
              Visualiza, analiza y prepara tus datos para el modelo
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-6 py-12 animate-fade-in relative z-10">
        <div className="space-y-10 max-w-6xl mx-auto">
          {/* Stats - Agregado numericSelected */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6"> {/* 5 columnas ahora */}
            {[
              { label: "Total Filas", value: stats.totalRows.toLocaleString(), icon: <Columns />, color: "text-foreground" },
              { label: "Columnas Seleccionadas", value: `${stats.selectedColumns}/${columns.length}`, icon: <Filter />, color: "text-primary" },
              { label: "Valores Nulos", value: stats.totalNulls, icon: <Trash2 />, color: "text-accent" },
              { label: "Duplicados", value: stats.duplicates, icon: <Sparkles />, color: "text-destructive" },
              { label: "Numéricas Sel.", value: stats.numericSelected, icon: <Hash />, color: stats.numericSelected >= 2 ? "text-green-600" : "text-yellow-600" }, // Nuevo
            ].map((item, idx) => (
              <Card
                key={idx}
                className="relative overflow-hidden p-6 border border-border/50 bg-gradient-card backdrop-blur-sm shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-500"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">{item.icon}</div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Column Selection */}
          <Card className="p-8 bg-gradient-card border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-500">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-cyber flex items-center justify-center shadow-glow">
                    <Filter className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Selección de Columnas</h2>
                    <p className="text-sm text-muted-foreground">
                      Elige las variables para tu modelo
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetColumns}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Restablecer
                </Button>
              </div>

              {/* Search and Filter Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    placeholder="Buscar columnas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 px-3 py-2 rounded-md bg-card/60 backdrop-blur-sm border border-input text-sm"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 rounded-md bg-card/60 backdrop-blur-sm border border-input text-sm"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="number">Numérico</option>
                  <option value="string">Texto</option>
                  <option value="boolean">Booleano</option>
                </select>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {filteredColumns.map((col) => (
                  <div
                    key={col.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 bg-card/40 transition-all duration-300 hover:bg-muted/20"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={col.selected}
                        onCheckedChange={() => toggleColumn(col.id)}
                      />
                      <div>
                        <p className="font-medium">{col.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {col.type}
                          </Badge>
                          {col.nulls > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {col.nulls} nulos
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Data Cleaning Actions - Agregados nuevos botones */}
          <Card className="p-8 bg-gradient-card border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-500">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-cyber flex items-center justify-center shadow-glow">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Limpieza de Datos</h2>
                  <p className="text-sm text-muted-foreground">
                    Aplica transformaciones automáticas a tus datos
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={handleReplaceNulls}
                  disabled={stats.totalNulls === 0}
                  className="gap-2 h-auto py-4 flex-col items-start hover:border-primary"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Filter className="w-4 h-4" />
                    <span className="font-semibold">Reemplazar Valores Nulos</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {stats.totalNulls} valores (media para numéricas)
                  </span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleRemoveDuplicates}
                  disabled={stats.duplicates === 0}
                  className="gap-2 h-auto py-4 flex-col items-start hover:border-primary"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Trash2 className="w-4 h-4" />
                    <span className="font-semibold">Eliminar Duplicados</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {stats.duplicates} filas duplicadas
                  </span>
                </Button>

                {/* Nuevo botón */}
                <Button
                  variant="outline"
                  onClick={handleConvertToNumeric}
                  disabled={columns.filter(c => c.selected && c.type === 'string').length === 0}
                  className="gap-2 h-auto py-4 flex-col items-start hover:border-primary"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Hash className="w-4 h-4" />
                    <span className="font-semibold">Convertir a Numérico</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Columnas de texto a números
                  </span>
                </Button>

                {/* Nuevo botón */}
                <Button
                  variant="outline"
                  onClick={handleFilterValidRows}
                  disabled={stats.numericSelected === 0}
                  className="gap-2 h-auto py-4 flex-col items-start hover:border-primary"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Filter className="w-4 h-4" />
                    <span className="font-semibold">Filtrar Filas Válidas</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Solo rows con valores numéricos válidos
                  </span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Data Preview */}
          <Card className="p-8 bg-gradient-card border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-500">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Vista Previa de Datos - {data.length.toLocaleString()} filas totales</h2>
                  <p className="text-sm text-muted-foreground">
                    Mostrando las primeras 15 filas del dataset cargado
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 hover:bg-accent/10"
                  onClick={() => {
                    const selectedCols = columns.filter(c => c.selected);
                    const headers = selectedCols.map(c => c.name).join(',');
                    const rows = data.map(row => 
                      selectedCols.map(col => {
                        const value = row[col.name];
                        return value !== null && value !== undefined ? `"${value}"` : '';
                      }).join(',')
                    ).join('\n');
                    const csv = `${headers}\n${rows}`;
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `datos_limpios_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast({
                      title: "Datos exportados",
                      description: `Se han exportado ${data.length} filas con ${selectedCols.length} columnas seleccionadas`,
                    });
                  }}
                >
                  <Download className="w-4 h-4" /> Exportar
                </Button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border/40">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 sticky top-0">
                    <tr className="border-b border-border/30">
                      <th className="text-left p-3 font-semibold text-muted-foreground">#</th>
                      {columns.filter((c) => c.selected).map((col) => (
                        <th key={col.id} className="text-left p-3 font-semibold">
                          <div className="flex flex-col gap-1">
                            <span>{col.name}</span>
                            <Badge variant="outline" className="text-xs w-fit">{col.type}</Badge>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 15).map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-border/20 hover:bg-primary/5 transition-colors"
                      >
                        <td className="p-3 text-muted-foreground font-semibold">{idx + 1}</td>
                        {columns.filter((c) => c.selected).map((col) => (
                          <td key={col.id} className="p-3 font-mono text-foreground">
                            {row[col.name] === null || row[col.name] === undefined || row[col.name] === '' ? (
                              <span className="text-muted-foreground italic">n/a</span>
                            ) : (
                              row[col.name]
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {data.length > 15 && (
                <p className="text-sm text-muted-foreground text-center">
                  ... y {(data.length - 15).toLocaleString()} filas más
                </p>
              )}
            </div>
          </Card>

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => navigate("/upload")}
              className="hover:bg-primary/10 hover:border-primary transition-all"
            >
              ← Volver a Cargar
            </Button>
            <Button
              onClick={() => navigate("/train")}
              size="lg"
              className="gap-2 bg-gradient-primary hover:opacity-90 hover:shadow-glow transition-all shadow-card disabled:opacity-50"
              disabled={stats.numericSelected < 2} // Deshabilita si <2 numéricas
            >
              Continuar a Entrenar
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

// Util helper (agrega en @/utils/helpers.ts si no existe)
export const isNumeric = (val: any): boolean => {
  if (val === null || val === undefined || val === '') return false;
  return !isNaN(parseFloat(val)) && isFinite(val);
};

export default Clean;
