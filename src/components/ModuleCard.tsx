import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  route: string;
  gradient?: string;
}

export const ModuleCard = ({ 
  title, 
  description, 
  icon: Icon, 
  route,
  gradient = "from-primary to-accent"
}: ModuleCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      onClick={() => navigate(route)}
      className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-card-hover shadow-card bg-gradient-card border-border/50 hover:scale-[1.03] hover:-translate-y-1"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-0 group-hover:opacity-5 blur-3xl transition-opacity duration-500" />
      
      <div className="relative p-8 space-y-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-glow`}>
          <Icon className="w-7 h-7 text-primary-foreground" />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-foreground group-hover:bg-gradient-primary group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
};
