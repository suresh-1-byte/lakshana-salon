'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Edit, Trash2, Eye, Download, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import CustomerForm from '@/components/admin/CustomerForm'
import { utils, writeFile } from 'xlsx'
import { toast } from '@/hooks/use-toast'

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<any[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch()
      } else {
        setFilteredCustomers(customers)
      }
    }, 300) // Wait 300ms after user stops typing

    return () => clearTimeout(timer)
  }, [searchQuery, customers])

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/customers')
      const data = await res.json()
      
      if (data.success) {
        setCustomers(data.data || [])
        setFilteredCustomers(data.data || [])
      } else {
        throw new Error(data.error || 'Failed to load customers')
      }
    } catch (error) {
      console.error('Error loading customers:', error)
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers)
      return
    }

    try {
      const res = await fetch(`/api/admin/customers?search=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      
      if (data.success) {
        setFilteredCustomers(data.data || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return

    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'DELETE',
      })
      
      const data = await res.json()
      
      if (res.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Customer deleted successfully',
        })
        loadCustomers()
      } else {
        throw new Error(data.error || 'Failed to delete')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete customer',
        variant: 'destructive',
      })
    }
  }

  const handleExport = () => {
    const exportData = filteredCustomers.map(customer => ({
      'Customer ID': customer.id?.slice(-6).toUpperCase() || '',
      'Name': customer.name,
      'Phone': customer.phone,
      'Email': customer.email || '',
      'Date of Birth': customer.dateOfBirth || '',
      'Total Visits': customer.totalVisits || 0,
      'Total Spent': customer.totalSpent || 0,
      'Created At': customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '',
      'Loyalty Status': customer.loyaltyStatus || 'Bronze',
    }))

    const ws = utils.json_to_sheet(exportData)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Customers')
    writeFile(wb, `customers_${new Date().toISOString().split('T')[0]}.xlsx`)

    toast({
      title: 'Success',
      description: 'Customers exported successfully',
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">Customer Management</h1>
          <p className="text-gray-400 mt-1">Manage your salon customers</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
                </DialogTitle>
              </DialogHeader>
              <CustomerForm
                customer={selectedCustomer}
                onSuccess={() => {
                  setShowForm(false)
                  setSelectedCustomer(null)
                  loadCustomers()
                }}
                onCancel={() => {
                  setShowForm(false)
                  setSelectedCustomer(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by name, mobile, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800">
              <TableHead>Customer ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Total Visits</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Loyalty Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton - faster perceived load time
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-gray-800">
                  <TableCell><div className="h-4 bg-gray-800 rounded animate-pulse w-20"></div></TableCell>
                  <TableCell><div className="h-4 bg-gray-800 rounded animate-pulse w-32"></div></TableCell>
                  <TableCell><div className="h-4 bg-gray-800 rounded animate-pulse w-24"></div></TableCell>
                  <TableCell><div className="h-4 bg-gray-800 rounded animate-pulse w-40"></div></TableCell>
                  <TableCell><div className="h-4 bg-gray-800 rounded animate-pulse w-24"></div></TableCell>
                  <TableCell><div className="h-4 bg-gray-800 rounded animate-pulse w-16"></div></TableCell>
                  <TableCell><div className="h-4 bg-gray-800 rounded animate-pulse w-20"></div></TableCell>
                  <TableCell><div className="h-6 bg-gray-800 rounded animate-pulse w-16"></div></TableCell>
                  <TableCell><div className="h-8 bg-gray-800 rounded animate-pulse w-24"></div></TableCell>
                </TableRow>
              ))
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-400">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="border-gray-800">
                  <TableCell className="font-medium font-mono">
                    #{customer.id?.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>
                    <a 
                      href={`https://wa.me/${customer.phone?.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 underline"
                    >
                      {customer.phone}
                    </a>
                  </TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                  <TableCell>
                    {customer.dateOfBirth ? (
                      new Date(customer.dateOfBirth).toLocaleDateString()
                    ) : '-'}
                  </TableCell>
                  <TableCell>{customer.totalVisits || 0}</TableCell>
                  <TableCell>₹{(customer.totalSpent || 0).toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Badge variant={customer.loyaltyStatus === 'Gold' ? 'default' : 'secondary'}>
                      {customer.loyaltyStatus || 'Bronze'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/admin/customers/${customer.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedCustomer(customer)
                          setShowForm(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(customer.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
