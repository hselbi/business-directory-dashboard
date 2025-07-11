import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SheetData {
  headers: string[];
  rows: Record<string, string>[];
}

interface BusinessDataTableProps {
  sheetData: SheetData;
}

export function BusinessDataTable({ sheetData }: BusinessDataTableProps) {
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Raw Data Table</CardTitle>
        <CardDescription>Complete data from your spreadsheet</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                {sheetData.headers.map((header, index) => (
                  <th
                    key={index}
                    className="text-left p-3 font-semibold text-slate-700 bg-slate-50"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheetData.rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  {sheetData.headers.map((header, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="p-3 text-sm text-slate-600 max-w-xs truncate"
                    >
                      {row[header] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
