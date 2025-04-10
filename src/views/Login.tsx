import FormImage from "@/components/custom/auth/FormImage";
import { LoginForm } from "@/components/custom/auth/LoginForm";

const Login = () => {
  return (
    <div className="bg-gray-300 h-screen w-full flex justify-center items-center">
      <div className="w-[80%] h-[80%]  flex flex-row justify-center items-center ">
        <FormImage />
        <LoginForm />
      </div>
    </div>
  );
};
export default Login;
