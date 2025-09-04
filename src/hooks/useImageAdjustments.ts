import { useState } from 'react'
import { DUOTONE_COLORS, DEFAULT_ADJUSTMENTS } from '@/constants'

export interface ImageAdjustments {
	brightness: number
	contrast: number
	duotone: string | null
	invertDuotone: boolean
	customColor1: string
	customColor2: string
}

export const duotoneColors = DUOTONE_COLORS

export const useImageAdjustments = () => {
	const [adjustments, setAdjustments] =
		useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS)

	const resetAdjustments = () => {
		setAdjustments(DEFAULT_ADJUSTMENTS)
	}

	const getCurrentDuotoneColors = () => {
		if (adjustments.duotone === 'Custom') {
			return [adjustments.customColor1, adjustments.customColor2]
		}
		const duotoneFilter = duotoneColors.find(
			(d) => d.name === adjustments.duotone,
		)
		return duotoneFilter?.colors || null
	}

	return {
		adjustments,
		setAdjustments,
		resetAdjustments,
		getCurrentDuotoneColors,
	}
}
