import { useRef, useCallback, useEffect } from 'react'
import { DUOTONE_COLORS } from '@/constants'

import type { ImageAdjustments } from './useImageAdjustments'

export const useCanvasProcessor = (
	image: HTMLImageElement | null,
	adjustments: ImageAdjustments,
) => {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const originalImageData = useRef<ImageData | null>(null)

	const hexToRgb = (hex: string) => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
		return result
			? {
					r: Number.parseInt(result[1], 16),
					g: Number.parseInt(result[2], 16),
					b: Number.parseInt(result[3], 16),
				}
			: { r: 0, g: 0, b: 0 }
	}

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
		[],
	)

	const drawImageToCanvas = useCallback((img: HTMLImageElement) => {
		setTimeout(() => {
			const canvas = canvasRef.current
			if (!canvas) {
				console.log('Canvas not found, retrying...')
				setTimeout(() => drawImageToCanvas(img), 100)
				return
			}

			const ctx = canvas.getContext('2d')
			if (!ctx) {
				console.log('Canvas context not found')
				return
			}

			const maxWidth = 400
			const maxHeight = 300
			let { width, height } = img

			if (width > maxWidth) {
				height = (height * maxWidth) / width
				width = maxWidth
			}
			if (height > maxHeight) {
				width = (width * maxHeight) / height
				height = maxHeight
			}

			canvas.width = width
			canvas.height = height

			ctx.clearRect(0, 0, width, height)
			ctx.drawImage(img, 0, 0, width, height)

			originalImageData.current = ctx.getImageData(0, 0, width, height)
			console.log('Image drawn to canvas successfully', width, height)
		}, 50)
	}, [])

	const applyAdjustments = useCallback(() => {
		const canvas = canvasRef.current
		if (!canvas || !originalImageData.current) return

		const ctx = canvas.getContext('2d')
		if (!ctx) return

		const imageData = new ImageData(
			new Uint8ClampedArray(originalImageData.current.data),
			originalImageData.current.width,
			originalImageData.current.height,
		)

		const data = imageData.data
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
				applyDuotone(imageData, colorsToUse, adjustments.invertDuotone)
			}
		}

		ctx.putImageData(imageData, 0, 0)
	}, [adjustments, applyDuotone])

	const resetCanvas = () => {
		originalImageData.current = null
	}

	useEffect(() => {
		if (image) {
			requestAnimationFrame(() => {
				drawImageToCanvas(image)
			})
		}
	}, [image, drawImageToCanvas])

	useEffect(() => {
		if (image && originalImageData.current) {
			applyAdjustments()
		}
	}, [adjustments, applyAdjustments, image])

	return {
		canvasRef,
		originalImageData,
		applyAdjustments,
		applyDuotone,
		resetCanvas,
	}
}
