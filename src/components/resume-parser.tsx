
'use client';

import * as React from 'react';
import { Loader2, Sparkles, FileUp } from 'lucide-react';
import mammoth from 'mammoth';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

import type { ParseResumeOutput } from '@/ai/flows/parse-resume';
import { handleParseResume } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Logo } from './icons';
import { StructuredResumeForm } from './structured-resume-form';
import { Skeleton } from './ui/skeleton';

if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${require('pdfjs-dist/package.json').version}/build/pdf.worker.min.mjs`;
}

const ResumeSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-20 w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-20 w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-20 w-full" />
    </div>
  </div>
);

export function ResumeParser() {
  const [structuredData, setStructuredData] = React.useState<ParseResumeOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const extractText = async (file: File): Promise<string> => {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument(arrayBuffer).promise;
      let pdfText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        pdfText += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return pdfText;
    }

    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    if (file.type.startsWith('image/')) {
        toast({ title: 'Processing Image...', description: 'This may take a moment.' });
        const { data: { text } } = await Tesseract.recognize(file);
        return text;
    }
    
    if (file.type.startsWith('text/')) {
      return file.text();
    }

    throw new Error('Unsupported file type');
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStructuredData(null);
    setIsLoading(true);
    toast({ title: 'Processing file...', description: 'Please wait while we extract the text.' });

    try {
      const text = await extractText(file);
      
      if (!text.trim()) {
        toast({ variant: 'destructive', title: 'Extraction Failed', description: 'Could not find any text in the file.' });
        setIsLoading(false);
        return;
      }

      toast({ title: 'Text Extracted!', description: 'Now structuring the content with AI.' });
      
      const result = await handleParseResume(text);
      
      if (result.success) {
        setStructuredData(result.data);
        toast({ title: 'Success!', description: 'Your resume has been structured.' });
      } else {
        toast({ variant: 'destructive', title: 'Parsing Error', description: result.error });
      }
    } catch (error) {
      console.error('File processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error reading file',
        description: `Could not extract text from the uploaded file. ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-10">
        <Logo />
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Instantly convert any resume into a standardized, professional format.
          Upload a file to get started.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle>Upload Resume</CardTitle>
            <CardDescription>
              The AI will parse your resume into a structured format.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-center text-muted-foreground">
                Click to browse or drag and drop your resume here.<br />
                (PDF, DOCX, JPG, PNG)
              </p>
            </div>
            <Input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              disabled={isLoading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Structured Resume</CardTitle>
            <CardDescription>
              Review, edit, and export your structured resume.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="font-medium">Analyzing your resume...</p>
                <p className="text-sm text-muted-foreground">Please wait a moment.</p>
              </div>
            ) : structuredData ? (
              <StructuredResumeForm initialData={structuredData} />
            ) : (
              <div className="text-center text-muted-foreground py-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center min-h-[400px]">
                <Sparkles className="h-12 w-12 mb-4 text-primary/50" />
                <p className="font-medium">Your structured resume will appear here</p>
                <p className="text-sm">Upload a file to see the magic happen.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
