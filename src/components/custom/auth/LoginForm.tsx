import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FaUserAstronaut } from "react-icons/fa";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { TbPasswordFingerprint } from "react-icons/tb";
import { authService } from "@/services/authService";
import { isLoadingAlert, StatusCodeAlert, StatusSuccessAlert } from "@/components/dialog/AlertsLogin";
import { useNavigate } from "react-router";
import  {  useState, useEffect, } from 'react';
import { TbShip } from "react-icons/tb";


function LogoFallback() {
  return (
    <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
      <div className="relative">
        <TbShip className="text-white text-5xl" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-800 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
          CP
        </div>
      </div>
    </div>
  );
}

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export function LoginForm() {
  const navigate = useNavigate();
  const [modelLoaded, setModelLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Solo renderizamos el Canvas después de que el componente esté montado
  useEffect(() => {
    setMounted(true);
    // Intentamos cargar el modelo, si falla después de 2 segundos, mostramos el respaldo
    const timeout = setTimeout(() => {
      if (!modelLoaded) {
        setHasError(true);
      }
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [modelLoaded]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      isLoadingAlert(true);
      const response = await authService.login(values);
      isLoadingAlert(false);
      StatusSuccessAlert("Login successful", "Welcome to CargoPlanner!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000); 
    } catch (error) {
      isLoadingAlert(false);
      setTimeout(() => {
        StatusCodeAlert(error as any);
      }, 1000);
    } finally {
      isLoadingAlert(false);
    }
  }

  return (
    <div className="w-full h-full flex justify-center items-center rounded-r-2xl bg-gray-200">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 w-[80%]"
      >
        <div className="flex flex-col justify-center items-center">

          <div className="h-24 w-24 mb-4">
        
              <LogoFallback />
     
        
          </div>
          
          <div className="text-2xl font-semibold font-sans text-[#4463e9]">
            Bienvenido a CargoPlanner
          </div>
          <div className="text-lg text-gray-900">Iniciar Sesion</div>
        </div>
        
        <FloatingInput
          id="username"
          label="Username"
          registration={form.register("username")}
          error={form.formState.errors.username}
          icon={<FaUserAstronaut size={18} />}
          required={true}
        />

        <FloatingInput
          id="password"
          label="Password"
          type="password"
          registration={form.register("password")}
          error={form.formState.errors.password}
          icon={<TbPasswordFingerprint size={18} />}
          required={true}
        />
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}