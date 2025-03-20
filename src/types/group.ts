export interface Group {
	id?: number
	group_id: string
	servo_id: number
	direction: 'Normal' | 'Reversed'
	min_value: number
	max_value: number
}

export interface GroupFormProps {
	group: Group
}
