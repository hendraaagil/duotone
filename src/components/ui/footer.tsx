import { Github } from 'lucide-react'

export function Footer() {
	return (
		<footer className="border-t border-border bg-background/50 text-foreground backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto w-fit px-4 py-2">
				<a
					href="https://github.com/hendraaagil/duotone"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					<Github className="h-4 w-4" />
					<span>Contribute on GitHub</span>
				</a>
			</div>
		</footer>
	)
}
