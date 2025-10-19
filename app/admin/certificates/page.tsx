"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Loader2, Search, Plus, FileText } from "lucide-react"
import { toast } from "sonner"

interface Certificate {
  id: string
  certificateNumber: string
  studentName: string
  studentEmail: string
  courseName: string
  issueDate: string
  expiryDate?: string
  isRevoked: boolean
  fileUrl?: string
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([])
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [isRevoking, setIsRevoking] = useState(false)

  useEffect(() => {
    fetchCertificates()
  }, [])

  useEffect(() => {
    const filtered = certificates.filter(
      (cert) =>
        cert.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredCertificates(filtered)
  }, [searchTerm, certificates])

  const fetchCertificates = async () => {
    try {
      const response = await fetch("/api/admin/certificates")
      const data = await response.json()
      setCertificates(data)
    } catch (error) {
      console.error("Failed to fetch certificates:", error)
      toast.error("Failed to load certificates")
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async () => {
    if (!selectedCertificate || selectedCertificate.isRevoked) return

    setIsRevoking(true)
    try {
      const response = await fetch(`/api/admin/certificates/${selectedCertificate.id}/revoke`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Certificate revoked successfully")
        setSelectedCertificate(null)
        fetchCertificates()
      } else {
        toast.error("Failed to revoke certificate")
      }
    } catch (error) {
      console.error("Error revoking certificate:", error)
      toast.error("An error occurred")
    } finally {
      setIsRevoking(false)
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Certificates</h1>
          <p className="text-muted-foreground">Manage student certificates</p>
        </div>
        <Button className="gap-2" disabled>
          <Plus className="h-4 w-4" />
          Issue Certificate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, course or certificate number..."
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
                  <TableHead>Certificate #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">{cert.certificateNumber}</TableCell>
                    <TableCell>{cert.studentName}</TableCell>
                    <TableCell>{cert.studentEmail}</TableCell>
                    <TableCell>{cert.courseName}</TableCell>
                    <TableCell>{new Date(cert.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : "No expiry"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cert.isRevoked ? "destructive" : "default"}>
                        {cert.isRevoked ? "Revoked" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {cert.fileUrl && (
                          <Button variant="ghost" size="sm" onClick={() => window.open(cert.fileUrl)}>
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        {!cert.isRevoked && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCertificate(cert)}
                            className="text-destructive hover:text-destructive"
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredCertificates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No certificates found</div>
          )}
        </CardContent>
      </Card>

      {selectedCertificate && (
        <Dialog open={!!selectedCertificate} onOpenChange={() => setSelectedCertificate(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Revoke Certificate</DialogTitle>
              <DialogDescription>
                Are you sure you want to revoke this certificate? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Certificate #</label>
                <p className="text-sm text-muted-foreground">{selectedCertificate.certificateNumber}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Student</label>
                <p className="text-sm text-muted-foreground">{selectedCertificate.studentName}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Course</label>
                <p className="text-sm text-muted-foreground">{selectedCertificate.courseName}</p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedCertificate(null)} disabled={isRevoking}>
                  Cancel
                </Button>
                <Button onClick={handleRevoke} disabled={isRevoking} variant="destructive">
                  {isRevoking ? "Revoking..." : "Revoke Certificate"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
