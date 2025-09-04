import { useState, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import { IMAGE_EXTENSION_REGEX } from '@/constants'

export const useImageUpload = () => {
	const [image, setImage] = useState<HTMLImageElement | null>(null)
	const [originalFilename, setOriginalFilename] = useState<string>('')
	const [isDragOver, setIsDragOver] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const originalImageRef = useRef<HTMLImageElement | null>(null)

	const loadImage = useCallback((file: File) => {
		setOriginalFilename(file.name)
		const reader = new FileReader()
		reader.onload = (e) => {
			const img = new Image()
			img.onload = () => {
				console.log('Image loaded successfully', img.width, img.height)
				setImage(img)
				originalImageRef.current = img
			}
			img.onerror = (error) => {
				console.error('Error loading image:', error)
			}
			img.src = e.target?.result as string
		}
		reader.onerror = (error) => {
			console.error('Error reading file:', error)
		}
		reader.readAsDataURL(file)
	}, [])

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		if (!IMAGE_EXTENSION_REGEX.test(file.name)) {
			toast.error('Please upload a valid image file (PNG, JPEG, GIF, or WebP)')
			return
		}

		loadImage(file)
	}

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragOver(true)
	}, [])

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragOver(false)
	}, [])

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault()
			e.stopPropagation()
			setIsDragOver(false)

			const files = e.dataTransfer.files
			if (files.length === 0) return

			const file = files[0]
			if (!IMAGE_EXTENSION_REGEX.test(file.name)) {
				toast.error(
					'Please upload a valid image file (PNG, JPEG, GIF, or WebP)',
				)
				return
			}

			loadImage(file)
		},
		[loadImage],
	)

	const resetImage = () => {
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
		setImage(null)
		setOriginalFilename('')
		originalImageRef.current = null
	}

	return {
		image,
		originalFilename,
		isDragOver,
		fileInputRef,
		originalImageRef,
		handleFileUpload,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		resetImage,
	}
}
