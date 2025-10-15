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
      className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-card-hover shadow-card animate-fade-in bg-gradient-card border-border/50 hover:scale-[1.02]"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      <div className="relative p-6 space-y-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
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
