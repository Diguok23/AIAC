"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, DollarSign } from "lucide-react"
import { toast } from "sonner"

interface Transaction {
  id: string
  userId: string
  userEmail: string
  userName: string
  totalSpent: number
  totalPaid: number
  outstandingBalance: number
  status: string
  lastPaymentDate?: string
  updatedAt: string
}

interface BillingStats {
  totalRevenue: number
  totalPaid: number
  outstandingTotal: number
}

export default function BillingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<BillingStats>({ totalRevenue: 0, totalPaid: 0, outstandingTotal: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    fetchBillingData()
  }, [])

  useEffect(() => {
    const filtered = transactions.filter(
      (trans) =>
        trans.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trans.userName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredTransactions(filtered)
  }, [searchTerm, transactions])

  const fetchBillingData = async () => {
    try {
      const response = await fetch("/api/admin/billing/transactions")
      const data = await response.json()
      setTransactions(data.transactions)
      setStats({
        totalRevenue: data.totalRevenue,
        totalPaid: data.totalPaid,
        outstandingTotal: data.outstandingTotal,
      })
    } catch (error) {
      console.error("Failed to fetch billing data:", error)
      toast.error("Failed to load billing data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage billing and payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <p className="text-2xl font-bold">${stats.totalPaid.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm font-medium text-muted-foreground">Outstanding Balance</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <p className="text-2xl font-bold">${stats.outstandingTotal.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Email</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Total Billed</TableHead>
                  <TableHead>Total Paid</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((trans) => (
                  <TableRow key={trans.id}>
                    <TableCell className="font-medium">{trans.userEmail}</TableCell>
                    <TableCell>{trans.userName}</TableCell>
                    <TableCell>${trans.totalSpent.toFixed(2)}</TableCell>
                    <TableCell>${trans.totalPaid.toFixed(2)}</TableCell>
                    <TableCell>${trans.outstandingBalance.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={trans.status === "paid" ? "default" : "secondary"}>{trans.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {trans.lastPaymentDate ? new Date(trans.lastPaymentDate).toLocaleDateString() : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No billing records found</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
