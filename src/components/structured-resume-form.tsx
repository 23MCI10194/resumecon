
'use client';

import * as React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Download, PlusCircle, Trash2, Eye } from 'lucide-react';

import type { ParseResumeOutput } from '@/ai/flows/parse-resume';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const resumeSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  designation: z.string().min(1, 'Designation is required.'),
  nationality: z.string().min(1, 'Nationality is required.'),
  totalExperience: z.string().min(1, "Total Experience is required."),
  relevantExperience: z.string().min(1, "Relevant Experience is required."),
  education: z.string().min(1, 'Education is required.'),
  keyCompetencies: z.string().min(1, 'Key Competencies are required.'),
  personalScorecard: z.array(z.string().min(1, 'Cannot be empty.')),
  professionalExperiences: z.array(z.string().min(1, 'Cannot be empty.')),
  projectExperiences: z.array(z.string().min(1, 'Cannot be empty.')),
});

type StructuredResumeFormProps = {
  initialData: ParseResumeOutput;
};

const BulletPointSection = ({ control, name, label }: { control: any; name: any; label: string }) => {
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <FormField
              control={control}
              name={`${name}.${index}`}
              render={({ field }) => (
                <FormControl>
                  <Input {...field} placeholder={`- ${label} #${index + 1}`} />
                </FormControl>
              )}
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append('')}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>
       <FormMessage />
    </FormItem>
  );
};

const PrintableResume = React.forwardRef<HTMLDivElement, { data: z.infer<typeof resumeSchema> }>(({ data }, ref) => {
    const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div style={{ display: 'flex', marginBottom: '16px', breakInside: 'avoid' }}>
      <div style={{ flexShrink: 0, width: '180px', backgroundColor: '#004A8F', color: 'white', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif" }}>
        <h2 style={{ fontWeight: 'bold', fontSize: '1rem' }}>
          {title}
        </h2>
      </div>
      <div style={{ flexGrow: 1, padding: '12px', border: '1px solid #ddd', borderLeft: 'none' }}>
        {children}
      </div>
    </div>
  );

  return (
    <div ref={ref} style={{ fontFamily: "'Inter', sans-serif", color: '#333', backgroundColor: 'white', width: '210mm', minHeight: '297mm', padding: 0, position: 'relative' }}>
       <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
      
      {/* Header */}
      <div style={{ backgroundColor: '#B2D9EE', color: '#0A4A8F', padding: '24px 48px' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{data.name}</h1>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', margin: '4px 0 0 0' }}>{data.designation}</p>
      </div>

      <div style={{ padding: '24px 48px' }}>
        {/* Top Info Section */}
         <div style={{ borderBottom: '2px solid #B2D9EE', paddingBottom: '16px', marginBottom: '24px' }}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 'bold', color: '#0A4A8F', margin: 0 }}>Nationality:</h3>
            <p style={{ margin: '4px 0 0 0' }}>{data.nationality}</p>
        </div>
         <div style={{ borderBottom: '2px solid #B2D9EE', paddingBottom: '16px', marginBottom: '24px' }}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 'bold', color: '#0A4A8F', margin: 0 }}>Education:</h3>
            <p style={{ margin: '4px 0 0 0' }}>{data.education}</p>
        </div>
        <div style={{ borderBottom: '2px solid #B2D9EE', paddingBottom: '16px', marginBottom: '24px' }}>
           <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 'bold', color: '#0A4A8F', margin: 0 }}>Key Competencies:</h3>
           <p style={{ margin: '4px 0 0 0' }}>{data.keyCompetencies}</p>
        </div>

        {/* Sections */}
        <Section title="Personal Scorecard">
           <div style={{ paddingBottom: '12px', fontSize: '10pt' }}>
              <p style={{ margin: '0 0 4px 0' }}><strong>Total Experience:</strong> {data.totalExperience}</p>
              <p style={{ margin: 0 }}><strong>Relevant Experience:</strong> {data.relevantExperience}</p>
           </div>
            <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                {data.personalScorecard.map((item, i) => (
                <li key={i} style={{ fontSize: '10pt', lineHeight: 1.5, marginBottom: '4px' }}>{item}</li>
                ))}
            </ul>
        </Section>
        <Section title="Professional Experiences">
            <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                {data.professionalExperiences.map((item, i) => (
                <li key={i} style={{ fontSize: '10pt', lineHeight: 1.5, marginBottom: '4px' }}>{item}</li>
                ))}
            </ul>
        </Section>
        <Section title="Relevant Project Experiences">
            <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                {data.projectExperiences.map((item, i) => (
                <li key={i} style={{ fontSize: '10pt', lineHeight: 1.5, marginBottom: '4px' }}>{item}</li>
                ))}
            </ul>
        </Section>
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: '24px', left: '0', right: '0', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#aaa' }}>Infosys</p>
      </div>
    </div>
  );
});
PrintableResume.displayName = 'PrintableResume';


export function StructuredResumeForm({ initialData }: StructuredResumeFormProps) {
  const printableRef = React.useRef<HTMLDivElement>(null);
  const form = useForm<z.infer<typeof resumeSchema>>({
    resolver: zodResolver(resumeSchema),
    defaultValues: initialData,
  });

  const formData = form.watch();

  const openPreview = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && printableRef.current) {
        printWindow.document.write('<html><head><title>Resume Preview</title>');
        printWindow.document.write('<link rel="preconnect" href="https://fonts.googleapis.com">');
        printWindow.document.write('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
        printWindow.document.write('<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">');
        printWindow.document.write('<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">');
        
        printWindow.document.write('</head><body style="margin:0;">');
        printWindow.document.write(printableRef.current.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && printableRef.current) {
      printWindow.document.write('<html><head><title>Print Resume</title>');
      printWindow.document.write('<link rel="preconnect" href="https://fonts.googleapis.com">');
      printWindow.document.write('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
      printWindow.document.write('<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">');
      printWindow.document.write('<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">');
      
      printWindow.document.write('</head><body style="margin: 0;">');
      printWindow.document.write(printableRef.current.innerHTML);
      printWindow.document.write('<style>@media print { @page { size: A4 portrait; margin: 0; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style>');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500); // Small delay to ensure content loads before printing
    }
  };

  return (
    <>
      <div className="hidden">
        <PrintableResume ref={printableRef} data={formData} />
      </div>
      <Form {...form}>
        <form className="space-y-6">
           <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="designation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nationality</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="education"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Education</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="totalExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Experience</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="relevantExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relevant Experience</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="keyCompetencies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Key Competencies</FormLabel>
                <FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <BulletPointSection control={form.control} name="personalScorecard" label="Personal Scorecard" />
          <BulletPointSection control={form.control} name="professionalExperiences" label="Professional Experiences" />
          <BulletPointSection control={form.control} name="projectExperiences" label="Relevant Project Experiences" />
          
          <div className="flex gap-2">
            <Button type="button" onClick={openPreview} className="w-full" variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button type="button" onClick={handlePrint} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Print / Save as PDF
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
