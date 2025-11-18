import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { BookOpen, Send, Loader2, Download, Trash2, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setImageFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImageFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Please enter a question",
        description: "Type your question above or upload an image.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnswer("");

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/ask-english-question`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            question,
            imageData: selectedImage 
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get answer");
      }

      const data = await response.json();
      setAnswer(data.answer);
      
      toast({
        title: "Answer received!",
        description: "Your question has been answered.",
      });
    } catch (error) {
      console.error("Error asking question:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process your question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([`Question: ${question}\n\nAnswer:\n${answer}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kk-sir-answer.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Answer saved as text file.",
    });
  };

  const handleDelete = () => {
    setAnswer("");
    setQuestion("");
    handleRemoveImage();
    toast({
      title: "Cleared!",
      description: "Question and answer have been cleared.",
    });
  };

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent">
              <span className="text-2xl font-bold text-primary-foreground">KK</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">FOR KK SIR MADE BY ANANT AND SAURAV</h1>
              <p className="text-sm text-muted-foreground">
                Expert guidance for Physics, Chemistry, Math (JEE), Biology (NEET), English & NCERT Class 6-12
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Introduction Card */}
        <Card className="p-6 mb-8 shadow-[var(--shadow-card)]">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Ask Any Academic Question
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Get comprehensive step-by-step solutions for Physics, Chemistry, Mathematics (JEE), Biology (NEET), 
            English, and all NCERT subjects (Class 6-12). Upload images or type your questions. Perfect for 
            competitive exams, board preparation, and concept clarity.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>Special Resources Available:</strong> Top 500 PYQs of JEE Main for Physics & Mathematics with complete solutions!
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-primary/30 text-primary-foreground text-sm font-medium">
              Physics
            </span>
            <span className="px-3 py-1 rounded-full bg-accent/30 text-accent-foreground text-sm font-medium">
              Chemistry
            </span>
            <span className="px-3 py-1 rounded-full bg-primary/30 text-primary-foreground text-sm font-medium">
              Mathematics
            </span>
            <span className="px-3 py-1 rounded-full bg-accent/30 text-accent-foreground text-sm font-medium">
              Biology
            </span>
            <span className="px-3 py-1 rounded-full bg-primary/30 text-primary-foreground text-sm font-medium">
              JEE/NEET
            </span>
            <span className="px-3 py-1 rounded-full bg-accent/30 text-accent-foreground text-sm font-medium">
              English
            </span>
          </div>
        </Card>

        {/* Question Input */}
        <Card className="p-6 mb-6 shadow-[var(--shadow-card)]">
          <label htmlFor="question" className="block text-sm font-medium text-foreground mb-3">
            Your Question
          </label>
          <Textarea
            id="question"
            placeholder="Example: Solve this calculus problem, explain Newton's third law, or describe the process of photosynthesis..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[120px] mb-4 shadow-[var(--shadow-input)]"
          />
          
          {/* Image Upload Section */}
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            {selectedImage ? (
              <div className="relative inline-block">
                <img 
                  src={selectedImage} 
                  alt="Selected question" 
                  className="max-w-xs max-h-48 rounded-lg border border-border"
                />
                <Button
                  onClick={handleRemoveImage}
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2"
                >
                  <X className="w-4 h-4" />
                </Button>
                <p className="text-xs text-muted-foreground mt-2">{imageFileName}</p>
              </div>
            ) : (
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                type="button"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Question Image
              </Button>
            )}
          </div>

          <Button
            onClick={handleAskQuestion}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Ask Question
              </>
            )}
          </Button>
        </Card>

        {/* Answer Display */}
        {answer && (
          <Card className="p-6 shadow-[var(--shadow-card)] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Answer
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                {answer}
              </div>
            </div>
          </Card>
        )}

        {/* Example Questions */}
        {!answer && !isLoading && (
          <Card className="p-6 shadow-[var(--shadow-card)]">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Example Questions
            </h3>
            <div className="space-y-3">
              {[
                "What is the angle between two vectors A and B if their resultant is perpendicular to A?",
                "Derive the equation of motion: v² = u² + 2as with complete steps",
                "Explain Le Chatelier's principle with real-life examples",
                "Solve: ∫(x² + 3x + 2)dx and explain the integration steps",
                "What is the difference between mitosis and meiosis? Explain with diagrams",
                "A silver wire has mass 0.6g, radius 0.5mm. Calculate maximum percentage error in density measurement",
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setQuestion(example)}
                  className="w-full text-left p-3 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                >
                  <span className="text-sm">{example}</span>
                </button>
              ))}
            </div>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            <strong>FOR KK SIR MADE BY ANANT AND SAURAV</strong> - Powered by NCERT, JEE/NEET Materials & Expert Knowledge (Class 6-12)
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
