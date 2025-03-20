import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { Group } from '@/types/group'

export const useKinematicStore = defineStore('kinematicGroups', {
	state: () => ({
		groups: [] as Group[], // Lista de grupos
		filterApplied: false,
		searchGroupID: '',
	}),
	getters: {
		filteredGroups(state): Group[] {
			let filtered = state.groups

			// Filtrar por Group ID si se aplica un filtro
			if (state.filterApplied && state.searchGroupID) {
				filtered = state.groups.filter(
					(group) => group.group_id.toLowerCase() === state.searchGroupID.toLowerCase(),
				)
			}

			// Ordenar los grupos por ID de menor a mayor
			return filtered
  .filter(item => item.id !== undefined) // Ensure all items have a defined `id`
  .sort((a, b) => (a.id || 0) - (b.id || 0)); // Use fallback value `0` if `id` is undefined
		},
	},
	actions: {
		async fetchGroups(): Promise<void> {
			try {
				const { data, error } = await supabase
					.from('kinematic_groups')
					.select('*')
					.order('id', { ascending: true }) // Ordenar los datos desde Supabase

				if (error) throw error
				this.groups = data as Group[]
			} catch (error) {
				console.error('Error al cargar grupos:', error)
			}
		},
		applyFilter(searchGroupID: string): void {
			this.searchGroupID = searchGroupID
			this.filterApplied = true
		},
		showAll(): void {
			this.searchGroupID = ''
			this.filterApplied = false
		},
		validateGroup(group: Group): boolean {
			if (!group.group_id || group.group_id.trim() === '') {
				console.error('El campo Group ID es obligatorio.')
				alert('Por favor, ingresa un valor para Group ID.')
				return false
			}
			if (!group.servo_id || group.servo_id < 1 || group.servo_id > 6) {
				console.error('El campo Servo ID debe ser un número entre 1 y 6.')
				alert('Por favor, selecciona un valor válido para Servo ID (entre 1 y 6).')
				return false
			}
			return true
		},
		async saveChanges(updatedGroup: Group): Promise<void> {
			try {
				if (!this.validateGroup(updatedGroup)) return

				const { id, group_id, servo_id, direction, min_value, max_value } = updatedGroup
				if (!id) throw new Error('El ID del grupo es requerido para actualizar')

				// Actualizar en Supabase
				await supabase
					.from('kinematic_groups')
					.update({ group_id, servo_id, direction, min_value, max_value })
					.eq('id', id)

				// Refrescar los datos locales
				await this.fetchGroups()
			} catch (error) {
				console.error('Error al guardar cambios:', error)
			}
		},
		async addNewGroup(newGroup: Group): Promise<void> {
			try {
				if (!this.validateGroup(newGroup)) return

				// Insertar en Supabase
				await supabase.from('kinematic_groups').insert([newGroup])

				// Refrescar los datos locales
				await this.fetchGroups()
			} catch (error) {
				console.error('Error al agregar nuevo grupo:', error)
			}
		},
		async deleteGroup(id: number): Promise<void> {
			try {
				await supabase.from('kinematic_groups').delete().eq('id', id)
				await this.fetchGroups()
			} catch (error) {
				console.error('Error al eliminar grupo:', error)
			}
		},
		exportToJson(): void {
			const dataStr = JSON.stringify(this.filteredGroups, null, 2)
			const blob = new Blob([dataStr], { type: 'application/json' })
			const url = URL.createObjectURL(blob)

			const link = document.createElement('a')
			link.href = url
			link.download = `kinematic_groups.json`
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
		},
	},
})
