import { useState } from "react";
import { Area } from "@/core/model/area";
import { Worker, WorkerStatus } from "@/core/model/worker";
import { Fault, FaultType } from "@/core/model/fault";

export function useWorkers() {
    // Mock de áreas
    const [areas] = useState<Area[]>([
        { id: 1, name: "Construcción" },
        { id: 2, name: "Electricidad" },
        { id: 3, name: "Plomería" },
        { id: 4, name: "Carpintería" },
        { id: 5, name: "Pintura" }
    ]);

    // Mock de trabajadores
    const [workers] = useState<Worker[]>([
        {
            id: 1,
            name: "Juan Pérez",
            phone: "999888777",
            dni: "12345678",
            startDate: new Date("2020-01-15"),
            area: areas[0],
            status: WorkerStatus.AVAILABLE,
            code: "WP12345678"
        },
        {
            id: 2,
            name: "María López",
            phone: "998765432",
            dni: "87654321",
            startDate: new Date("2021-03-10"),
            area: areas[1],
            status: WorkerStatus.ASSIGNED,
            code: "WP87654321"
        },
        {
            id: 3,
            name: "Carlos Rodríguez",
            phone: "912345678",
            dni: "23456789",
            startDate: new Date("2022-04-20"),
            area: areas[2],
            status: WorkerStatus.AVAILABLE,
            code: "WP23456789"
        },
        {
            id: 4,
            name: "Ana Sánchez",
            phone: "934567890",
            dni: "34567890",
            startDate: new Date("2023-05-30"),
            area: areas[3],
            status: WorkerStatus.ASSIGNED,
            code: "WP34567890"
        },
        {
            id: 5,
            name: "Luis Torres",
            phone: "945678901",
            dni: "45678901",
            startDate: new Date("2020-08-25"),
            area: areas[0],
            status: WorkerStatus.DEACTIVATED,
            deactivationDate: new Date("2023-06-30"),
            code: "WP45678901"
        },
        {
            id: 6,
            name: "Elena Martínez",
            phone: "956789012",
            dni: "56789012",
            startDate: new Date("2021-02-18"),
            area: areas[1],
            status: WorkerStatus.INCAPACITATED,
            incapacity: {
                startDate: new Date("2023-08-01"),
                endDate: new Date("2023-09-01")
            },
            code: "WP56789012"
        },
        {
            id: 7,
            name: "Roberto Díaz",
            phone: "967890123",
            dni: "67890123",
            startDate: new Date("2022-07-05"),
            area: areas[4],
            status: WorkerStatus.AVAILABLE,
            code: "WP67890123"
        },
        {
            id: 8,
            name: "Carmen Flores",
            phone: "978901234",
            dni: "78901234",
            startDate: new Date("2023-01-10"),
            area: areas[2],
            status: WorkerStatus.ASSIGNED,
            code: "WP78901234"
        },
        {
            id: 9,
            name: "Miguel Vargas",
            phone: "989012345",
            dni: "89012345",
            startDate: new Date("2023-04-15"),
            area: areas[3],
            status: WorkerStatus.DEACTIVATED,
            deactivationDate: new Date("2023-09-01"),
            code: "WP89012345"
        },
        {
            id: 10,
            name: "Silvia Mendoza",
            phone: "990123456",
            dni: "90123456",
            startDate: new Date("2023-02-20"),
            area: areas[0],
            status: WorkerStatus.INCAPACITATED,
            incapacity: {
                startDate: new Date("2023-08-10"),
                endDate: new Date("2023-09-10")
            },
            code: "WP90123456"
        }
    ]);

    // Mock de faltas
    const [faults] = useState<Fault[]>([
        {
            id: 1,
            description: "No se presentó al trabajo sin previo aviso",
            type: FaultType.INASSISTANCE,
            worker: workers[1],
            createdAt: "2023-06-15"
        },
        {
            id: 2,
            description: "Comportamiento irrespetuoso hacia un supervisor",
            type: FaultType.IRRESPECTFUL,
            worker: workers[3],
            createdAt: "2023-07-22"
        },
        {
            id: 3,
            description: "Abandonó el lugar de trabajo antes de finalizar su turno",
            type: FaultType.ABANDONMENT,
            worker: workers[6],
            createdAt: "2023-08-10"
        },
        {
            id: 4,
            description: "No se presentó al trabajo por segundo día consecutivo",
            type: FaultType.INASSISTANCE,
            worker: workers[2],
            createdAt: "2023-09-05"
        },
        {
            id: 5,
            description: "Comportamiento inapropiado con cliente",
            type: FaultType.IRRESPECTFUL,
            worker: workers[7],
            createdAt: "2023-09-18"
        }
    ]);

    const allWorkers = workers.filter(worker => worker.status !== WorkerStatus.DEACTIVATED);
    const availableWorkers = workers.filter(worker => worker.status === WorkerStatus.AVAILABLE);
    const assignedWorkers = workers.filter(worker => worker.status === WorkerStatus.ASSIGNED);
    const deactivatedWorkers = workers.filter(worker => worker.status === WorkerStatus.DEACTIVATED);
    const incapacitatedWorkers = workers.filter(worker => worker.status === WorkerStatus.INCAPACITATED);

    return {
        allWorkers,
        availableWorkers,
        assignedWorkers,
        deactivatedWorkers,
        incapacitatedWorkers,
        workers,
        areas,
        faults
    };
}