import { useCallback } from 'react'
import { DUOTONE_COLORS, IMAGE_EXTENSION_REGEX } from '@/constants'

import type { ImageAdjustments } from './useImageAdjustments'

export const useImageExport = (
	originalImageRef: React.RefObject<HTMLImageElement | null>,
	originalFilename: string,
	adjustments: ImageAdjustments,
) => {
	const hexToRgb = useCallback((hex: string) => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
		return result
			? {
					r: Number.parseInt(result[1], 16),
					g: Number.parseInt(result[2], 16),
					b: Number.parseInt(result[3], 16),
				}
			: { r: 0, g: 0, b: 0 }
	}, [])

	const applyDuotone = useCallback(
		(imageData: ImageData, colors: string[], invert = false) => {
			const data = imageData.data
			const color1 = hexToRgb(invert ? colors[1] : colors[0])
			const color2 = hexToRgb(invert ? colors[0] : colors[1])

			for (let i = 0; i < data.length; i += 4) {
				const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
				const normalizedGray = gray / 255

				data[i] = color1.r + (color2.r - color1.r) * normalizedGray
				data[i + 1] = color1.g + (color2.g - color1.g) * normalizedGray
				data[i + 2] = color1.b + (color2.b - color1.b) * normalizedGray
			}

			return imageData
		},
		[hexToRgb],
	)

	const handleSave = useCallback(() => {
		const originalImg = originalImageRef.current
		if (!originalImg) return

		const tempCanvas = document.createElement('canvas')
		const tempCtx = tempCanvas.getContext('2d')
		if (!tempCtx) return

		tempCanvas.width = originalImg.width
		tempCanvas.height = originalImg.height

		tempCtx.drawImage(originalImg, 0, 0)

		const fullSizeImageData = tempCtx.getImageData(
			0,
			0,
			originalImg.width,
			originalImg.height,
		)
		const data = fullSizeImageData.data
		const brightnessFactor = adjustments.brightness / 100
		const contrastFactor = adjustments.contrast / 100

		for (let i = 0; i < data.length; i += 4) {
			data[i] *= brightnessFactor
			data[i + 1] *= brightnessFactor
			data[i + 2] *= brightnessFactor

			data[i] = (data[i] - 128) * contrastFactor + 128
			data[i + 1] = (data[i + 1] - 128) * contrastFactor + 128
			data[i + 2] = (data[i + 2] - 128) * contrastFactor + 128
		}

		if (adjustments.duotone && adjustments.duotone !== 'Original') {
			let colorsToUse: string[] | null = null

			if (adjustments.duotone === 'Custom') {
				colorsToUse = [adjustments.customColor1, adjustments.customColor2]
			} else {
				const duotoneFilter = DUOTONE_COLORS.find(
					(d) => d.name === adjustments.duotone,
				)
				colorsToUse = duotoneFilter?.colors || null
			}

			if (colorsToUse) {
				applyDuotone(fullSizeImageData, colorsToUse, adjustments.invertDuotone)
			}
		}

		tempCtx.putImageData(fullSizeImageData, 0, 0)

		const getFileExtension = (filename: string): string => {
			const match = filename.match(IMAGE_EXTENSION_REGEX)
			return match ? match[1].toLowerCase() : 'png'
		}

		const getMimeType = (extension: string): string => {
			switch (extension) {
				case 'jpg':
				case 'jpeg':
					return 'image/jpeg'
				case 'gif':
					return 'image/gif'
				case 'webp':
					return 'image/webp'
				default:
					return 'image/png'
			}
		}

		const originalExtension = originalFilename
			? getFileExtension(originalFilename)
			: 'png'
		const mimeType = getMimeType(originalExtension)
		const quality =
			originalExtension === 'jpg' || originalExtension === 'jpeg'
				? 0.95
				: undefined

		tempCanvas.toBlob(
			(blob) => {
				if (blob) {
					const url = URL.createObjectURL(blob)
					const a = document.createElement('a')
					a.href = url
					const baseFilename = originalFilename
						? originalFilename.replace(IMAGE_EXTENSION_REGEX, '')
						: 'edited-image'
					a.download = `${baseFilename}-duotone.${originalExtension}`
					a.click()
					URL.revokeObjectURL(url)
				}
			},
			mimeType,
			quality,
		)
	}, [originalImageRef, originalFilename, adjustments, applyDuotone])

	return {
		handleSave,
	}
}
