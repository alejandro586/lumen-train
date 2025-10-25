import { useState, useEffect, useMemo, useCallback } from "react";
import { Sparkles, ArrowRight, Trash2, Filter, Download, Columns, Search, RefreshCw, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "lodash"; // Instala lodash si no lo tienes: npm i lodash @types/lodash
import { isNumeric } from "@/utils/helpers"; // Asume que tienes esta util

const Clean = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { csvData, csvColumns, setCsvColumns, setCsvData } = useData(); // Agrega setCsvData si no lo tiene en context
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true); // Loading state para optimización

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
      return;
    }
    setColumns(csvColumns);
    setData(csvData);
    setIsLoading(false);
    // Lazy infer: Solo después de 500ms para no bloquear render inicial
    const timer = setTimeout(() => reInferTypesAndNulls(), 500);
    return () => clearTimeout(timer);
  }, [csvData, csvColumns, navigate, toast]);

  // Re-inferencia optimizada: Muestreo 50 rows, solo columnas no inferidas
  const reInferTypesAndNulls = useCallback(() => {
    setIsLoading(true);
    const updatedColumns = columns.map(col => {
      if (col.type !== 'unknown') return col; // Skip si ya inferido
      let nullCount = 0;
      const sampleSize = 50; // Reducido para velocidad
      const sampleValues = data.slice(0, sampleSize).map(row => row[col.name]);
      const numericCount = sampleValues.filter(val => isNumeric(val)).length;
      const isNumericCol = numericCount / sampleValues.length > 0.5;

      sampleValues.forEach(val => {
        if (val === null || val === undefined || val === '' || (isNumericCol && !isNumeric(val))) {
          nullCount++;
        }
      });

      return {
        ...col,
        type: isNumericCol ? 'number' : 'string',
        nulls: nullCount * (data.length / sampleSize), // Extrapola para estimar total
      };
    });

    setColumns(updatedColumns);
    setCsvColumns(updatedColumns);
    setIsLoading(false);
  }, [columns, data, setCsvColumns]);

  // Debounce para search (evita re-renders excesivos)
  const debouncedSearch = useMemo(() => debounce((term: string) => setSearchTerm(term), 300), []);

  // Duplicados memoizado y limitado
  const getDuplicatesCount = useMemo(() => {
    if (data.length > 1000) return 'N/A (dataset grande)'; // Skip cálculo pesado
    const seen = new Set();
    let duplicateCount = 0;
    data.slice(0, 1000).forEach(row => { // Limit a 1000 para perf
      const cleanRow = { ...row };
      Object.keys(cleanRow).forEach(key => {
        if (cleanRow[key] === null || cleanRow[key] === undefined || cleanRow[key] === '') {
          cleanRow[key] = '__NULL__';
        }
      });
      const rowStr = JSON.stringify(cleanRow);
      if (seen.has(rowStr)) duplicateCount++;
      else seen.add(rowStr);
    });
    return duplicateCount;
  }, [data]);

  const stats = useMemo(() => ({
    totalRows: data.length,
    selectedColumns: columns.filter((c) => c.selected).length,
    totalNulls: columns.reduce((sum, col) => sum + col.nulls, 0),
    duplicates: getDuplicatesCount,
    numericSelected: columns.filter((c) => c.selected && c.type === 'number').length,
  }), [columns, data, getDuplicatesCount]);

  const toggleColumn = useCallback((id: number) => {
    const newColumns = columns.map((col) =>
      col.id === id ? { ...col, selected: !col.selected } : col
    );
    setColumns(newColumns);
    setCsvColumns(newColumns);
  }, [columns, setCsvColumns]);

  const filteredColumns = useMemo(() => columns.filter((col) => {
    const matchesSearch = col.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || col.type === filterType;
    return matchesSearch && matchesType;
  }), [columns, searchTerm, filterType]);

  const handleResetColumns = useCallback(() => {
    const newColumns = columns.map(col => ({ ...col, selected: true }));
    setColumns(newColumns);
    setCsvColumns(newColumns);
    toast({
      title: "Columnas restablecidas",
      description: "Todas las columnas han sido seleccionadas nuevamente",
    });
  }, [columns, setCsvColumns, toast]);

  // Reemplazo de nulls optimizado (useCallback)
  const handleReplaceNulls = useCallback(() => {
    const cleanedData = data.map(row => {
      const newRow = { ...row };
      Object.keys(newRow).forEach(key => {
        const col = columns.find(c => c.name === key);
        if (newRow[key] === null || newRow[key] === undefined || newRow[key] === '') {
          if (col?.type === 'number') {
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
    
    const updatedColumns = columns.map(col => ({ ...col, nulls: 0 }));
    
    setData(cleanedData);
    setCsvData(cleanedData);
    setColumns(updatedColumns);
    setCsvColumns(updatedColumns);
    
    toast({
      title: "Valores nulos reemplazados",
      description: `Reemplazados ${stats.totalNulls} valores (media para numéricas)`,
    });
  }, [data, columns, stats.totalNulls, setCsvData, setCsvColumns, toast]);

  const handleRemoveDuplicates = useCallback(() => {
    const seen = new Set();
    const uniqueData = data.filter(row => {
      const cleanRow = { ...row };
      Object.keys(cleanRow).forEach(key => {
        if (cleanRow[key] === null || cleanRow[key] === undefined || cleanRow[key] === '') {
          cleanRow[key] = '__NULL__';
        }
      });
      const rowStr = JSON.stringify(cleanRow);
      if (seen.has(rowStr)) return false;
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
  }, [data, setCsvData, toast]);

  // Convertir a numérico
  const handleConvertToNumeric = useCallback(() => {
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
  }, [columns, data, setCsvData, setCsvColumns, toast]);

  // Filtrar filas válidas
  const handleFilterValidRows = useCallback(() => {
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
  }, [columns, data, setCsvData, toast]);

  // Advertencia si <2 numéricas
  useEffect(() => {
    if (stats.numericSelected < 2) {
      toast({
        title: "Advertencia para Entrenamiento",
        description: `Solo ${stats.numericSelected} columnas numéricas seleccionadas. Necesitas al menos 2 para entrenar un modelo. Usa "Convertir a Numérico" o selecciona más.`,
        variant: "destructive",
      });
    }
  }, [stats.numericSelected, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Optimizando datos para carga rápida...</p>
        </div>
      </div>
    );
  }

  // Preview optimizado: Muestra menos si grande
  const previewRows = data.slice(0, data.length > 1000 ? 10 : 15);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Fondo decorativo futurista */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background"></div>
      <div className="absolute top-40 left-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] animate-float"></div>
      <div className="absolute bottom-40 right-20 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '1s' }}></div>
      
      {/* Header mejorado */}
      <header className="sticky top-0 z-10 border-b border-border/30 bg-card/20 backdrop-blur-2xl shadow-xl">
        <div className="container mx-auto px-6 py-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2 hover:text-primary transition-all hover:scale-105"
          >
            ← Dashboard
          </Button>
          <div className="w-14 h-14 rounded-2xl bg-gradient-neon flex items-center justify-center shadow-glow animate-pulse-glow">
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Limpieza de Datos
            </h1>
            <p className="text-sm text-muted-foreground">
              Prepara y optimiza tus datos para el entrenamiento
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-6 py-12 animate-fade-in relative z-10">
        <div className="space-y-10 max-w-6xl mx-auto">
          {/* Stats mejorados */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { label: "Total Filas", value: stats.totalRows.toLocaleString(), icon: <Columns />, color: "text-foreground", gradient: "bg-gradient-card" },
              { label: "Columnas Seleccionadas", value: `${stats.selectedColumns}/${columns.length}`, icon: <Filter />, color: "text-primary", gradient: "bg-gradient-cyber" },
              { label: "Valores Nulos", value: stats.totalNulls, icon: <Trash2 />, color: "text-accent", gradient: "bg-gradient-fire" },
              { label: "Duplicados", value: stats.duplicates, icon: <Sparkles />, color: "text-destructive", gradient: "bg-gradient-neon" },
              { label: "Numéricas Sel.", value: stats.numericSelected, icon: <Hash />, color: stats.numericSelected >= 2 ? "text-green-600" : "text-yellow-600", gradient: "bg-gradient-forest" },
            ].map((item, idx) => (
              <Card
                key={idx}
                className="relative overflow-hidden p-6 border-2 border-border/40 bg-gradient-card backdrop-blur-sm shadow-card hover:shadow-glow hover:-translate-y-3 hover:scale-105 transition-all duration-500 animate-fade-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${item.gradient} border border-primary/20 shadow-glow`}>{item.icon}</div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Column Selection mejorado */}
          <Card className="p-8 bg-gradient-card border-2 border-border/40 shadow-card hover:shadow-glow transition-all duration-500">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-cyber flex items-center justify-center shadow-glow animate-pulse-glow">
                    <Filter className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Selección de Columnas</h2>
                    <p className="text-sm text-muted-foreground">
                      Elige las variables para entrenar tu modelo
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
                    onChange={(e) => debouncedSearch(e.target.value)}
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

          {/* Data Cleaning Actions mejorado */}
          <Card className="p-8 bg-gradient-card border-2 border-border/40 shadow-card hover:shadow-glow transition-all duration-500">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-cyber flex items-center justify-center shadow-glow animate-pulse-glow">
                  <Sparkles className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Limpieza de Datos</h2>
                  <p className="text-sm text-muted-foreground">
                    Transformaciones automáticas inteligentes
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
                  disabled={typeof stats.duplicates === 'string' || stats.duplicates === 0}
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
                    Mostrando las primeras {previewRows.length} filas del dataset cargado
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
                    {previewRows.map((row, idx) => (
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
              
              {data.length > previewRows.length && (
                <p className="text-sm text-muted-foreground text-center">
                  ... y {(data.length - previewRows.length).toLocaleString()} filas más
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
              className="gap-3 text-lg px-8 py-6 bg-gradient-cyber hover:opacity-90 hover:shadow-neon hover:scale-105 transition-all shadow-glow disabled:opacity-50 animate-pulse-glow rounded-xl"
              disabled={stats.numericSelected < 2}
            >
              Continuar a Entrenar Modelo
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Clean;
