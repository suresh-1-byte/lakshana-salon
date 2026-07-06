'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Download, FileSpreadsheet, Calendar } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import * as XLSX from 'xlsx'

type DailyReport = {
  date: string
  totalBookings: number
  completedBookings: number
  pendingBookings: number
  cancelledBookings: number
  revenue: number
  paymentsCount: number
  newCustomers: number
  topServices: Array<{ service: string; count: number }>
}

type WeeklyReport = {
  startDate: string
  endDate: string
  totalBookings: number
  completedBookings: number
  revenue: number
  newCustomers: number
  repeatCustomers: number
  customerRetentionRate: number
  popularServices: Array<{ service: string; count: number; revenue: number }>
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(false)
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null)
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null)
  
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0])
  const [weeklyStartDate, setWeeklyStartDate] = useState(
    new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [weeklyEndDate, setWeeklyEndDate] = useState(new Date().toISOString().split('T')[0])

  const handleGenerateDailyReport = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/reports/daily?date=${dailyDate}`)
      const data = await response.json()
      
      if (data.success) {
        setDailyReport(data.report)
        toast({
          title: 'Success',
          description: 'Daily report generated successfully',
        })
      } else {
        throw new Error(data.error || 'Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating daily report:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate daily report',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateWeeklyReport = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/reports/weekly?startDate=${weeklyStartDate}&endDate=${weeklyEndDate}`)
      const data = await response.json()
      
      if (data.success) {
        setWeeklyReport(data.report)
        toast({
          title: 'Success',
          description: 'Weekly report generated successfully',
        })
      } else {
        throw new Error(data.error || 'Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating weekly report:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate weekly report',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportDailyToExcel = () => {
    if (!dailyReport) return

    try {
      // Create workbook
      const wb = XLSX.utils.book_new()

      // Summary sheet
      const summaryData = [
        ['Daily Report', dailyReport.date],
        [],
        ['Metric', 'Value'],
        ['Total Bookings', dailyReport.totalBookings],
        ['Completed Bookings', dailyReport.completedBookings],
        ['Pending Bookings', dailyReport.pendingBookings],
        ['Cancelled Bookings', dailyReport.cancelledBookings],
        ['Revenue', `₹${dailyReport.revenue}`],
        ['Payments Count', dailyReport.paymentsCount],
        ['New Customers', dailyReport.newCustomers],
      ]
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

      // Top Services sheet
      if (dailyReport.topServices.length > 0) {
        const servicesData = [
          ['Service', 'Count'],
          ...dailyReport.topServices.map(s => [s.service, s.count]),
        ]
        const wsServices = XLSX.utils.aoa_to_sheet(servicesData)
        XLSX.utils.book_append_sheet(wb, wsServices, 'Top Services')
      }

      // Write file
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `daily-report-${dailyReport.date}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Success',
        description: 'Report exported to Excel',
      })
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      toast({
        title: 'Error',
        description: 'Failed to export report',
        variant: 'destructive',
      })
    }
  }

  const handleExportWeeklyToExcel = () => {
    if (!weeklyReport) return

    try {
      // Create workbook
      const wb = XLSX.utils.book_new()

      // Summary sheet
      const summaryData = [
        ['Weekly Report', `${weeklyReport.startDate} to ${weeklyReport.endDate}`],
        [],
        ['Metric', 'Value'],
        ['Total Bookings', weeklyReport.totalBookings],
        ['Completed Bookings', weeklyReport.completedBookings],
        ['Total Revenue', `₹${weeklyReport.revenue}`],
        ['New Customers', weeklyReport.newCustomers],
        ['Repeat Customers', weeklyReport.repeatCustomers],
        ['Retention Rate', `${weeklyReport.customerRetentionRate}%`],
      ]
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

      // Popular Services sheet
      if (weeklyReport.popularServices.length > 0) {
        const servicesData = [
          ['Service', 'Count', 'Revenue'],
          ...weeklyReport.popularServices.map(s => [s.service, s.count, `₹${s.revenue}`]),
        ]
        const wsServices = XLSX.utils.aoa_to_sheet(servicesData)
        XLSX.utils.book_append_sheet(wb, wsServices, 'Popular Services')
      }

      // Write file
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `weekly-report-${weeklyReport.startDate}-to-${weeklyReport.endDate}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Success',
        description: 'Report exported to Excel',
      })
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      toast({
        title: 'Error',
        description: 'Failed to export report',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Generate and export business reports
        </p>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList>
          <TabsTrigger value="daily">Daily Report</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Report</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
        </TabsList>

        {/* Daily Report */}
        <TabsContent value="daily" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Daily Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="daily-date">Select Date</Label>
                  <Input
                    id="daily-date"
                    type="date"
                    value={dailyDate}
                    onChange={(e) => setDailyDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <Button
                  onClick={handleGenerateDailyReport}
                  disabled={loading}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {loading ? 'Generating...' : 'Generate Report'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {dailyReport && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Report for {new Date(dailyReport.date).toLocaleDateString()}
                </h2>
                <Button onClick={handleExportDailyToExcel} variant="outline">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export to Excel
                </Button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-neutral-500">
                      Total Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dailyReport.totalBookings}</div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {dailyReport.completedBookings} completed
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-neutral-500">
                      Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{dailyReport.revenue.toLocaleString()}</div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {dailyReport.paymentsCount} payments
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-neutral-500">
                      New Customers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dailyReport.newCustomers}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-neutral-500">
                      Pending Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dailyReport.pendingBookings}</div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {dailyReport.cancelledBookings} cancelled
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Services */}
              {dailyReport.topServices.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dailyReport.topServices.map((service, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="font-medium">{service.service}</span>
                          <span className="text-amber-600 font-semibold">
                            {service.count} bookings
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Weekly Report */}
        <TabsContent value="weekly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Weekly Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weekly-start">Start Date</Label>
                  <Input
                    id="weekly-start"
                    type="date"
                    value={weeklyStartDate}
                    onChange={(e) => setWeeklyStartDate(e.target.value)}
                    max={weeklyEndDate}
                  />
                </div>
                <div>
                  <Label htmlFor="weekly-end">End Date</Label>
                  <Input
                    id="weekly-end"
                    type="date"
                    value={weeklyEndDate}
                    onChange={(e) => setWeeklyEndDate(e.target.value)}
                    min={weeklyStartDate}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <Button
                onClick={handleGenerateWeeklyReport}
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 w-full"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </CardContent>
          </Card>

          {weeklyReport && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Report: {new Date(weeklyReport.startDate).toLocaleDateString()} - {new Date(weeklyReport.endDate).toLocaleDateString()}
                </h2>
                <Button onClick={handleExportWeeklyToExcel} variant="outline">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export to Excel
                </Button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-neutral-500">
                      Total Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{weeklyReport.totalBookings}</div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {weeklyReport.completedBookings} completed
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-neutral-500">
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{weeklyReport.revenue.toLocaleString()}</div>
                    <div className="text-xs text-neutral-500 mt-1">
                      ₹{Math.round(weeklyReport.revenue / 7).toLocaleString()}/day avg
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-neutral-500">
                      New Customers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{weeklyReport.newCustomers}</div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {weeklyReport.repeatCustomers} repeat customers
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-neutral-500">
                      Retention Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{weeklyReport.customerRetentionRate}%</div>
                  </CardContent>
                </Card>
              </div>

              {/* Popular Services */}
              {weeklyReport.popularServices.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {weeklyReport.popularServices.map((service, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{service.service}</p>
                            <p className="text-sm text-neutral-500">{service.count} bookings</p>
                          </div>
                          <span className="text-amber-600 font-semibold">
                            ₹{service.revenue.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Monthly Report */}
        <TabsContent value="monthly" className="space-y-6">
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-neutral-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Monthly reports coming soon...</p>
                <p className="text-sm mt-2">Use Weekly Report with 30-day range for now</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
