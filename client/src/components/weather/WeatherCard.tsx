import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Cloud, Droplets, Gauge, ThermometerSnowflake, Wind } from "lucide-react";

export type WeatherMetric = {
  label: string;
  value: number;
  unit: string;
  icon: "temperature" | "humidity" | "wind" | "pressure" | "rain";
};

type WeatherCardProps = {
  metric: WeatherMetric;
};

const iconMap = {
  temperature: ThermometerSnowflake,
  humidity: Droplets,
  wind: Wind,
  pressure: Gauge,
  rain: Cloud,
};

export function WeatherCard({ metric }: WeatherCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = iconMap[metric.icon];

  const WeatherCardDisplay = ({ isModal = false }: { isModal?: boolean }) => (
    <Card className={`${!isModal && 'cursor-pointer hover:shadow-lg transition-shadow'} flex flex-col`}>
      <CardContent className={`flex-1 pt-6 ${isModal ? 'overflow-auto no-scrollbar' : 'overflow-hidden'}`}>
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">{metric.label}</p>
              <p className="text-2xl font-bold">
                {metric.value.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  {metric.unit}
                </span>
              </p>
            </div>
          </div>
        </div>

        {isModal && (
          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Historical Data</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">24 Hour Average: {(metric.value * 0.95).toFixed(1)} {metric.unit}</p>
                <p className="text-sm text-muted-foreground">24 Hour High: {(metric.value * 1.1).toFixed(1)} {metric.unit}</p>
                <p className="text-sm text-muted-foreground">24 Hour Low: {(metric.value * 0.9).toFixed(1)} {metric.unit}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Trends</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Hourly Change: +{(metric.value * 0.02).toFixed(1)} {metric.unit}</p>
                <p className="text-sm text-muted-foreground">Daily Change: -{(metric.value * 0.05).toFixed(1)} {metric.unit}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Sensor Status: Active
                </p>
                <p className="text-sm text-muted-foreground">
                  Data Quality: Good
                </p>
              </div>
            </div>

            {/* More sections can be added here */}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <div onClick={() => setIsOpen(true)}>
          <WeatherCardDisplay />
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl h-[90vh] overflow-hidden">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">
            {metric.label} Details
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className="flex-1 overflow-hidden">
          <WeatherCardDisplay isModal={true} />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}