
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText } from "lucide-react";

interface TermsSection {
  title: string;
  content: string;
}

interface TermsContent {
  sections: TermsSection[];
  last_updated: string;
}

const TermsOfService = () => {
  const { data: terms, isLoading } = useQuery({
    queryKey: ["terms-of-service"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("terms_of_service")
        .select("*")
        .eq("is_current", true)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="animate-spin">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
      </div>
    );
  }

  const content: TermsContent = terms?.content || { sections: [], last_updated: "" };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <FileText className="h-6 w-6" />
        Terms of Service
      </h1>
      
      <div className="space-y-8">
        {content.sections.map((section, index) => (
          <section key={index} className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{section.title}</h2>
            <p className="text-gray-600 leading-relaxed">{section.content}</p>
          </section>
        ))}
      </div>

      <div className="mt-8 text-sm text-gray-500">
        Version: {terms?.version} • Last updated: {new Date(content.last_updated).toLocaleDateString()}
      </div>
    </div>
  );
};

export default TermsOfService;
