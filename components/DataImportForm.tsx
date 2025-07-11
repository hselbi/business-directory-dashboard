import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface DataImportFormProps {
  sheetUrl: string;
  setSheetUrl: (url: string) => void;
  onFetchData: () => void;
  isLoading: boolean;
  error: string;
}

export function DataImportForm({
  sheetUrl,
  setSheetUrl,
  onFetchData,
  isLoading,
  error,
}: DataImportFormProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="mb-8 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            Import Business Data
          </CardTitle>
          <CardDescription>
            Enter a public Google Sheets URL containing business information in
            transposed format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sheet-url" className="text-sm font-medium">
              Google Sheets URL
            </Label>
            <div className="flex space-x-2">
              <Input
                id="sheet-url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                className="flex-1 border-slate-200"
                onKeyDown={(e) => e.key === "Enter" && onFetchData()}
              />
              <Button
                onClick={onFetchData}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Extract Data
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
