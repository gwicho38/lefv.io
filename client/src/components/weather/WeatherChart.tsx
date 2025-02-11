import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type WeatherChartProps = {
  type?: "temperature" | "precipitation";
};

export function WeatherChart({ type = "temperature" }: WeatherChartProps) {
  const [isOpen, setIsOpen] = useState(false);

  const ChartContent = ({ isModal = false }: { isModal?: boolean }) => (
    <Card className={`${!isModal && 'cursor-pointer hover:shadow-lg transition-shadow'}`}>
      <CardHeader>
        <CardTitle>
          {type === "temperature" ? "24-Hour Temperature Trend" : "Rainfall History"}
        </CardTitle>
      </CardHeader>
      <CardContent className={`${isModal ? 'max-h-[70vh]' : 'max-h-96'} overflow-hidden`}>
        {/* Your existing chart implementation goes here */}
        <div className="h-64">
          {/* Chart content */}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <div onClick={() => setIsOpen(true)}>
          <ChartContent />
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-4xl h-[90vh] overflow-hidden">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {type === "temperature" ? "Temperature Trend Analysis" : "Precipitation Analysis"}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <ChartContent isModal={true} />
      </AlertDialogContent>
    </AlertDialog>
  );
}