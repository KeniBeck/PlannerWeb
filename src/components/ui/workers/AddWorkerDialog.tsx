import { useState, useEffect } from 'react';
import { Worker, WorkerStatus } from '@/core/model/worker';
import { Area } from '@/core/model/area';
import { fail } from 'assert';
import { fromTheme } from 'tailwind-merge';

interface AddWorkerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    areas?: Area[];
    onAddWorker?: (worker: Omit<Worker, 'id'>) => void;
}

export function AddWorkerDialog({ open, onOpenChange, areas = [], onAddWorker }: AddWorkerDialogProps) {
    // Estado para el formulario
    const [formData, setFormData] = useState({
        name: '',
        dni: '',
        code: '',
        phone: '',
        areaId: '',
    });

    // Estado para validación
    const [errors, setErrors] = useState({
        name: '',
        dni: '',
        code: '',
        phone: '',
        areaId: '',
    });

    // Restablecer el formulario cuando se abre/cierra
    useEffect(() => {
        if (!open) {
            setFormData({
                name: '',
                dni: '',
                code: '',
                phone: '',
                areaId: '',
            });
            setErrors({
                name: '',
                dni: '',
                code: '',
                phone: '',
                areaId: '',
            });
        }
    }, [open]);

    const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Solo permitir números
        setFormData(prev => ({
            ...prev,
            dni: value
        }));

        // Limpiar mensaje de error
        setErrors(prev => ({
            ...prev,
            dni: ''
        }));
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Solo permitir números
        setFormData(prev => ({
            ...prev,
            phone: value
        }));

        // Limpiar mensaje de error
        setErrors(prev => ({
            ...prev,
            phone: ''
        }));
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); // Solo permitir letras y espacios
        setFormData(prev => ({
            ...prev,
            name: value
        }));

        // Limpiar mensaje de error
        setErrors(prev => ({
            ...prev,
            name: ''
        }));
    }

    // Gestionar cambios en el formulario
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Para campos específicos, usar manejadores especiales
        if (name === 'dni') {
            handleDniChange(e as React.ChangeEvent<HTMLInputElement>);
            return;
        }

        if (name === 'phone') {
            handlePhoneChange(e as React.ChangeEvent<HTMLInputElement>);
            return;
        }

        if (name === 'name') {
            handleNameChange(e as React.ChangeEvent<HTMLInputElement>);
            return;
        }

        // Para los demás campos, usar el manejador genérico
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar mensaje de error
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };


    // Validar el formulario
    const validateForm = () => {
        const newErrors = {
            name: '',
            dni: '',
            code: '',
            phone: '',
            areaId: '',
        };

        // Validación del nombre: no debe contener números y es obligatorio
        if (!formData.name) {
            newErrors.name = 'El nombre es obligatorio';
        } else if (/\d/.test(formData.name)) {
            newErrors.name = 'El nombre no debe contener números';
        }

        // Validación del DNI: solo debe contener números y es obligatorio
        if (!formData.dni) {
            newErrors.dni = 'El documento es obligatorio';
        } else if (!/^\d+$/.test(formData.dni)) {
            newErrors.dni = 'El documento debe contener solo números';
        } else if (formData.dni.length < 8 || formData.dni.length > 12) {
            newErrors.dni = 'El documento debe tener entre 8 y 12 dígitos';
        }

        // Validación del teléfono: solo debe contener números y tener longitud adecuada
        if (!formData.phone) {
            newErrors.phone = 'El teléfono es obligatorio';
        } else if (!/^\d+$/.test(formData.phone)) {
            newErrors.phone = 'El teléfono debe contener solo números';
        } else if (formData.phone.length < 9 || formData.phone.length > 12) {
            newErrors.phone = 'El teléfono debe tener entre 9 y 12 dígitos';
        }

        // Validación del área: debe seleccionarse una
        if (!formData.areaId) {
            newErrors.areaId = 'Debe seleccionar un área';
        }

        setErrors(newErrors);

        // El formulario es válido si no hay mensajes de error
        return !Object.values(newErrors).some(error => error !== '');
    };

    // Manejar envío del formulario
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const selectedArea = areas.find(area => area.id.toString() === formData.areaId);

        if (!selectedArea) {
            setErrors(prev => ({ ...prev, areaId: 'Área no válida' }));
            return;
        }

        const newWorker = {
            name: formData.name,
            dni: formData.dni,
            code: formData.code,
            phone: formData.phone,
            jobArea: selectedArea,
            status: WorkerStatus.AVAILABLE,
            createAt: new Date(),
        };

        onAddWorker?.(newWorker);
        onOpenChange(false);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/70" >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">Nuevo Trabajador</h3>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="text-white hover:text-blue-200 focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-5">
                        {/* Campo: Nombre */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre completo <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ej. Juan Pérez García"
                                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                        </div>

                        {/* Campo: DNI */}
                        <div>
                            <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1">
                                Documento de identidad <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="dni"
                                name="dni"
                                value={formData.dni}
                                onChange={handleChange}
                                placeholder="Ej. 12345678"
                                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.dni ? 'border-red-300' : 'border-gray-300'
                                    }`}
                            />
                            {errors.dni && <p className="mt-1 text-sm text-red-500">{errors.dni}</p>}
                        </div>

                        {/* Campo: Código */}
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                                Código <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="code"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="Ej. WP123456"
                                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.code ? 'border-red-300' : 'border-gray-300'
                                    }`}
                            />
                            {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}

                        </div>

                        {/* Campo: Teléfono */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Teléfono <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Ej. 987654321"
                                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.phone ? 'border-red-300' : 'border-gray-300'
                                    }`}
                            />
                            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                        </div>

                        {/* Campo: Área */}
                        <div>
                            <label htmlFor="areaId" className="block text-sm font-medium text-gray-700 mb-1">
                                Área <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    id="areaId"
                                    name="areaId"
                                    value={formData.areaId}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${errors.areaId ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Seleccione un área</option>
                                    {areas.map((area) => (
                                        <option key={area.id} value={area.id.toString()}>
                                            {area.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-3 pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            {errors.areaId && <p className="mt-1 text-sm text-red-500">{errors.areaId}</p>}
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}