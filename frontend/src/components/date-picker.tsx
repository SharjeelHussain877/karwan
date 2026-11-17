import { useState } from "react"
import { addMonths, format } from "date-fns"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type Props = {
  id: string
  /** YYYY-MM-DD, or "" when nothing is picked. */
  value: string
  placeholder: string
  invalid: boolean
  onChange: (value: string) => void
  onBlur: () => void
}

type View = "days" | "months" | "years"

const EARLIEST_YEAR = 1900
const DEFAULT_MONTH = new Date(2000, 0, 1)
const MONTH_NAMES = Array.from({ length: 12 }, (_, index) => format(new Date(2000, index, 1), "MMM"))

/** "2000-04-21" -> a local Date, or null for "". */
function parseDate(value: string): Date | null {
  const [year, month, day] = value.split("-").map(Number)
  return value === "" ? null : new Date(year, month - 1, day)
}

/**
 * shadcn Calendar in a popover. The button is full width and the calendar matches it.
 * Month and year are picked inside the calendar itself: tap either one to swap the
 * days for a grid of months or years. Only today and earlier dates can be chosen.
 */
export function DatePicker({ id, value, placeholder, invalid, onChange, onBlur }: Props) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>("days")
  const date = parseDate(value)
  const [month, setMonth] = useState(date !== null ? date : DEFAULT_MONTH)

  const today = new Date()
  const thisYear = today.getFullYear()
  const years = Array.from({ length: thisYear - EARLIEST_YEAR + 1 }, (_, index) => thisYear - index)

  const showingDays = view === "days"
  const atLatestMonth = month.getFullYear() === thisYear && month.getMonth() === today.getMonth()

  const toggle = (target: View) => setView(view === target ? "days" : target)

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setMonth(date !== null ? date : DEFAULT_MONTH)
          setView("days")
        } else {
          onBlur()
        }
      }}
    >
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-invalid={invalid}
            className={cn("w-full justify-start font-normal", date === null && "text-muted-foreground")}
          />
        }
      >
        <CalendarIcon />
        {date !== null ? format(date, "PPP") : placeholder}
      </PopoverTrigger>

      <PopoverContent align="start" className="w-(--anchor-width) min-w-72 gap-0 p-0">
        {/* Header: arrows move month by month; month and year are boxed buttons. */}
        <div className="flex items-center gap-2 p-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Previous month"
            disabled={!showingDays || month.getFullYear() <= EARLIEST_YEAR && month.getMonth() === 0}
            onClick={() => setMonth(addMonths(month, -1))}
          >
            <ChevronLeftIcon />
          </Button>

          <div className="flex flex-1 items-center justify-center gap-2">
            <Button
              type="button"
              variant={view === "months" ? "secondary" : "outline"}
              size="sm"
              className="min-w-24"
              onClick={() => toggle("months")}
            >
              {format(month, "MMMM")}
            </Button>
            <Button
              type="button"
              variant={view === "years" ? "secondary" : "outline"}
              size="sm"
              className="min-w-16"
              onClick={() => toggle("years")}
            >
              {format(month, "yyyy")}
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Next month"
            disabled={!showingDays || atLatestMonth}
            onClick={() => setMonth(addMonths(month, 1))}
          >
            <ChevronRightIcon />
          </Button>
        </div>

        {view === "days" && (
          <Calendar
            mode="single"
            hideNavigation
            month={month}
            onMonthChange={setMonth}
            startMonth={new Date(EARLIEST_YEAR, 0)}
            endMonth={today}
            disabled={{ after: today }}
            {...(date !== null ? { selected: date } : {})}
            onSelect={(next) => {
              if (next === undefined) return
              onChange(format(next, "yyyy-MM-dd"))
              setOpen(false)
            }}
            // Stretches to the input's width while the day rows keep a fixed height.
            className="w-full pt-0 [--cell-size:--spacing(9)] [&_button[data-day]]:aspect-auto [&_button[data-day]]:h-full"
            classNames={{
              month_caption: "hidden",
              day: "group/day relative h-(--cell-size) w-full rounded-(--cell-radius) p-0 text-center select-none",
            }}
          />
        )}

        {view === "months" && (
          <div className="grid h-[17rem] grid-cols-3 content-start gap-2 p-3">
            {MONTH_NAMES.map((name, index) => (
              <Button
                key={name}
                type="button"
                variant={index === month.getMonth() ? "default" : "outline"}
                disabled={month.getFullYear() === thisYear && index > today.getMonth()}
                onClick={() => {
                  setMonth(new Date(month.getFullYear(), index, 1))
                  setView("days")
                }}
              >
                {name}
              </Button>
            ))}
          </div>
        )}

        {view === "years" && (
          <div className="grid h-[17rem] grid-cols-4 content-start gap-2 overflow-y-auto p-3">
            {years.map((year) => (
              <Button
                key={year}
                type="button"
                variant={year === month.getFullYear() ? "default" : "outline"}
                size="sm"
                ref={(element) => {
                  if (element !== null && year === month.getFullYear()) {
                    element.scrollIntoView({ block: "center" })
                  }
                }}
                onClick={() => {
                  const lastMonth = year === thisYear ? today.getMonth() : 11
                  setMonth(new Date(year, Math.min(month.getMonth(), lastMonth), 1))
                  setView("months")
                }}
              >
                {year}
              </Button>
            ))}
          </div>
        )}

        {date !== null && (
          <div className="border-t p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onChange("")
                setOpen(false)
              }}
            >
              Clear date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
