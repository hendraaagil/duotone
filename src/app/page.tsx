'use client'

import type React from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import {
	Upload,
	Download,
	RotateCcw,
	Palette,
	Sun,
	Contrast,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
	useImageUpload,
	useImageAdjustments,
	useCanvasProcessor,
	useImageExport,
	duotoneColors,
} from '@/hooks'

export default function ImageEditor() {
	const {
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
	} = useImageUpload()

	const {
		adjustments,
		setAdjustments,
		resetAdjustments,
		getCurrentDuotoneColors,
	} = useImageAdjustments()

	const { canvasRef, resetCanvas } = useCanvasProcessor(image, adjustments)
	const { handleSave } = useImageExport(
		originalImageRef,
		originalFilename,
		adjustments,
	)

	const handleNewImage = () => {
		resetImage()
		resetCanvas()
		resetAdjustments()
		fileInputRef.current?.click()
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="mx-auto w-full max-w-6xl space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-3xl font-bold text-foreground">
						Duotone Filters
					</h1>
				</div>

				{!image && (
					<Card
						className={cn(
							'border-2 border-dashed p-8 text-center transition-colors',
							isDragOver ? 'border-accent bg-accent/10' : 'border-border',
						)}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
					>
						<Upload className="mx-auto mb-4 h-12 w-12 text-slate-950" />
						<h3 className="mb-2 text-lg font-semibold">
							{isDragOver ? 'Drop your image here' : 'Upload an Image'}
						</h3>
						<p className="mb-4 text-slate-950">
							{isDragOver
								? 'Release to upload'
								: 'Drag and drop an image file or click to select'}
						</p>
						<Button
							onClick={() => fileInputRef.current?.click()}
							className="bg-accent hover:bg-accent/90"
						>
							Select Image
						</Button>
					</Card>
				)}

				{image && (
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						<div className="space-y-4 lg:col-span-2">
							<Card className="p-4">
								<div className="mb-4 flex items-center justify-between">
									<h3 className="text-lg font-semibold">Preview</h3>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={handleNewImage}
										>
											<Upload className="mr-2 h-4 w-4" />
											New Image
										</Button>
										<Button
											onClick={handleSave}
											className="bg-accent hover:bg-accent/90"
											size="sm"
										>
											<Download className="mr-2 h-4 w-4" />
											Save
										</Button>
									</div>
								</div>
								<div className="flex justify-center rounded-lg bg-card p-4">
									<canvas
										ref={canvasRef}
										className="h-auto max-w-full rounded border border-border"
									/>
								</div>
							</Card>
						</div>

						<div className="space-y-4">
							<Card className="gap-4 p-4">
								<div className="flex items-center gap-2">
									<Palette className="h-5 w-5 text-accent" />
									<h3 className="font-semibold">Filters</h3>
								</div>
								<div className="grid grid-cols-2 gap-2">
									{duotoneColors.map((filter) => (
										<Button
											key={filter.name}
											variant={
												adjustments.duotone === filter.name
													? 'default'
													: 'outline'
											}
											size="sm"
											onClick={() =>
												setAdjustments((prev) => ({
													...prev,
													duotone: filter.name,
												}))
											}
											className={cn(
												'h-auto p-2 text-xs',
												adjustments.duotone === filter.name &&
													'bg-accent hover:bg-accent/90',
											)}
										>
											<div className="space-y-1">
												<div className="text-xs font-medium">{filter.name}</div>
												{filter.colors && (
													<div className="flex gap-1">
														{filter.colors.map((color, idx) => (
															<div
																key={idx}
																className="h-3 w-3 rounded-full border border-border"
																style={{ backgroundColor: color }}
															/>
														))}
													</div>
												)}
												{filter.name === 'Custom' && (
													<div className="flex gap-1">
														<div
															className="h-3 w-3 rounded-full border border-border"
															style={{
																backgroundColor: adjustments.customColor1,
															}}
														/>
														<div
															className="h-3 w-3 rounded-full border border-border"
															style={{
																backgroundColor: adjustments.customColor2,
															}}
														/>
													</div>
												)}
											</div>
										</Button>
									))}
								</div>

								{adjustments.duotone !== 'Original' &&
									getCurrentDuotoneColors() && (
										<div className="rounded-lg bg-slate-200 p-3">
											<div className="mb-2 text-sm font-medium">
												Selected Colors:
											</div>
											<div className="space-y-2">
												{getCurrentDuotoneColors()!.map((color, idx) => (
													<div key={idx} className="flex items-center gap-2">
														<input
															type="color"
															value={
																adjustments.invertDuotone
																	? getCurrentDuotoneColors()![1 - idx]
																	: color
															}
															readOnly={adjustments.duotone !== 'Custom'}
															className={cn(
																'h-6 w-6 rounded border border-border',
																adjustments.duotone !== 'Custom'
																	? 'pointer-events-none opacity-75'
																	: 'cursor-pointer',
															)}
															onChange={(e) => {
																if (adjustments.duotone === 'Custom') {
																	const newColor = e.target.value
																	if (idx === 0) {
																		setAdjustments((prev) => ({
																			...prev,
																			customColor1: adjustments.invertDuotone
																				? newColor
																				: newColor,
																			customColor2: adjustments.invertDuotone
																				? prev.customColor1
																				: prev.customColor2,
																		}))
																	} else {
																		setAdjustments((prev) => ({
																			...prev,
																			customColor1: adjustments.invertDuotone
																				? prev.customColor2
																				: prev.customColor1,
																			customColor2: adjustments.invertDuotone
																				? newColor
																				: newColor,
																		}))
																	}
																}
															}}
														/>
														<input
															type="text"
															value={(adjustments.invertDuotone
																? getCurrentDuotoneColors()![1 - idx]
																: color
															).toUpperCase()}
															readOnly={adjustments.duotone !== 'Custom'}
															className={cn(
																'flex-1 rounded border border-border px-2 py-1 font-mono text-xs',
																adjustments.duotone !== 'Custom'
																	? 'cursor-not-allowed bg-slate-400'
																	: 'cursor-text bg-background',
															)}
															onChange={(e) => {
																if (adjustments.duotone === 'Custom') {
																	const newColor = e.target.value
																	if (idx === 0) {
																		setAdjustments((prev) => ({
																			...prev,
																			customColor1: adjustments.invertDuotone
																				? newColor
																				: newColor,
																			customColor2: adjustments.invertDuotone
																				? prev.customColor1
																				: prev.customColor2,
																		}))
																	} else {
																		setAdjustments((prev) => ({
																			...prev,
																			customColor1: adjustments.invertDuotone
																				? prev.customColor2
																				: prev.customColor1,
																			customColor2: adjustments.invertDuotone
																				? newColor
																				: newColor,
																		}))
																	}
																}
															}}
														/>
													</div>
												))}
											</div>
										</div>
									)}
							</Card>

							<Card className="gap-4 p-4">
								<div className="flex items-center gap-2">
									<Sun className="h-5 w-5 text-accent" />
									<h3 className="font-semibold">Brightness</h3>
									<span className="ml-auto text-sm font-semibold text-slate-950">
										{adjustments.brightness}%
									</span>
								</div>
								<Slider
									value={[adjustments.brightness]}
									onValueChange={(value) =>
										setAdjustments((prev) => ({
											...prev,
											brightness: value[0],
										}))
									}
									min={0}
									max={200}
									step={1}
									className="my-2 w-full"
								/>
							</Card>

							<Card className="gap-4 p-4">
								<div className="flex items-center gap-2">
									<Contrast className="h-5 w-5 text-accent" />
									<h3 className="font-semibold">Contrast</h3>
									<span className="ml-auto text-sm font-semibold text-slate-950">
										{adjustments.contrast}%
									</span>
								</div>
								<Slider
									value={[adjustments.contrast]}
									onValueChange={(value) =>
										setAdjustments((prev) => ({ ...prev, contrast: value[0] }))
									}
									min={0}
									max={200}
									step={1}
									className="my-2 w-full"
								/>
							</Card>

							<Button
								variant="outline"
								onClick={resetAdjustments}
								className="w-full bg-transparent"
							>
								<RotateCcw className="mr-2 h-4 w-4" />
								Reset All
							</Button>
						</div>
					</div>
				)}

				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleFileUpload}
					className="hidden"
				/>
			</div>
		</div>
	)
}
