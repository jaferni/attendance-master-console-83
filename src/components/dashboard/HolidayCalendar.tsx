
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Holiday, WeeklyHoliday } from "@/types/holiday";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface HolidayCalendarProps {
  holidays: Holiday[];
  weeklyHolidays: WeeklyHoliday[];
  onAddHoliday?: (holiday: Holiday) => void;
  onUpdateWeeklyHolidays?: (weeklyHolidays: WeeklyHoliday[]) => void;
  className?: string;
}

const formSchema = z.object({
  name: z.string().min(1, "Holiday name is required"),
  date: z.date({
    required_error: "Please select a date",
  }),
  description: z.string().optional(),
});

export function HolidayCalendar({
  holidays,
  weeklyHolidays,
  onAddHoliday,
  onUpdateWeeklyHolidays,
  className,
}: HolidayCalendarProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedWeeklyHolidays, setSelectedWeeklyHolidays] = useState<WeeklyHoliday[]>(weeklyHolidays);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (onAddHoliday) {
      onAddHoliday({
        id: crypto.randomUUID(),
        name: data.name,
        date: data.date.toISOString(),
        description: data.description || "",
      });
    }
    form.reset();
  };

  const handleWeeklyHolidayChange = (day: WeeklyHoliday) => {
    const updatedHolidays = selectedWeeklyHolidays.includes(day)
      ? selectedWeeklyHolidays.filter((d) => d !== day)
      : [...selectedWeeklyHolidays, day];
    
    setSelectedWeeklyHolidays(updatedHolidays);
    
    if (onUpdateWeeklyHolidays) {
      onUpdateWeeklyHolidays(updatedHolidays);
    }
  };

  // Mark holidays on the calendar
  const holidayDates = holidays.map((holiday) => new Date(holiday.date));

  // Check if a date is a weekly holiday
  const isWeeklyHoliday = (date: Date) => {
    const day = format(date, "EEEE").toLowerCase() as WeeklyHoliday;
    return selectedWeeklyHolidays.includes(day);
  };

  return (
    <div className={cn("space-y-8", className)}>
      <div className="flex flex-wrap gap-6">
        <div className="flex-1 space-y-4 min-w-[300px]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Holiday Calendar</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" /> Add Holiday
                </Button>
              </DialogTrigger>
              <DialogContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                      <DialogTitle>Add Holiday</DialogTitle>
                      <DialogDescription>
                        Add a new holiday to the school calendar
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Holiday Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Independence Day" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="rounded-md border p-3 pointer-events-auto"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Brief description..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit">Add Holiday</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => date && setDate(date)}
            className="rounded-md border p-3 pointer-events-auto"
            modifiers={{
              holiday: (date) => 
                holidayDates.some(
                  (holiday) => format(holiday, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
                ),
              weeklyHoliday: (date) => isWeeklyHoliday(date),
            }}
            modifiersClassNames={{
              holiday: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 font-semibold",
              weeklyHoliday: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
            }}
          />
          <div className="flex flex-wrap gap-3 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <span className="text-sm">Holiday</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <span className="text-sm">Weekly Holiday</span>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 min-w-[300px]">
          <h3 className="text-lg font-medium">Weekly Holidays</h3>
          <div className="space-y-2">
            {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
              <div
                key={day}
                className={cn(
                  "flex items-center justify-between rounded-md border p-3 cursor-pointer transition-colors",
                  selectedWeeklyHolidays.includes(day as WeeklyHoliday)
                    ? "bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleWeeklyHolidayChange(day as WeeklyHoliday)}
              >
                <span className="capitalize">{day}</span>
                <div
                  className={cn(
                    "h-5 w-5 rounded-full border",
                    selectedWeeklyHolidays.includes(day as WeeklyHoliday)
                      ? "border-blue-500 bg-blue-500"
                      : "border-muted-foreground"
                  )}
                >
                  {selectedWeeklyHolidays.includes(day as WeeklyHoliday) && (
                    <div className="h-full w-full flex items-center justify-center text-white">
                      ✓
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4">
            <h3 className="text-lg font-medium mb-4">Recent Holidays</h3>
            {holidays.length > 0 ? (
              <div className="space-y-2">
                {holidays
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 5)
                  .map((holiday) => (
                    <div key={holiday.id} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <div className="font-medium">{holiday.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(holiday.date), "MMMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No holidays added yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
