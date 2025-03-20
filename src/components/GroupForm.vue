<script setup lang="ts">
import { reactive } from 'vue';
import type { Group } from '@/types/group';

const props = defineProps<{
	group: Group; // Prop con el grupo recibido
}>();

const emit = defineEmits<{
	(e: 'save', group: Group): void; // Emitir un evento con un objeto Group
	(e: 'cancel'): void; // Emitir un evento sin argumentos
}>();

// Crear una copia local de la prop usando `reactive`
const localGroup = reactive({ ...props.group });

// Guardar cambios
const save = () => {
	emit('save', { ...localGroup }); // Emitir una copia del grupo local
};

// Cancelar edición
const cancel = () => {
	emit('cancel'); // Cerrar el modal
};
</script>

<template>
	<div class="modal fade show d-block" tabindex="-1">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">{{ localGroup.id ? 'Editar Grupo' : 'Agregar Nuevo Grupo' }}</h5>
					<button type="button" class="btn-close" @click="cancel"></button>
				</div>
				<div class="modal-body">
					<input v-model="localGroup.group_id" type="text" class="form-control mb-2" placeholder="Group ID"
						required />
					<select v-model="localGroup.servo_id" class="form-select mb-2" required>
						<option v-for="n in 6" :key="n" :value="n">{{ n }}</option>
					</select>
					<select v-model="localGroup.direction" class="form-select mb-2" required>
						<option value="Normal">Normal</option>
						<option value="Reversed">Reversed</option>
					</select>
					<div class="mb-3">
						<label for="min-value" class="form-label">Min Value</label>
						<input type="range" v-model.number="localGroup.min_value" class="form-range" id="min-value"
							min="0" :max="localGroup.max_value" required />
						<span>{{ localGroup.min_value }}</span>
					</div>
					<div class="mb-3">
						<label for="max-value" class="form-label">Max Value</label>
						<input type="range" v-model.number="localGroup.max_value" class="form-range" id="max-value"
							:min="localGroup.min_value" max="1023" required />
						<span>{{ localGroup.max_value }}</span>
					</div>
				</div>
				<div class="modal-footer">
					<button class="btn btn-secondary" @click="cancel">Cancelar</button>
					<button class="btn btn-success" @click="save">Guardar</button>
				</div>
			</div>
		</div>
	</div>
</template>
