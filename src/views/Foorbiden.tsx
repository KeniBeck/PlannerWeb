import { SiAdblock } from "react-icons/si";

const Forbidden = () => {
    return(
        <>
        <div className="flex justify-center items-center w-full h-screen bg-gray-300">
            <div className="flex flex-col gap-3 justify-center items-center w-full">
                <div className="flex justify-center items-center w-full">
                    <SiAdblock className="text-8xl text-[#4463e9]" />
                </div>
                <div className="text-3xl font-semibold font-sans text-[#4463e9]">
                    403 Forbidden
                </div>
                <div className="text-lg text-gray-900">
                    No tienes permiso para acceder a esta página.
                </div>
            </div>
        </div>
        </>
    )
}
export default Forbidden