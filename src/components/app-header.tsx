import { Button } from "@/components/ui/button";
import { Book, HelpCircle, Sun, Moon, Library } from "lucide-react";
import { useTheme } from "next-themes";
import { useTutorial } from "@/hooks/use-tutorial";

interface AppHeaderProps {
    onToggleInstructions: () => void;
    onToggleGlossary: () => void;
}

export function AppHeader({ onToggleInstructions, onToggleGlossary }: AppHeaderProps) {
    const { theme, setTheme } = useTheme();
    const { startTutorial } = useTutorial();

    return (
        <header className="flex items-center justify-between p-2 border-b bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-foreground">🧮 Fracciones Visuales</h1>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={startTutorial}>
                    <HelpCircle className="h-5 w-5" />
                    <span className="sr-only">Tutorial</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={onToggleGlossary}>
                    <Library className="h-5 w-5" />
                    <span className="sr-only">Glosario</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={onToggleInstructions}>
                    <Book className="h-5 w-5" />
                    <span className="sr-only">Instrucciones</span>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Cambiar tema</span>
                </Button>
            </div>
        </header>
    );
}
