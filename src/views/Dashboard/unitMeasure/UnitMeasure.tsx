import { DataTable, TableColumn } from "@/components/ui/DataTable";
import SectionHeader, { ExcelColumn } from "@/components/ui/SectionHeader";
import { useUnitsMeasure } from "@/contexts/UnitMeasureContext";
import type { UnitMeasure } from "@/core/model/unitMeasure";
import { useMemo, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";

export default function UnitMeasure() {
    const { unitsMeasure, loading, error, refreshData, addUnitMeasure } = useUnitsMeasure();

    const [searchTerm, setSearchTerm] = useState("");

    // Filtrar unidades de medida por búsqueda
    const filteredUnitsMeasure = useMemo(
        () =>
            unitsMeasure.filter((u) => {
                // Filtro por búsqueda
                const matchesSearch =
                    u.name.toLowerCase().includes(searchTerm.toLowerCase());

                    console.log("Filtering unitsMeasure:", {
                        searchTerm,
                        filtered: unitsMeasure.filter((u) =>
                            u.name.toLowerCase().includes(searchTerm.toLowerCase())
                        ),
                    });

                return matchesSearch;
            }).map(unit => ({
                ...unit,
                id: unit.id ?? 0 // Ensure id is never undefined
            })),
        [unitsMeasure, searchTerm]
    );

    // Manejador de búsqueda
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("Search term changed:", e.target.value);
        setSearchTerm(e.target.value);
    };


    // Definir las columnas para la tabla
    const columns: TableColumn<UnitMeasure>[] = useMemo(
        () => [
            {
                header: "ID",
                accessor: "id",
                className: "font-medium",
            },
            {
                header: "Nombre",
                accessor: "name",
            },
            {
                header: "Estado",
                accessor: "status",
                cell: (row) => (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {row.status}
                    </span>
                ),
            },

        ],
        []
    );


    // Definir las columnas para exportar unidades de medida a Excel
    const unitExportColumns: ExcelColumn[] = useMemo(
        () => [
            { header: "ID", field: "id" },
            { header: "Nombre", field: "name" },
            { header: "Estado", field: "status", transform: (value: string) => value === "ACTIVE" ? "Activa" : "Inactiva" },
        ],
        []
    );


    return (
        <>
            <div className="container mx-auto py-6 space-y-6">
                <div className="rounded-xl shadow-md">
                    {/* Header con exportación */}
                    <SectionHeader
                        title="Unidades de Medida"
                        subtitle="Gestión de unidades de medida del sistema"
                        btnAddText="Agregar Unidad"
                        handleAddArea={() => { }}
                        refreshData={() => Promise.resolve(refreshData())}
                        loading={loading}
                        exportData={filteredUnitsMeasure}
                        exportFileName="unidades_de_medida"
                        exportColumns={unitExportColumns}
                        currentView="units"
                    />

                    {/* Filtros */}
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-b-md">
                        <div className="flex gap-4 items-center p-2">
                            <div>
                                <div className="relative">
                                    <AiOutlineSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre"
                                        className="p-2 pl-10 w-80 border border-blue-200 bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>


                        </div>
                    </div>
                </div>

                {/* Vista principal con DataTable */}
                <div className="shadow-lg rounded-xl overflow-hidden border border-gray-100">
                    <div className="bg-white p-4">
                        <DataTable
                            data={filteredUnitsMeasure}
                            columns={columns}
                            // actions={actions}
                            isLoading={loading}
                            itemsPerPage={10}
                            itemName="usuarios"
                            initialSort={{ key: "name", direction: "asc" }}
                            emptyMessage="No se encontraron usuarios"
                        />
                    </div>
                </div>

                {/* Diálogo para agregar/editar usuario
                <AddUserDialog
                  open={isAddUserOpen}
                  onOpenChange={setIsAddUserOpen}
                  user={userToEdit}
                  onSave={handleSaveUser}
                />
        
                {/* Diálogo para cambiar contraseña */}
                {/* <ChangePasswordDialog
                  open={isChangePasswordOpen}
                  onOpenChange={setIsChangePasswordOpen}
                  dni={userToChangePassword?.dni}
                  userName={userToChangePassword?.name}
                  onSave={handleSavePassword}
                /> */}
            </div>
            {/*         
              <ActivateItemAlert
                open={!!areaToActivate}
                onOpenChange={(open: any) => !open && setAreaToActivate(null)}
                onConfirm={confirmActivateUser}
                itemName="usuario"
                isLoading={loading}
              />
        
              <DeactivateItemAlert
                open={!!areaToDelete}
                onOpenChange={(open: any) => !open && setAreaToDelete(null)}
                onConfirm={confirmDeleteUser}
                itemName="usuario"
                isLoading={loading}
              /> */}
        </>
    )
}