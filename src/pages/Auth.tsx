import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, UserPlus, Database, Shield, Lock } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }).max(255),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }).max(100),
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === 'SIGNED_IN') {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        title: "Error de validación",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: validation.data.email,
          password: validation.data.password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Error de autenticación",
              description: "Email o contraseña incorrectos",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente",
        });
      } else {
        const redirectUrl = `${window.location.origin}/`;
        
        const { error } = await supabase.auth.signUp({
          email: validation.data.email,
          password: validation.data.password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Usuario existente",
              description: "Este email ya está registrado. Intenta iniciar sesión.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: "¡Registro exitoso!",
          description: "Tu cuenta ha sido creada. Redirigiendo...",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Algo salió mal. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex items-center justify-center">
      {/* Fondo decorativo futurista */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-accent/5 to-background"></div>
      <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[130px] animate-float"></div>
      <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[110px] animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-md mx-auto space-y-8 animate-fade-in">
          {/* Logo y header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse-glow mx-auto">
              <Database className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isLogin ? "Accede a tu plataforma de ML" : "Comienza tu viaje en ML"}
              </p>
            </div>
          </div>

          {/* Card de autenticación */}
          <Card className="p-8 border-2 border-border/40 bg-gradient-card backdrop-blur-md shadow-card hover:shadow-glow transition-all duration-500 rounded-2xl">
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-card/50 border-border/50 focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-card/50 border-border/50 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gap-3 text-lg py-6 bg-gradient-cyber font-bold hover:opacity-90 hover:shadow-neon hover:scale-105 transition-all rounded-xl shadow-glow"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    {isLogin ? (
                      <>
                        <LogIn className="w-5 h-5" />
                        Iniciar Sesión
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        Crear Cuenta
                      </>
                    )}
                  </>
                )}
              </Button>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {isLogin ? (
                    <>
                      ¿No tienes cuenta?{" "}
                      <span className="font-bold text-primary">Regístrate aquí</span>
                    </>
                  ) : (
                    <>
                      ¿Ya tienes cuenta?{" "}
                      <span className="font-bold text-primary">Inicia sesión</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </Card>

          {/* Link de vuelta al dashboard */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-primary"
            >
              ← Volver al Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
