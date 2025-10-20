import { createContext, useContext, useState, ReactNode } from "react";
import { mockCsvData, mockCsvColumns, mockFileName } from "@/data/mockData";

interface DataContextType {
  csvData: any[] | null;
  csvColumns: Array<{ id: number; name: string; type: string; selected: boolean; nulls: number }> | null;
  setCsvData: (data: any[]) => void;
  setCsvColumns: (columns: Array<{ id: number; name: string; type: string; selected: boolean; nulls: number }>) => void;
  fileName: string | null;
  setFileName: (name: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [csvData, setCsvData] = useState<any[] | null>(mockCsvData);
  const [csvColumns, setCsvColumns] = useState<Array<{ id: number; name: string; type: string; selected: boolean; nulls: number }> | null>(mockCsvColumns);
  const [fileName, setFileName] = useState<string | null>(mockFileName);

  return (
    <DataContext.Provider value={{ csvData, csvColumns, setCsvData, setCsvColumns, fileName, setFileName }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
