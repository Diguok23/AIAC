"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Download } from "lucide-react"

interface Transaction {
  id: string
  userId: string
  userEmail: string
  userName: string
  enrollmentId: string
  courseName: string
  amount: number
  taxAmount: number
  totalAmount: number
  paymentMethod?: string
  status: "pending" | "completed" | "failed" | "refunded"
  createdAt: string
}

interface BillingStats {
  totalRevenue: number
  totalTax: number
  pendingAmount: number
  transactions: Transaction[]
  monthlyStats: Array<{
    month: string
    revenue: number
    count: number
  }>
}

export default function BillingPage() {
  const [stats, setStats] = useState<BillingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    fetchBillingData()
  }, [])

  useEffect(() => {
    if (!stats) return

    let filtered = stats.transactions

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.courseName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((t) => t.status === statusFilter)
    }

    setFilteredTransactions(filtered)
  }, [searchTerm, statusFilter, stats])

  const fetchBillingData = async () => {
    try {
      const response = await fetch("/api/admin/billing/transactions")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch billing data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!stats) return

    const csv = [
      ["Email", "Name", "Course", "Amount", "Tax", "Total", "Payment Method", "Status", "Date"],
      ...filteredTransactions.map((t) => [
        t.userEmail,
        t.userName,
        t.courseName,
        t.amount,
        t.taxAmount,
        t.totalAmount,
        t.paymentMethod || "N/A",
        t.status,
        new Date(t.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "billing-transactions.csv"
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Failed to load billing data</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tax Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {stats.totalTax.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">16% DST tax</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {stats.pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Transactions</h2>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-64 relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, name or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <Button onClick={handleExport} variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Tax (16%)</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.userEmail}</TableCell>
                    <TableCell>{transaction.userName}</TableCell>
                    <TableCell>{transaction.courseName}</TableCell>
                    <TableCell>KES {transaction.amount.toLocaleString()}</TableCell>
                    <TableCell>KES {transaction.taxAmount.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">KES {transaction.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>{transaction.paymentMethod || "N/A"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.status === "completed"
                            ? "default"
                            : transaction.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No transactions found</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
