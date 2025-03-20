<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useKinematicStore } from '@/stores/kinematicGroups'
import GroupForm from '@/components/GroupForm.vue'
import type { Group } from '@/types/group'

const store = useKinematicStore()
const editingGroup = ref<Group | null>(null) // Grupo en edición
const newGroup = ref<Group | null>(null) // Nuevo grupo

onMounted(() => {
    store.fetchGroups()
})

// Abrir modal de edición con una copia del grupo
const openEditModal = (group: Group) => {
    editingGroup.value = { ...group } // Crear una copia del grupo para evitar mutaciones directas
}

// Guardar cambios en el grupo editado
const handleSaveChanges = async (updatedGroup: Group) => {
    try {
        await store.saveChanges(updatedGroup) // Guardar en el backend
        editingGroup.value = null // Cerrar el modal
    } catch (error) {
        console.error('Error al guardar cambios:', error)
    }
}

// Abrir modal para agregar un nuevo grupo
const openAddModal = () => {
    newGroup.value = {
        group_id: '',
        servo_id: 1,
        direction: 'Normal',
        min_value: 0,
        max_value: 180,
    }
}

// Agregar un nuevo grupo
const handleAddNewGroup = async (newGroupData: Group) => {
    try {
        await store.addNewGroup(newGroupData) // Guardar en el backend
        newGroup.value = null // Cerrar el modal
    } catch (error) {
        console.error('Error al agregar nuevo grupo:', error)
    }
}
</script>

<template>
    <div class="container-fluid mt-4">
        <h1 class="text-center mb-4 text-primary">Kinematic Groups</h1>

        <!-- Barra de búsqueda y acciones -->
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
            <!-- Campo de búsqueda y botones de filtrado -->
            <div class="input-group w-100 w-md-50 mb-3 mb-md-0">
                <input
                    v-model="store.searchGroupID"
                    type="text"
                    class="form-control shadow-sm rounded-pill"
                    placeholder="Buscar Group ID..."
                    aria-label="Search Group ID"
                />
                <div class="d-flex flex-column flex-md-row gap-2 w-100 w-md-auto">
                    <button
                        class="btn btn-primary shadow-sm rounded-pill w-100 w-md-auto"
                        @click="store.applyFilter(store.searchGroupID)"
                    >
                        <i class="bi bi-search"></i> Filtrar
                    </button>
                    <button
                        v-if="store.filterApplied"
                        class="btn btn-secondary shadow-sm rounded-pill w-100 w-md-auto"
                        @click="store.showAll"
                    >
                        <i class="bi bi-list"></i> Mostrar Todo
                    </button>
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="d-flex flex-column flex-md-row gap-3 mt-2 mt-md-0 w-100 w-md-auto">
                <button
                    class="btn btn-success shadow-sm rounded-pill d-flex align-items-center justify-content-center px-3 py-2 w-100 w-md-auto"
                    @click="openAddModal"
                    title="Agregar nuevo grupo"
                >
                    <i class="bi bi-plus-circle me-2"></i> Agregar Grupo
                </button>

                <button
                    class="btn btn-info shadow-sm rounded-pill d-flex align-items-center justify-content-center px-3 py-2 w-100 w-md-auto"
                    @click="store.exportToJson"
                    :disabled="store.filteredGroups.length === 0"
                    :class="{ 'opacity-50': store.filteredGroups.length === 0 }"
                    title="Exportar datos a JSON"
                >
                    <i class="bi bi-download me-2"></i> Exportar Datos
                </button>
            </div>
        </div>

        <!-- Tabla de Grupos -->
        <div class="table-responsive shadow rounded">
            <table class="table table-striped table-hover align-middle">
                <thead class="table-dark sticky-top">
                    <tr>
                        <th scope="col" class="text-nowrap">ID</th>
                        <th scope="col" class="text-nowrap">Servo ID</th>
                        <th scope="col" class="text-nowrap">Dirección</th>
                        <th scope="col" class="text-nowrap">Mínimo</th>
                        <th scope="col" class="text-nowrap">Máximo</th>
                        <th scope="col" class="text-nowrap">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="group in store.filteredGroups" :key="group.id">
                        <td class="text-nowrap">{{ group.id }}</td>
                        <td class="text-nowrap">{{ group.servo_id }}</td>
                        <td class="text-nowrap">{{ group.direction }}</td>
                        <td class="text-nowrap">{{ group.min_value }}</td>
                        <td class="text-nowrap">{{ group.max_value }}</td>
                        <td class="text-nowrap d-flex justify-content-center gap-2">
                            <button
                                class="btn btn-primary btn-sm shadow-sm"
                                @click="openEditModal(group)"
                                title="Editar"
                            >
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button
                                class="btn btn-danger btn-sm shadow-sm"
                                @click="store.deleteGroup(group.id!)"
                                title="Eliminar"
                            >
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal de Edición -->
        <GroupForm
            v-if="editingGroup"
            :group="editingGroup"
            @save="handleSaveChanges"
            @cancel="editingGroup = null"
            class="modal fade show d-block"
            style="background-color: rgba(0, 0, 0, 0.5)"
        />

        <!-- Modal para Agregar Nuevo Grupo -->
        <GroupForm
            v-if="newGroup"
            :group="newGroup"
            @save="handleAddNewGroup"
            @cancel="newGroup = null"
            class="modal fade show d-block"
            style="background-color: rgba(0, 0, 0, 0.5)"
        />
    </div>
</template>
