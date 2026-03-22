import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Shield, Zap, AlertTriangle, HelpCircle } from "lucide-react";

export function HelpDocsPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Help & Documentation</h3>
        <p className="text-sm text-muted-foreground">
          Learn how to configure Ask Rwanda AI effectively
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-muted-indigo" />
              <CardTitle className="text-base">How AI Uses Content</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Ask Rwanda uses RAG (Retrieval Augmented Generation) to find relevant content 
              from your stories, panels, testimonies, and routes.
            </p>
            <p>
              When a user asks a question, the AI searches your content database, 
              retrieves the most relevant pieces, and generates a response based on 
              that context.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-forest-teal" />
              <CardTitle className="text-base">Best Practices for Safe Tone</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Always enable trauma-aware language for memorial and testimony content.
              Use safety prefaces for sensitive locations.
            </p>
            <p>
              Test responses in Preview mode before publishing changes. 
              Monitor logs for safety filter activations.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber" />
            <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-sm">
                How do tone profiles affect AI responses?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Tone profiles define the AI's communication style. The system prompt you configure 
                instructs the AI on language, formality, emotional sensitivity, and content framing. 
                Different modes (Standard, Personal Voices, Kid-Friendly) can have completely 
                different tones.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-sm">
                What does "Safety Filter Activated" mean in logs?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                When a query matches sensitive themes (like genocide history or trauma), 
                the safety filter ensures the AI uses trauma-aware language and may add 
                content warnings. This protects users from unexpected distressing content.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-sm">
                Can I disable testimonies for specific modes?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Yes! In Mode Behavior settings, you can toggle which content sources are 
                available per mode. For Kid-Friendly mode, testimonies are disabled by default 
                to ensure age-appropriate content.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-sm">
                How do location overrides work?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Location overrides let you customize AI behavior for specific places. 
                For example, memorial sites can have stricter safety settings and always 
                use Personal Voices tone, while nature routes can use Standard tone 
                with scenic descriptions.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-sm">
                Why isn't my content appearing in AI responses?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Check Source Rules to ensure the content type is enabled. Also verify 
                the content is published (not in draft). If using location overrides, 
                ensure testimonies or other sources aren't disabled for that location.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-terracotta" />
            <CardTitle className="text-base">RAG Troubleshooting</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="rag-1">
              <AccordionTrigger className="text-sm">
                AI gives generic or irrelevant answers
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Ensure you have enough content for the topic</li>
                  <li>Check if source rules are too restrictive</li>
                  <li>Verify content is published, not draft</li>
                  <li>Try increasing the context window in Model Settings</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rag-2">
              <AccordionTrigger className="text-sm">
                Responses are too long or too short
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Adjust Max Tokens in Mode Behavior settings</li>
                  <li>Update tone profile prompts to specify length preferences</li>
                  <li>Use "Keep answers concise" in custom instructions</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rag-3">
              <AccordionTrigger className="text-sm">
                AI sounds too formal or too casual
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Edit the tone profile's system prompt</li>
                  <li>Add specific examples in the Example Response field</li>
                  <li>Adjust temperature (lower = more consistent, higher = more varied)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
