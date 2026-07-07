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
import { getAllCustomers, searchCustomers, deleteCustomer } from '@/lib/api/customers'
import { Customer } from '@/types/database.types'
import CustomerForm from '@/components/admin/CustomerForm'
import { utils, writeFile } from 'xlsx'
import { toast } from '@/hooks/use-toast'

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      handleSearch()
    } else {
      setFilteredCustomers(customers)
    }
  }, [searchQuery, customers])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const data = await getAllCustomers()
      setCustomers(data)
      setFilteredCustomers(data)
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
      const results = await searchCustomers(searchQuery)
      setFilteredCustomers(results)
    } catch (error) {
      console.error('Search error:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return

    try {
      await deleteCustomer(id)
      toast({
        title: 'Success',
        description: 'Customer deleted successfully',
      })
      loadCustomers()
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
      'Customer ID': customer.customer_id,
      'Full Name': customer.full_name,
      'Mobile': customer.mobile_number,
      'Email': customer.email || '',
      'Date of Birth': customer.date_of_birth || '',
      'Gender': customer.gender || '',
      'City': customer.city || '',
      'Total Visits': customer.total_visits,
      'Total Spent': customer.total_spent,
      'Member Since': new Date(customer.member_since).toLocaleDateString(),
      'Status': customer.status,
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
              <TableHead>Mobile</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Total Visits</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Member Since</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-gray-400">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="border-gray-800">
                  <TableCell className="font-medium">{customer.customer_id}</TableCell>
                  <TableCell>{customer.full_name}</TableCell>
                  <TableCell>
                    <a 
                      href={`https://wa.me/${customer.mobile_number.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 underline"
                    >
                      {customer.mobile_number}
                    </a>
                  </TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                  <TableCell>
                    {customer.date_of_birth ? (
                      <div className="flex items-center gap-2">
                        <span>{new Date(customer.date_of_birth).toLocaleDateString('en-IN')}</span>
                        {(() => {
                          const today = new Date();
                          const dob = new Date(customer.date_of_birth);
                          const thisYear = today.getFullYear();
                          let nextBirthday = new Date(thisYear, dob.getMonth(), dob.getDate());
                          if (nextBirthday < today) {
                            nextBirthday = new Date(thisYear + 1, dob.getMonth(), dob.getDate());
                          }
                          const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                          if (daysUntil >= 0 && daysUntil <= 7) {
                            return <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">🎂 {daysUntil === 0 ? 'Today!' : `In ${daysUntil}d`}</Badge>;
                          }
                          return null;
                        })()}
                      </div>
                    ) : (
                      <span className="text-gray-500">Not provided</span>
                    )}
                  </TableCell>
                  <TableCell>{customer.total_visits}</TableCell>
                  <TableCell>₹{customer.total_spent.toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(customer.member_since).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={customer.status === 'active' ? 'default' : 'secondary'}
                    >
                      {customer.status}
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
